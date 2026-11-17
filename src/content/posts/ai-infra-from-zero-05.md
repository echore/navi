---
title: "How Does a Model Learn from Its Own Attempts?"
titleZh: "让模型从自己的尝试中学习：RL Infrastructure 真正在解决什么？"
lang: en
tags: ["AI"]
date: 2026-11-16
readTime: 18
slug: ai-infra-from-zero-05
series: "AI Infra Track Technology"
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">
<link rel="stylesheet" href="/styles/infra-note-05.css">

<div class="lang-en">
<div class="infra-note infra-note--gpu infra-05">
<div class="series">AI Infra Learning Notes · 05 / 05</div>
<div class="meta">From post-training and agentic rollouts to Miles, asynchronous RL, and the diagnostic work behind a surprising result: <strong>GPU utilization ↑, task success ↓.</strong></div>
<p class="note">This is Part 05 of an AI infrastructure learning series. Earlier chapters covered how an LLM generates tokens, why GPUs become bottlenecks, how serving systems schedule work, and what SGLang optimizes. This chapter asks what changes when the objective is not to serve a model, but to <em>improve the model itself</em>. We use one hypothetical Qwen coding-agent startup throughout. All numerical examples and experiments here are illustrative, not measured Miles results.</p>

<section id="en-00" class="section"><h2><span class="num">00</span> Our GPUs are busier. Why did the agent get worse?</h2>
<p>Imagine a coding-agent team switching from synchronous to asynchronous reinforcement learning (RL). The infrastructure dashboard celebrates a substantial improvement in resource utilization. The evaluation dashboard tells a different story.</p>
<div class="grid2"><div class="metric"><small>GPU utilization</small><div class="value green">55% → 90%</div><div class="note">+35 percentage points · system efficiency</div></div><div class="metric"><small>Verified task success</small><div class="value red">65% → 58%</div><div class="note">−7 percentage points · model outcome</div></div></div>
<div class="pull">A faster pipeline isn't necessarily a better learning pipeline.</div>
<p>This contradiction is our anchor case study. But before diagnosing it, we need a mental model of what post-training actually does, why the RL loop requires distributed infrastructure, and how correctness can be lost between rollout and training.</p></section>

<section id="en-01" class="section"><h2><span class="num">01</span> Knowing how to write code isn't the same as finishing a coding task.</h2>
<p>Pretraining gives a language model a broad capacity to predict tokens, represent patterns, and generate code. It doesn't directly optimize the entire sequence of decisions required to fix a bug, operate tools, evaluate an error, and try again.</p>
<div class="fig"><div class="fighead"><span class="figtitle">FIG 01 · Different learning signals</span></div><div class="grid2">
<div class="mini"><div class="over">Pretraining</div><strong>Learn patterns in data</strong><p>General language, code, and knowledge through token prediction.</p></div>
<div class="mini"><div class="over">SFT</div><strong>Learn from demonstrations</strong><p>Imitate strong instruction responses or high-quality agent trajectories.</p></div>
<div class="mini"><div class="over">Preference optimization</div><strong>Learn which outputs are preferred</strong><p>Use preference comparisons; methods differ in whether online RL is involved.</p></div>
<div class="mini"><div class="over">RL post-training</div><strong>Learn from evaluated attempts</strong><p>Generate experiences, score them, and optimize future policy behavior.</p></div>
</div><p class="figcap">A conceptual taxonomy, not a mandatory four-step training sequence. Preference-based methods overlap with RLHF; DPO is one example that does not require the same online rollout loop.</p></div>
<p>For a coding agent, supervised fine-tuning (SFT) can teach the pattern “inspect → edit → test → report.” RL can provide feedback on whether the attempted fix actually passed meaningful checks. But a reward is only a signal: <strong>passing an incomplete test suite does not guarantee real task success.</strong></p></section>

<section id="en-02" class="section"><h2><span class="num">02</span> From one attempted fix to a change in model weights.</h2>
<div class="fig"><div class="fighead"><span class="figtitle">FIG 02 · One agentic RL iteration, simplified</span></div>
<div class="diagramstack">
<div class="node"><b>Task / prompt</b><small>“Find and fix the empty-form crash”</small></div><div class="arrow">↓</div>
<div class="node blue"><b>Policy model → rollout</b><small>Generate actions · read files · modify code · call tools · observe test results</small></div><div class="arrow">↓</div>
<div class="node"><b>Verifier / reward</b><small>Evaluate the full trajectory, not just the fluency of an answer</small></div><div class="arrow">↓</div>
<div class="node green"><b>Advantage → RL objective → gradients</b><small>Translate rewards into a training signal, then update parameters</small></div><div class="arrow">↓</div>
<div class="node"><b>Updated policy → new rollout</b><small>The next iteration samples actions using the new weights</small></div>
</div><p class="figcap">A rollout may include many steps and tool calls. The agent can adapt within its context during a rollout, but permanent weight changes require an explicit training update.</p></div>
<div class="grid3"><div class="mini"><div class="over">Inference</div><strong>Use weights</strong><p>A completed task doesn't automatically retrain the LLM.</p></div><div class="mini"><div class="over">Rollout</div><strong>Collect experience</strong><p>The action–observation trajectory produced by the current policy.</p></div><div class="mini"><div class="over">Training</div><strong>Change weights</strong><p>Compute an objective and gradients; update the model parameters.</p></div></div>
<h3>Why not just reward successful trajectories?</h3><p>Reward tells us <em>how the attempt was evaluated</em>; it doesn't by itself specify the gradient for billions of parameters. Advantage-based policy-gradient algorithms compare outcomes with a reference level and use those differences to adjust action probabilities.</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Concept</th><th>Useful intuition</th><th>Limit</th></tr></thead><tbody><tr><td>Advantage</td><td>Better or worse than an appropriate baseline?</td><td>Baseline and credit assignment must be chosen carefully.</td></tr><tr><td>PPO</td><td>Use policy-gradient updates while limiting overly large policy changes.</td><td>Clipping improves stability but doesn't guarantee it.</td></tr><tr><td>GRPO</td><td>Compare multiple responses to the same prompt using group-relative rewards, without a separately trained value model in the standard formulation.</td><td>Quality depends on grouping, rewards, and implementation details.</td></tr></tbody></table></div></section>

<section id="en-03" class="section"><h2><span class="num">03</span> Serving a model and improving a model require different workers.</h2>
<p>Rollout workers perform generation, often interrupted by tool execution. Training workers run forward/backward passes and gradient optimization. A verifier evaluates trajectories. An orchestrator manages data movement, progress, and synchronization. If one stage is slower, another may sit idle.</p>
<div class="fig"><div class="fighead"><span class="figtitle">FIG 03 · A synchronous 12-minute iteration</span></div>
<div class="side-by-side"><div class="panel"><div class="panel-title">Rollout GPU pool</div><div class="rowbar" style="width:83.333%">Generate · 10 min</div><div class="rowbar gray" style="width:16.667%">2m</div></div><div class="panel"><div class="panel-title">Training GPU pool</div><div class="rowbar gray" style="width:83.333%">Waiting · 10 min</div><div class="rowbar green" style="width:16.667%">Train</div></div></div><p class="figcap">Illustrative time proportions. Each horizontal pair is a phase description, not a clock-synchronized Gantt chart. Assumes separate GPU pools and strictly sequential steps.</p></div>
<h3>Synchronous vs. asynchronous</h3><div class="grid2"><div class="mini"><div class="over">Synchronous RL</div><strong>Generate → train → refresh</strong><p>Easier to reason about policy versions; may leave GPUs idle when phases have different durations.</p></div><div class="mini"><div class="over">Asynchronous RL</div><strong>Overlap stages through a buffer</strong><p>Higher potential utilization; introduces buffered data, policy-version lag, and synchronization decisions.</p></div></div>
<div class="fig"><div class="fighead"><span class="figtitle">FIG 04 · A simplified async workflow</span></div><div class="diagramstack"><div class="node blue"><b>SGLang rollout workers</b><small>Generate agent trajectories while training proceeds</small></div><div class="arrow">↓</div><div class="node amber"><b>Completed trajectory buffer</b><small>Separates production from consumption; bounded capacity and staleness policies</small></div><div class="arrow">↓</div><div class="node green"><b>Training workers</b><small>Consume trajectory groups and update policy weights</small></div><div class="arrow">↻</div><div class="node"><b>Weight synchronization</b><small>Publish newer weights to generation workers, with in-flight consistency handling</small></div></div><p class="figcap">Real implementations may overlap data movement, verification, and compute. The diagram is a responsibility map rather than a complete process graph.</p></div>
<h3>Policy staleness: the hidden price of overlap</h3><p>A trajectory produced by policy V3 might only be consumed when the trainer has reached V6. That makes the sample <em>off-policy</em> relative to V6. The model that generated the experience and the one being optimized are no longer identical.</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sample</th><th>Generated with</th><th>Consumed by</th><th>Version lag</th></tr></thead><tbody><tr><td>A</td><td>V6</td><td>V6</td><td>0</td></tr><tr><td>B</td><td>V5</td><td>V6</td><td>1</td></tr><tr><td>C</td><td>V3</td><td>V6</td><td>3</td></tr></tbody></table></div>
<p>Frequent weight synchronization generally makes samples fresher but costs transfer and coordination time. Infrequent synchronization reduces overhead but risks greater lag. Discarding stale samples protects learning at the cost of wasted rollouts. None of these knobs has a universally optimal setting.</p></section>

<section id="en-04" class="section"><h2><span class="num">04</span> What does a real RL infrastructure framework coordinate?</h2>
<p>Miles is an open RL post-training framework. Its documented loop connects <strong>SGLang-based rollouts</strong>, <strong>training backends such as Megatron-LM or PyTorch FSDP</strong>, and <strong>weight synchronization</strong>, with support for agent environments and asynchronous execution. It does not replace the language model, verification task, or every training library. <a href="#references-en">[1–3]</a></p>
<div class="fig"><div class="fighead"><span class="figtitle">FIG 05 · Miles as an orchestration layer</span></div><div class="flowrow"><div class="step"><b>Task set</b><small>Code challenges</small></div><div class="step blue"><b>SGLang</b><small>Rollout generation</small></div><div class="step"><b>Verifier</b><small>Reward / tests</small></div><div class="step green"><b>Trainer</b><small>Megatron / FSDP</small></div><div class="step"><b>Weights</b><small>Publish new policy</small></div></div><div class="callout" style="margin-bottom:0"><p><strong>Cross-cutting coordination:</strong> distributed worker orchestration · rollout buffering · synchronization · consistency checks · experiment reliability.</p></div><p class="figcap">Simplified logical sequence; in fully asynchronous mode, generation and training can overlap. Adapted from the Miles technical report and documentation. <a href="#references-en">[1–3]</a></p></div>
<p>Why adopt an additional framework? Not because “more configuration” is inherently valuable, but because maintaining distributed rollout, training, synchronization and consistency machinery internally can consume valuable research time. Adoption is worthwhile only when these savings exceed integration, compatibility, and operational costs.</p></section>

<section id="en-05" class="section"><h2><span class="num">05</span> Two subtle mismatches: TITO and R3.</h2>
<p>Async coordination addresses the <em>timing</em> of data. Another class of problem asks whether training sees the <em>same computation</em> that occurred during rollout.</p>
<div class="grid2"><div class="mini"><div class="over">Token consistency</div><strong>TITO · Token-In-Token-Out</strong><p>When agents parse tools or reconstruct multi-turn chat, the resulting token sequence can change. TITO preserves the exact rollout token IDs and appends new messages without needlessly re-tokenizing the past.</p></div><div class="mini"><div class="over">Expert consistency</div><strong>R3 · Rollout Routing Replay</strong><p>For Mixture-of-Experts models, a tiny numerical difference can change which experts process a token. R3 records and replays rollout-time expert assignments during training.</p></div></div>
<h3>MoE from first principles: attention → FFN → experts</h3><p>In a Transformer, attention mixes contextual information across token positions; the feed-forward network (FFN) nonlinearly transforms each position's representation using shared weights. In many MoE blocks, several expert FFNs replace the single dense FFN; a router selects a subset for each token.</p>
<div class="fig"><div class="fighead"><span class="figtitle">FIG 06 · Dense FFN vs. routed expert FFNs</span></div><div class="grid2"><div class="panel"><div class="panel-title">Dense Transformer block</div><div class="node blue"><b>Context-aware token vector</b></div><div style="text-align:center">↓</div><div class="node"><b>One FFN</b><small>Applied to every token position</small></div></div><div class="panel"><div class="panel-title">MoE Transformer block</div><div class="node blue"><b>Context-aware token vector</b></div><div style="text-align:center">↓</div><div class="node"><b>Router selects experts</b></div><div class="expert-grid"><div class="expert active">E1</div><div class="expert">E2</div><div class="expert active">E3</div><div class="expert">E4</div></div></div></div><p class="figcap">Simplified per-layer view, not the entire Transformer. Experts are subnetworks, not separate human-like specialists; specialization emerges from training. Selection of E1 and E3 is hypothetical.</p></div>
<div class="callout"><p><strong>Why R3 matters:</strong> if rollout used experts E1 + E3 but training recomputes E1 + E4, the computational path and gradient recipients differ. R3 replays the original routing. Dense models have no MoE routing to replay. Neither TITO nor R3 automatically fixes stale weight versions. <a href="#references-en">[1, 2]</a></p></div></section>

<section id="en-06" class="section"><h2><span class="num">06</span> How to investigate a drop from 65% to 58%—without jumping to conclusions.</h2>
<p>This was the most useful exercise in the session. It illustrates what an evidence-based infrastructure investigation should actually look like.</p>
<div class="fig"><div class="fighead"><span class="figtitle">FIG 07 · The measured symptoms (hypothetical)</span></div><div class="comparison"><div class="panel"><div class="panel-title">GPU utilization</div><p style="margin:0 0 7px;color:#718078;font-size:12px">Before · 55%</p><div class="track"><span style="width:55%;background:#8babb0"></span></div><p style="margin:12px 0 7px;color:#718078;font-size:12px">After · 90%</p><div class="track"><span style="width:90%;background:#478273"></span></div></div><div class="panel"><div class="panel-title">Task success (same evaluation, if verified)</div><p style="margin:0 0 7px;color:#718078;font-size:12px">Before · 65%</p><div class="track"><span style="width:65%;background:#478273"></span></div><p style="margin:12px 0 7px;color:#718078;font-size:12px">After · 58%</p><div class="track"><span style="width:58%;background:#ae7370"></span></div></div></div><p class="figcap">Invented teaching values. A decline from 65% to 58% is 7 <em>percentage points</em>, not a relative 7% change. Its reliability depends on evaluation sample size, task design, and uncertainty.</p></div>
<div class="callout warn"><p><strong>First principle:</strong> policy staleness is a plausible explanation, not a proven cause. The goal is to find discriminating evidence, not to retrofit every observation to our favorite mechanism.</p></div>
<h3>Investigation protocol: five steps</h3>
<div class="fig">
<div class="stage"><div class="n">01</div><div><h4>Verify the outcome</h4><p>Compare the same held-out coding tasks, starting model, decoding/evaluation protocol, resource budget and checkpoint selection. Re-run evaluations and quantify uncertainty.</p><div class="detail">Evidence → Is the 7-point drop reproducible and meaningful, rather than sample noise or an evaluation change?</div></div></div>
<div class="stage"><div class="n">02</div><div><h4>Instrument the full pipeline</h4><p>Separate rollout latency, environment/test time, queue occupancy, training step time, synchronization pauses and failed jobs. Track model version per trajectory and compute age at consumption.</p><div class="detail">Evidence → Where did execution behavior change? Are old trajectories accumulating?</div></div></div>
<div class="stage"><div class="n">03</div><div><h4>Write competing hypotheses</h4><p>Policy staleness; numerical or token/routing mismatch; reward or verifier drift; altered task sampling; unstable learning updates; evaluation inconsistency.</p><div class="detail">Evidence → What prediction would differ if each hypothesis were true?</div></div></div>
<div class="stage"><div class="n">04</div><div><h4>Run controlled ablations</h4><p>Compare synchronous baseline, async with frequent synchronization, and async with longer intervals or a different max-staleness threshold. Hold model, tasks, reward, and budgets as comparable as possible; repeat across seeds.</p><div class="detail">Evidence → Does reducing lag restore quality, and at what throughput cost?</div></div></div>
<div class="stage"><div class="n">05</div><div><h4>Decide on the metric that matters</h4><p>Report verified success, run-to-run variance, time to target success, GPU-hours to target, failed-run frequency and engineering cost. Choose a configuration only after balancing all of them.</p><div class="detail">Evidence → Does the new system improve useful model progress, not merely hardware occupancy?</div></div></div>
</div>
<h3>Turn assumptions into experiments</h3>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Hypothesis</th><th>What to measure</th><th>A discriminating test</th></tr></thead><tbody>
<tr><td>Excessive staleness</td><td>Weight-version lag distribution; stale samples filtered; quality by lag bucket</td><td>Cap lag / synchronize more often, then compare learning curves</td></tr>
<tr><td>Rollout–training mismatch</td><td>Token-ID consistency, MoE routing agreement where relevant, rollout/trainer log-prob discrepancies</td><td>Enable applicable consistency checks; test impact under matched conditions</td></tr>
<tr><td>Reward / verifier problem</td><td>Reward distribution, test coverage, evaluator changes, mismatch between reward and held-out success</td><td>Freeze or independently audit verifier; evaluate against stable held-out tasks</td></tr>
<tr><td>Training instability</td><td>Loss, KL behavior, gradient norms, reward collapse, seed variability</td><td>Control update strength or algorithm settings; rerun comparable experiments</td></tr>
<tr><td>Noncomparable evaluation</td><td>Task IDs, environment versions, sample size, decoding settings, confidence interval</td><td>Re-evaluate both checkpoints using identical methodology</td></tr>
</tbody></table></div>
<h3>Experimental comparison</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Run</th><th>Configuration</th><th>Question it answers</th></tr></thead><tbody><tr><td>A · Control</td><td>Synchronous RL</td><td>What quality and cost do we get without async staleness?</td></tr><tr><td>B · Async, fresh</td><td>Frequent updates / strict lag cap</td><td>Does fresher experience recover quality?</td></tr><tr><td>C · Async, loose</td><td>Less frequent updates / relaxed lag cap</td><td>How much throughput do we gain, and at what quality risk?</td></tr></tbody></table></div>
<div class="callout"><p><strong>How we interpret results:</strong> if B restores quality while preserving most of the throughput gain, that supports the staleness hypothesis. If B does not, keep investigating. Correlation between lag and quality alone is not enough to establish causality.</p></div>
<h3>The metrics, translated into plain English</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Metric</th><th>Question</th><th>Don't confuse it with...</th></tr></thead><tbody>
<tr><td>Task success rate</td><td>How often does the agent genuinely solve held-out tasks?</td><td>A training job finishing without errors</td></tr>
<tr><td>Experiment completion rate</td><td>How often do planned training runs finish successfully?</td><td>The agent's ability to fix bugs</td></tr>
<tr><td>Rollout throughput</td><td>How many trajectories are produced per unit time?</td><td>How much model quality improves</td></tr>
<tr><td>GPU utilization</td><td>How busy are the accelerators?</td><td>Cost-effectiveness or customer value</td></tr>
<tr><td>Time / GPU-hours to target</td><td>How much real time and compute are required to reach a defined quality level?</td><td>Maximum raw generation speed</td></tr>
</tbody></table></div><p>If each of 100 tasks has only pass/fail outcomes, 65% success corresponds to 65 solved tasks and 35 failed tasks. That's a <em>task</em> failure rate of 35%—not an infrastructure job-failure rate. With only 100 evaluations, uncertainty can be substantial; don't automatically infer a real regression without repeated or appropriately powered testing.</p></section>

<section id="en-07" class="section"><h2><span class="num">07</span> Research productivity is the customer outcome—not just tokens per second.</h2>
<p>Suppose a startup needs 14 days to complete one RL experiment, even after GPU utilization improves. The next question isn't “Which kernel do we optimize?” It's “Where do the 14 days go?”</p>
<div class="fig"><div class="fighead"><span class="figtitle">FIG 08 · A hypothetical 14-day experiment</span></div><div class="grid4"><div class="mini"><div class="over">Setup</div><strong>4 days</strong><p>Environments &amp; rewards</p></div><div class="mini"><div class="over">Generation</div><strong>5 days</strong><p>Agent rollouts</p></div><div class="mini"><div class="over">Training</div><strong>2 days</strong><p>Gradient updates</p></div><div class="mini"><div class="over">Evaluation</div><strong>3 days</strong><p>Test &amp; debug</p></div></div><div class="track" style="margin-top:19px;height:19px;gap:0"><span style="width:28.57%;background:#9bb8b3"></span><span style="width:35.71%;background:#517f99"></span><span style="width:14.29%;background:#5e8d76"></span><span style="width:21.43%;background:#c7ad85"></span></div><p class="figcap">Invented sequential timeline. In real experiments, phases can overlap. The purpose is to locate end-to-end delay, not assume all time is GPU training.</p></div>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Observed delay</th><th>Investigate first</th><th>Possible leverage</th></tr></thead><tbody><tr><td>Environment setup</td><td>Sandbox creation, reproducibility, reward/test design</td><td>Reusable templates, automation, clear failure reporting</td></tr><tr><td>Rollout generation</td><td>Inference vs. tool time; long-tail trajectories; concurrency</td><td>Better serving, parallel environments, controlled buffering</td></tr><tr><td>Training</td><td>GPU scaling, synchronization overhead, batch configuration</td><td>Appropriate training backend and data flow</td></tr><tr><td>Evaluation</td><td>Unstable tests, manual debugging, inconsistent measurement</td><td>Stable harness, observability, automated comparisons</td></tr></tbody></table></div>
<div class="pull">Workload → Bottleneck → Mechanism → Trade-off → Customer Value.</div>
<h3>How to evaluate whether Miles is worth adopting</h3><p>Compare an existing pipeline and a Miles-based pipeline under controlled conditions. Measure not just rollout speed, but experiment lead time, failure recovery, engineering effort, model success, and the total GPU-hours to reach a target quality. A faster framework may not be the right investment if integration consumes months or if the real bottleneck is reward design.</p>
<div class="callout"><p><strong>Decision example:</strong> Solution A generates 40% more rollouts per hour. Solution B reaches the same target success rate using 25% fewer GPU-hours. Under comparable conditions, B is often the stronger cost-efficiency story—but wall-clock time, reliability, and integration costs still determine the actual choice.</p></div></section>

<section id="en-08" class="section"><h2><span class="num">08</span> Five questions to carry into any infrastructure conversation.</h2>
<div class="fig"><div class="stage"><div class="n">1</div><div><h4>Who is the customer—and what are they trying to accomplish?</h4><p>Research lab? Coding-agent startup? Enterprise AI team? Their workflows and constraints differ.</p></div></div><div class="stage"><div class="n">2</div><div><h4>What is the actual bottleneck?</h4><p>Inference, environment execution, model updates, data quality, debugging, or evaluation?</p></div></div><div class="stage"><div class="n">3</div><div><h4>What engineering mechanism addresses it?</h4><p>Understand what the feature <em>does</em>, not just its name.</p></div></div><div class="stage"><div class="n">4</div><div><h4>Which trade-offs appear?</h4><p>Staleness, communication, compatibility, operational complexity, and quality risks.</p></div></div><div class="stage"><div class="n">5</div><div><h4>What evidence would prove customer value?</h4><p>Faster reliable experiments, lower total cost, or improved task success at a given budget.</p></div></div></div>
<p>These notes intentionally preserve the <em>investigation method</em> behind the 65% → 58% example: establish a valid baseline, locate changed mechanisms, write rival hypotheses, run controlled ablations, and decide using customer-relevant metrics. This reasoning transfers to far more than RL infrastructure.</p></section>

<section id="references-en" class="refs"><h3>References &amp; Boundaries</h3><ol>
<li><a href="https://arxiv.org/abs/2609.08368" target="_blank" rel="noopener">Miles v0.1: Production-Level Post-Training (technical report)</a> — overall architecture, training, synchronization and consistency.</li>
<li><a href="https://www.lmsys.org/blog/2026-08-18-miles-v0-1/" target="_blank" rel="noopener">LMSYS / Miles v0.1 technical overview</a> — agentic rollouts, fully async RL, TITO and R3.</li>
<li><a href="https://github.com/radixark/miles/blob/main/docs/user-guide/fully-async.md" target="_blank" rel="noopener">Miles fully asynchronous RL documentation</a> — queues, staleness controls, and worker coordination.</li>
<li><a href="https://arxiv.org/abs/1707.06347" target="_blank" rel="noopener">Schulman et al., Proximal Policy Optimization Algorithms</a> — PPO.</li>
<li><a href="https://arxiv.org/abs/2402.03300" target="_blank" rel="noopener">DeepSeekMath: Pushing the Limits of Mathematical Reasoning</a> — GRPO.</li>
</ol><p class="figcap">Scope: figures simplify real architectures; the Qwen coding-agent company and all metrics (55%, 90%, 65%, 58%, 14 days, etc.) are hypothetical teaching examples. This is an independent educational synthesis—not a measured benchmark, product endorsement, or statement about any real organization's private experiments.</p></section>

<div class="next"><a class="previous" href="/posts/ai-infra-from-zero-04">← Previous: Part 04 · What Makes an Inference Engine Actually Useful?</a></div>
</div>
</div>

<div class="lang-zh">
<div class="infra-note infra-note--gpu infra-05">
<div class="series">AI Infra Learning Notes · 05 / 05</div>
<div class="meta">从 Post-training、Agentic Rollout 到 Miles 与 Asynchronous RL，再到一个值得认真推敲的案例：<strong>GPU 利用率上升，Coding Agent 成功率却下降了。</strong></div>
<p class="note">这是「AI Infra Learning Notes」的 Part 05。前四篇讨论了 LLM 如何生成、GPU 为什么成为瓶颈、Serving System 如何调度，以及 SGLang 的设计。现在，我们把问题从「如何高效运行模型」推进到「如何让模型通过训练真正变好」。全文以一个假想的 Qwen Coding Agent startup 贯穿；所有数字和实验都是教学案例，并非 Miles 的真实测量结果。</p>

<section id="zh-00" class="section"><h2><span class="num">00</span> GPU 更忙了，为什么 Agent 反而变差了？</h2>
<p>假设一家 Coding Agent startup 从 Synchronous RL 改为 Asynchronous RL。基础设施指标看起来变好了，但模型评估却给出了相反的信号。</p>
<div class="grid2"><div class="metric"><small>GPU utilization · GPU 利用率</small><div class="value green">55% → 90%</div><div class="note">提高 35 个百分点 · 系统效率</div></div><div class="metric"><small>Task success rate · 任务成功率</small><div class="value red">65% → 58%</div><div class="note">降低 7 个百分点 · 模型效果</div></div></div>
<div class="pull">让系统跑得更快，不等于让模型学得更好。</div>
<p>我们会把这组数字作为贯穿全文的核心案例。不过，要真正定位原因，先得理解 RL 的训练循环、分布式组件，以及 Rollout 和 Training 之间可能出现的各种不一致。</p></section>

<section id="zh-01" class="section"><h2><span class="num">01</span> 会写代码，不等于能把一项编程任务真正做完。</h2>
<p>Pretraining 让模型学习预测 token，也学到了语言、代码和大量模式，但它并没有直接优化「查找 bug → 调用工具 → 修改文件 → 运行测试 → 失败后重试」这一整套任务流程。</p>
<div class="fig"><div class="fighead"><span class="figtitle">图 01 · 四类不同的学习信号</span></div><div class="grid2">
<div class="mini"><div class="over">Pretraining</div><strong>从数据模式中学习</strong><p>通过 token prediction 学会通用知识、语言和代码模式。</p></div>
<div class="mini"><div class="over">SFT</div><strong>从高质量示范中学习</strong><p>模仿理想的指令回答或 Agent 操作轨迹。</p></div>
<div class="mini"><div class="over">Preference Optimization</div><strong>从偏好比较中学习</strong><p>比较哪些输出更符合目标；不同方法不一定使用在线 RL。</p></div>
<div class="mini"><div class="over">RL Post-training</div><strong>从被评估的尝试中学习</strong><p>生成行为、获得反馈，再优化未来的 Policy。</p></div>
</div><p class="figcap">这是概念分类，不代表训练必须严格经历四个阶段。Preference Optimization 与 RLHF 有交叉；DPO 等方法不需要相同的在线 rollout 循环。</p></div>
<p>对于 Coding Agent，SFT 可以示范「先查看文件，再修改，最后运行测试」；RL 则可以从实际尝试的结果中得到反馈。但 <strong>Reward 只是训练信号，不一定等于真实的任务成功</strong>——通过一套不完整的测试，仍然可能修错代码。</p></section>

<section id="zh-02" class="section"><h2><span class="num">02</span> 从一次修 bug，到真正更新模型权重。</h2>
<div class="fig"><div class="fighead"><span class="figtitle">图 02 · 一轮 Agentic RL（简化）</span></div><div class="diagramstack">
<div class="node"><b>Task / Prompt</b><small>「修复空表单提交导致程序崩溃的问题」</small></div><div class="arrow">↓</div>
<div class="node blue"><b>Policy Model → Rollout</b><small>生成动作 · 读文件 · 改代码 · 调用工具 · 读取测试结果</small></div><div class="arrow">↓</div>
<div class="node"><b>Verifier / Reward</b><small>评估整段轨迹与任务结果，而不仅仅是回答是否流畅</small></div><div class="arrow">↓</div>
<div class="node green"><b>Advantage → Loss → Gradient Update</b><small>把 Reward 转换成训练信号，再更新模型参数</small></div><div class="arrow">↓</div>
<div class="node"><b>Updated Policy → New Rollout</b><small>下一轮使用更新后的 weights 生成新尝试</small></div>
</div><p class="figcap">一次 Rollout 可以包含多次 tool calls 和多个操作步骤。Agent 在当前上下文中可以根据测试结果调整做法，但这并不意味着模型参数自动更新。</p></div>
<div class="grid3"><div class="mini"><div class="over">Inference</div><strong>使用既有权重</strong><p>完成一次任务，不会自动让 LLM 训练一次。</p></div><div class="mini"><div class="over">Rollout</div><strong>收集一次尝试</strong><p>由当前 Policy 生成的行动与观察轨迹。</p></div><div class="mini"><div class="over">Training</div><strong>修改模型权重</strong><p>计算 Loss 与 Gradient，更新参数。</p></div></div>
<h3>为什么不能只奖励正确答案？</h3><p>Reward 可以告诉我们尝试表现如何，但无法直接告诉数十亿参数该怎么改。Advantage 通常会把表现与某个 baseline 做比较，再借助 policy-gradient 类算法，调整未来生成这些行为的概率。</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>概念</th><th>怎么理解</th><th>需要注意什么</th></tr></thead><tbody><tr><td>Advantage</td><td>这次行动 / 轨迹，比基准表现得更好还是更差？</td><td>baseline 和 credit assignment 都重要。</td></tr><tr><td>PPO</td><td>通过限制过大的 Policy 更新来改善稳定性。</td><td>Clipping 不是训练稳定的保证。</td></tr><tr><td>GRPO</td><td>对同一个 prompt 的多个回答做 group-relative 比较，标准形式不需要单独训练 value model。</td><td>仍依赖 reward、grouping 与具体实现。</td></tr></tbody></table></div></section>

<section id="zh-03" class="section"><h2><span class="num">03</span> 运行模型，与训练模型，需要不同的 Worker。</h2>
<p>Rollout Workers 负责生成，期间可能要等外部工具；Training Workers 需要 Forward / Backward Pass 与梯度更新；Verifier 负责评估结果；Orchestration 负责协调它们。只要其中一个环节慢，其他资源就可能闲着。</p>
<div class="fig"><div class="fighead"><span class="figtitle">图 03 · 同步执行中的等待</span></div>
<div class="side-by-side"><div class="panel"><div class="panel-title">Rollout GPU Pool</div><div class="rowbar" style="width:83.333%">Generate · 10 min</div><div class="rowbar gray" style="width:16.667%">2m</div></div><div class="panel"><div class="panel-title">Training GPU Pool</div><div class="rowbar gray" style="width:83.333%">等待 · 10 min</div><div class="rowbar green" style="width:16.667%">Train</div></div></div><p class="figcap">示意性时间比例，非精确时间轴。假设两个独立 GPU Pool 严格按先生成、后训练的方式工作。</p></div>
<h3>Synchronous 与 Asynchronous 的核心区别</h3><div class="grid2"><div class="mini"><div class="over">Synchronous RL</div><strong>生成 → 训练 → 更新权重</strong><p>更容易管理版本一致性，但不同阶段速度差异大时，会出现明显等待。</p></div><div class="mini"><div class="over">Asynchronous RL</div><strong>通过 Buffer 让阶段重叠</strong><p>减少等待，但引入 Buffer 管理、Policy Staleness 和同步问题。</p></div></div>
<div class="fig"><div class="fighead"><span class="figtitle">图 04 · 异步执行的逻辑结构</span></div><div class="diagramstack"><div class="node blue"><b>SGLang Rollout Workers</b><small>训练继续进行时，也可以持续生成 Agent Trajectories</small></div><div class="arrow">↓</div><div class="node amber"><b>Completed Trajectory Buffer</b><small>连接生成与消费两个阶段；需管理容量与数据新鲜度</small></div><div class="arrow">↓</div><div class="node green"><b>Training Workers</b><small>消费轨迹组并计算 Loss、更新 Policy Weights</small></div><div class="arrow">↻</div><div class="node"><b>Weight Synchronization</b><small>把更新后的 Weights 发给 Rollout Workers，并妥善处理中途请求</small></div></div><p class="figcap">真实系统中，Verification、通信和计算可以交叠。这里展示的是职责关系。</p></div>
<h3>Policy Staleness：异步系统隐藏的代价</h3><p>假设一段轨迹是用 V3 版本生成的，却在 Trainer 更新到 V6 时才被消费。对于 V6 来说，这是一段来自旧策略的 Off-policy 数据。生成数据的模型与正在学习的模型已经不完全相同。</p>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>轨迹</th><th>生成时版本</th><th>消费时版本</th><th>Version Lag</th></tr></thead><tbody><tr><td>A</td><td>V6</td><td>V6</td><td>0</td></tr><tr><td>B</td><td>V5</td><td>V6</td><td>1</td></tr><tr><td>C</td><td>V3</td><td>V6</td><td>3</td></tr></tbody></table></div>
<p>频繁同步通常能降低 lag，但增加传输与协调开销；降低同步频率，可能提高吞吐，却增加数据过时的风险；直接丢弃旧轨迹，可以控制学习偏差，却浪费了生成成本。没有放之四海而皆准的设置。</p></section>

<section id="zh-04" class="section"><h2><span class="num">04</span> Miles 究竟协调了什么？</h2>
<p>Miles 是一套开源的 RL Post-training 框架，公开架构连接了基于 <strong>SGLang 的 Rollout</strong>、<strong>Megatron-LM / PyTorch FSDP 等训练后端</strong>以及 <strong>Weight Synchronization</strong>，并支持 Agent 环境和异步执行。它并不是要替代模型、测试环境或底层训练框架。<a href="#references-zh">[1–3]</a></p>
<div class="fig"><div class="fighead"><span class="figtitle">图 05 · Miles 的逻辑架构</span></div><div class="flowrow"><div class="step"><b>Task Set</b><small>编程任务</small></div><div class="step blue"><b>SGLang</b><small>生成 Rollout</small></div><div class="step"><b>Verifier</b><small>测试 / Reward</small></div><div class="step green"><b>Trainer</b><small>Megatron / FSDP</small></div><div class="step"><b>Weights</b><small>同步 Policy</small></div></div><div class="callout" style="margin-bottom:0"><p><strong>横跨整条链路的管理：</strong>Distributed Orchestration · Rollout Buffer · Weight Sync · Consistency Checks · Experiment Reliability。</p></div><p class="figcap">这是逻辑上的顺序；在 Fully Async 模式下，生成和训练可以同时执行。依据 Miles 技术报告及文档简化绘制。<a href="#references-zh">[1–3]</a></p></div>
<p>为什么不让团队自己写？不是因为“配置项越多越好”，而是分布式 Rollout、训练、同步与一致性机制的维护会消耗研究团队时间。要不要采用 Miles，取决于节省的工程成本、计算成本、实验时间，是否超过了迁移和运维成本。</p></section>

<section id="zh-05" class="section"><h2><span class="num">05</span> TITO 和 R3：训练的内容，真的等于生成时的内容吗？</h2>
<p>前面的 Staleness 讨论的是数据的<strong>时间</strong>；TITO 和 R3 处理的是另一类问题：Training 是否尽可能复现 Rollout 实际使用的输入与计算路径。</p>
<div class="grid2"><div class="mini"><div class="over">Token 一致性</div><strong>TITO · Token-In-Token-Out</strong><p>Agent 执行工具、转换消息格式、多轮重构上下文时，token 序列可能改变。TITO 保存 Rollout 实际生成的 Token IDs，并在后续追加新消息，避免不必要地重新 Tokenize 历史。</p></div><div class="mini"><div class="over">Expert 一致性</div><strong>R3 · Rollout Routing Replay</strong><p>在 Mixture-of-Experts 模型中，数值上的细小差异可能改变某个 token 走过的 Expert。R3 记录 Rollout 的 Expert Assignment，并在 Training 阶段 Replay。</p></div></div>
<h3>先解释 MoE：Attention → FFN → Experts</h3><p>Transformer 中，Attention 让各 token position 的信息互相影响；Feed-Forward Network（FFN）则把每个位置的上下文向量再进行非线性变换，而且对每个位置使用同一组学习到的权重。很多 MoE Block 将单个 FFN 替换为多个 Expert FFN，由 Router 为每个 token 选择其中少数几个。</p>
<div class="fig"><div class="fighead"><span class="figtitle">图 06 · Dense FFN 与 MoE 专家网络</span></div><div class="grid2"><div class="panel"><div class="panel-title">Dense Transformer Block</div><div class="node blue"><b>已有上下文的 Token Vector</b></div><div style="text-align:center">↓</div><div class="node"><b>一个 FFN</b><small>在每个 token 位置独立作用</small></div></div><div class="panel"><div class="panel-title">MoE Transformer Block</div><div class="node blue"><b>已有上下文的 Token Vector</b></div><div style="text-align:center">↓</div><div class="node"><b>Router 选择 Experts</b></div><div class="expert-grid"><div class="expert active">E1</div><div class="expert">E2</div><div class="expert active">E3</div><div class="expert">E4</div></div></div></div><p class="figcap">只画出一个层内的 FFN 相关结构，不是完整 Transformer。Expert 是网络模块，并不天然被指定为“Python 专家”或“数学专家”；E1/E3 选择仅用于举例。</p></div>
<div class="callout"><p><strong>R3 为什么重要：</strong>如果 Rollout 走 E1 + E3，但 Training 重新计算后走 E1 + E4，实际计算和获得梯度的 Expert 都不同。R3 Replay 原始 Routing。Dense Model 没有这类 MoE Routing；另外，TITO 和 R3 都不能自动解决 Weight Staleness。<a href="#references-zh">[1, 2]</a></p></div></section>

<section id="zh-06" class="section"><h2><span class="num">06</span> 65% → 58%：我们应该如何调查，而不是立刻给出结论？</h2>
<p>这是这次学习中最值得保留的一段内容：面对看起来矛盾的数据，怎样一步一步获得真正有意义的证据。</p>
<div class="fig"><div class="fighead"><span class="figtitle">图 07 · 两组看起来矛盾的指标（教学假设）</span></div><div class="comparison"><div class="panel"><div class="panel-title">GPU Utilization</div><p style="margin:0 0 7px;color:#718078;font-size:12px">Before · 55%</p><div class="track"><span style="width:55%;background:#8babb0"></span></div><p style="margin:12px 0 7px;color:#718078;font-size:12px">After · 90%</p><div class="track"><span style="width:90%;background:#478273"></span></div></div><div class="panel"><div class="panel-title">Task Success Rate</div><p style="margin:0 0 7px;color:#718078;font-size:12px">Before · 65%</p><div class="track"><span style="width:65%;background:#478273"></span></div><p style="margin:12px 0 7px;color:#718078;font-size:12px">After · 58%</p><div class="track"><span style="width:58%;background:#ae7370"></span></div></div></div><p class="figcap">均为虚构数字。65% → 58% 下降的是 7 个百分点，不是相对下降 7%。是否属于真实退步，仍取决于评估样本量、任务设计与统计不确定性。</p></div>
<div class="callout warn"><p><strong>不要急着归因：</strong>Policy Staleness 只是一个合理假设，并不是已经证明的原因。我们要寻找能够区分不同解释的证据，而不是拿每个现象来套同一个机制。</p></div>
<h3>五步排查法：从现象到决策</h3>
<div class="fig">
<div class="stage"><div class="n">01</div><div><h4>先验证结果是否可比</h4><p>核对同一套 Held-out Coding Tasks、初始模型、评估协议、算力预算与 Checkpoint 选择；重复评估，估计不确定性。</p><div class="detail">需要的证据 → 7 个百分点的下降是否可重复？会不会来自评估设置变化或随机波动？</div></div></div>
<div class="stage"><div class="n">02</div><div><h4>对整个系统做 Instrumentation</h4><p>拆分 Rollout Latency、工具 / 测试时间、Queue Size、Training Step Time、同步暂停、失败实验。记录每段 Trajectory 对应的模型版本，计算消费时的 lag。</p><div class="detail">需要的证据 → 迁移后哪个环节真的变了？是否有越来越多旧轨迹积压？</div></div></div>
<div class="stage"><div class="n">03</div><div><h4>同时列出竞争性假设</h4><p>Policy Staleness；Token / Routing 不一致；Reward / Verifier 发生变化；任务采样变了；训练更新不稳定；Evaluation 本身不一致。</p><div class="detail">需要的证据 → 如果这个假设为真，我们应该能观察到什么独特现象？</div></div></div>
<div class="stage"><div class="n">04</div><div><h4>通过 Controlled Ablation 区分原因</h4><p>比较 Synchronous Baseline、频繁同步的 Async、较长同步间隔或不同 Max Staleness 的 Async。尽量统一模型、任务、Reward、预算，并做多次重复。</p><div class="detail">需要的证据 → 降低 Staleness 后，质量是否恢复？代价是多少吞吐？</div></div></div>
<div class="stage"><div class="n">05</div><div><h4>用真正重要的指标做决定</h4><p>同时报告 Verified Success、不同 Run 之间的波动、达到目标成功率的时间、GPU-hours、失败实验比例，以及工程维护成本。</p><div class="detail">需要的证据 → 新配置究竟有没有帮助模型更高效地变好？而不是只让 GPU 更忙。</div></div></div>
</div>
<h3>让每个猜测都变成可以检验的实验</h3>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>可能的原因</th><th>先测什么</th><th>怎么验证</th></tr></thead><tbody>
<tr><td>Policy Staleness 过高</td><td>Version lag 分布、过滤掉的旧数据、不同 Lag 的训练样本表现</td><td>设置更严格的 Lag Cap / 更频繁同步，再比较 Learning Curves</td></tr>
<tr><td>Rollout / Training 不一致</td><td>Token-ID 一致性、适用时 MoE Routing 一致性、Log-prob 差异</td><td>启用适用的 Consistency Checks，在可比条件下比较</td></tr>
<tr><td>Reward / Verifier 出问题</td><td>Reward 分布、测试覆盖、验证器版本、Reward 与 Held-out Success 的关系</td><td>固定并独立审计 Verifier，使用稳定的留出任务集</td></tr>
<tr><td>训练不稳定</td><td>Loss、KL、Gradient Norm、Reward Collapse、Seed Variability</td><td>控制更新幅度与训练参数，重新跑可比实验</td></tr>
<tr><td>评估不可比</td><td>Task IDs、环境版本、Sample Size、Decoding 设置与区间估计</td><td>用完全一致的方法重新评估两个 Checkpoint</td></tr>
</tbody></table></div>
<h3>具体实验组怎么设置？</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>组别</th><th>配置</th><th>能回答什么问题</th></tr></thead><tbody><tr><td>A · Control</td><td>Synchronous RL</td><td>没有 Async Staleness 时的质量与成本基准是什么？</td></tr><tr><td>B · Async / Fresh</td><td>频繁同步或严格限制版本差</td><td>让样本更新鲜，能否恢复质量？</td></tr><tr><td>C · Async / Loose</td><td>更长同步间隔或放宽版本差</td><td>可以换来多少吞吐？会付出多少质量代价？</td></tr></tbody></table></div>
<div class="callout"><p><strong>结果怎么解读：</strong>如果 B 恢复了 Task Success，同时保留大部分吞吐收益，那么 Staleness 假设得到支持。如果没有恢复，就继续调查其他机制。Lag 与质量相关，不足以单独证明因果。</p></div>
<h3>别再把这些指标混在一起了</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>指标</th><th>它实际在问什么</th><th>不等于什么</th></tr></thead><tbody>
<tr><td>Task Success Rate</td><td>Agent 能不能真的解决 Held-out Task？</td><td>训练任务能否正常跑完</td></tr>
<tr><td>Experiment Completion Rate</td><td>计划中的训练实验有多少顺利完成？</td><td>Agent 修 bug 的能力</td></tr>
<tr><td>Rollout Throughput</td><td>单位时间能产生多少 Trajectories？</td><td>模型进步速度</td></tr>
<tr><td>GPU Utilization</td><td>GPU 有多忙？</td><td>成本效率或客户价值</td></tr>
<tr><td>Time / GPU-hours to Target</td><td>达到目标模型效果，要花多少时间和计算量？</td><td>最高的 raw token throughput</td></tr>
</tbody></table></div><p>如果 100 道题都是通过 / 不通过的二元结果，65% 的成功率就对应成功 65 道、失败 35 道。这里的 35% 是 <em>Task Failure Rate</em>，不是训练作业的失败率。只有 100 个评估样本时，不确定性可能很大，不能单凭两个数字就判定模型一定退化。</p></section>

<section id="zh-07" class="section"><h2><span class="num">07</span> 客户买的不是更高的 Tokens/s，而是更快、更可靠地改进模型。</h2>
<p>假设 GPU 利用率已经提高了，但一家 startup 仍需要 14 天才能完成一次 RL Experiment。此时应该先问：<strong>这 14 天究竟花在哪里？</strong></p>
<div class="fig"><div class="fighead"><span class="figtitle">图 08 · 一次假想的 14 天实验</span></div><div class="grid4"><div class="mini"><div class="over">Setup</div><strong>4 天</strong><p>环境与 Reward</p></div><div class="mini"><div class="over">Generation</div><strong>5 天</strong><p>Agent Rollouts</p></div><div class="mini"><div class="over">Training</div><strong>2 天</strong><p>梯度训练</p></div><div class="mini"><div class="over">Evaluation</div><strong>3 天</strong><p>评估与排错</p></div></div><div class="track" style="margin-top:19px;height:19px;gap:0"><span style="width:28.57%;background:#9bb8b3"></span><span style="width:35.71%;background:#517f99"></span><span style="width:14.29%;background:#5e8d76"></span><span style="width:21.43%;background:#c7ad85"></span></div><p class="figcap">虚构的顺序时间分解。真实流程可能部分交叠。重点是定位 End-to-End Delay，而不是假设所有时间都用于 GPU Training。</p></div>
<div class="tbl-wrap"><table class="tbl"><thead><tr><th>慢在哪里</th><th>先调查什么</th><th>可能的改善方向</th></tr></thead><tbody><tr><td>Environment Setup</td><td>Sandbox 创建、可复现性、测试与 Reward 设计</td><td>模板复用、自动化、错误反馈</td></tr><tr><td>Rollout Generation</td><td>Inference vs Tool Execution、长尾任务、并发</td><td>Serving、并行环境、Buffer 控制</td></tr><tr><td>Model Training</td><td>GPU Scaling、同步通信、Batching</td><td>合适的 Training Backend 与数据传输</td></tr><tr><td>Evaluation</td><td>不稳定测试、人工排错、测量不一致</td><td>稳定 Harness、Observability、自动比较</td></tr></tbody></table></div>
<div class="pull">Workload → Bottleneck → Engineering Mechanism → Trade-off → Customer Value</div>
<h3>怎么判断 Miles 是否值得采用？</h3><p>在相同条件下比较当前 Pipeline 与 Miles Pipeline，不仅看 Rollout Throughput，还要看实验总周期、失败恢复、工程维护、人力成本、Task Success，以及达到目标效果所需的 GPU-hours。假如真正的瓶颈是 Reward Design，换一个更快的框架未必能解决问题。</p>
<div class="callout"><p><strong>一个决策例子：</strong>方案 A 每小时生成的 Rollouts 增加 40%；方案 B 虽然生成得少，但达到同样目标成功率所需的 GPU-hours 减少 25%。如果比较公平，B 的成本效率通常更有说服力；不过最终还得考虑 Wall-clock Time、可靠性与迁移成本。</p></div></section>

<section id="zh-08" class="section"><h2><span class="num">08</span> 以后分析 Infrastructure，我会先问这五个问题。</h2>
<div class="fig"><div class="stage"><div class="n">1</div><div><h4>客户是谁？TA 真正要完成什么？</h4><p>AI Lab、Coding Agent startup、Enterprise AI Team 的 Workload 完全可能不同。</p></div></div><div class="stage"><div class="n">2</div><div><h4>真正的瓶颈在哪里？</h4><p>是 Inference、环境执行、训练、数据质量、Debugging，还是 Evaluation？</p></div></div><div class="stage"><div class="n">3</div><div><h4>技术机制具体如何解决它？</h4><p>先理解 feature 内部的因果机制，而不是只背名称。</p></div></div><div class="stage"><div class="n">4</div><div><h4>又引入了什么 Trade-off？</h4><p>Staleness、通信开销、兼容性、运维成本与质量风险。</p></div></div><div class="stage"><div class="n">5</div><div><h4>什么证据能说明它给客户创造了价值？</h4><p>更快、更可靠的实验；更低总成本；相同预算下更高的任务成功率。</p></div></div></div>
<p>其中，65% → 58% 案例最值得反复回顾。它不只是在讲某个 RL 技术，而是在练习一种可以迁移的调查方法：<strong>建立可靠基准 → 找到变化的环节 → 提出竞争性假设 → 设计受控实验 → 根据真实价值做决策。</strong></p></section>

<section id="references-zh" class="refs"><h3>参考资料与说明</h3><ol>
<li><a href="https://arxiv.org/abs/2609.08368" target="_blank" rel="noopener">Miles v0.1: Production-Level Post-Training（技术报告）</a> — 架构、训练、权重同步与一致性机制。</li>
<li><a href="https://www.lmsys.org/blog/2026-08-18-miles-v0-1/" target="_blank" rel="noopener">LMSYS / Miles v0.1 技术介绍</a> — Agentic Rollout、Fully Async RL、TITO 与 R3。</li>
<li><a href="https://github.com/radixark/miles/blob/main/docs/user-guide/fully-async.md" target="_blank" rel="noopener">Miles Fully Async RL 文档</a> — Queue、Staleness Controls 与 Worker Coordination。</li>
<li><a href="https://arxiv.org/abs/1707.06347" target="_blank" rel="noopener">Schulman et al., Proximal Policy Optimization Algorithms</a> — PPO。</li>
<li><a href="https://arxiv.org/abs/2402.03300" target="_blank" rel="noopener">DeepSeekMath: Pushing the Limits of Mathematical Reasoning</a> — GRPO。</li>
</ol><p class="figcap">说明：所有架构图都为解释机制而简化；Qwen Coding Agent startup 与 55%、90%、65%、58%、14 天等全部数据都是教学假设，不是真实 Miles Benchmark，也不反映任何公司的私有实验结果。</p></section>

<div class="next"><a class="previous" href="/posts/ai-infra-from-zero-04">← 上一篇：Part 04 · What Makes an Inference Engine Actually Useful?</a></div>
</div>
</div>
