---
title: "What Makes an Inference Engine Actually Useful?"
titleZh: "推理引擎怎样才算真正有用？"
lang: en
tags: ["AI"]
date: 2026-11-16
readTime: 15
slug: ai-infra-from-zero-04
series: "AI Infra Track Technology"
draft: false
featured: true
listed: true
wide: true
---

<link rel="stylesheet" href="/styles/infra-note-04.css">

<div class="lang-en">
<div class="infra-04">
<header class="hero">
 <div class="eyebrow"><span class="line"></span> AI INFRA LEARNING NOTES <span>·</span> 04 / 06</div>
 <h1>What Makes an Inference Engine Actually Useful?</h1><div class="dek">Inside SGLang—from RadixAttention and scheduling to the workloads, trade-offs, and customer outcomes behind every optimization.</div>
 <div class="meta-row"><span>SGLang · Serving Architecture · Product Thinking</span><span>~15 min read</span><span>November 2026</span></div>
 <div class="hero-intro"><p>This is Part 04 of my notes on learning AI infrastructure from zero. Earlier parts explained how a model computes and why serving gets hard. Here I use a Qwen-based coding agent to ask a more practical question: <strong>when does an inference optimization actually help a customer?</strong> The architecture diagrams are simplified, the example metrics are hypothetical, and the goal is to connect technical mechanisms to product decisions—not rank engines by an isolated benchmark.</p></div>
</header>
<div class="wrap">
<aside class="side"><div class="sidehead">On this page</div>
<nav id="toc" aria-label="Article contents"><a href="#s00"><span>00</span> Three complaints</a><a href="#s01"><span>01</span> SGLang architecture</a><a href="#s02"><span>02</span> RadixAttention</a><a href="#s03"><span>03</span> Scheduling</a><a href="#s04"><span>04</span> PD disaggregation</a><a href="#s05"><span>05</span> SGLang vs. vLLM</a><a href="#s06"><span>06</span> Workload atlas</a><a href="#s07"><span>07</span> A product experiment</a><a href="#s08"><span>08</span> Customer value</a></nav>
 <div class="sidenote">Workload → Bottleneck → Mechanism → Trade-off → Customer Value</div>
</aside>
<main class="article"><section id="s00"><div class="sectionhead"><span class="sectno">00</span><h2>Three complaints, three different engineering questions</h2></div>
<p class="lead">Imagine a small startup building an AI coding agent on Qwen. Its product is working, but the team hears three complaints in the same week.</p>
<div class="scene"><div class="scene-grid">
<div><div class="speaker">Developer A</div><div class="quote">“I open the same repository again and still wait several seconds for the first token.”</div><div class="under">An interactive-response problem</div></div>
<div><div class="speaker">Developer B</div><div class="quote">“It feels fine off-peak, but becomes unpredictable when everyone logs in.”</div><div class="under">A reliability / tail-latency problem</div></div>
<div><div class="speaker">Founder</div><div class="quote">“Our GPU bill keeps growing. Can we support more users without doubling it?”</div><div class="under">An economics and capacity problem</div></div>
</div></div>
<p>The temptation is to answer all three with one technical fix: more GPUs, larger batches, a faster engine. But those symptoms may come from <strong>different bottlenecks</strong>. This is where an inference engine becomes more than an engineering tool: its design choices become product choices.</p>
<div class="pull">The question is not “Which optimization is impressive?” but “Which bottleneck is limiting customer value?”</div>
<p>We'll use SGLang as a concrete system, compare it carefully with vLLM, and return to the coding agent to decide which knobs are actually worth turning.</p>
</section>
<section id="s01"><div class="sectionhead"><span class="sectno">01</span><h2>Inside an inference engine: who does what?</h2></div>
<p>Modules 01–03 explained prefill, decode, GPU bottlenecks and general serving. Here is how those pieces map to SGLang's serving runtime. The router is <strong>optional</strong>; a single-instance deployment can talk directly to the server.</p>
<figure class="figure"><div class="figtitle">FIG 01 · A SGLang request, simplified</div>
<div class="steps"><div class="step"><span class="n">01 / optional</span><strong>Router</strong><small>Select serving instance</small></div><div class="step"><span class="n">02</span><strong>API + TokenizerManager</strong><small>Prepare token IDs</small></div><div class="step primary"><span class="n">03</span><strong>Scheduler</strong><small>Build batches / admit work</small></div><div class="step"><span class="n">04</span><strong>ModelRunner + GPU</strong><small>Execute forward passes</small></div><div class="step"><span class="n">05</span><strong>Detokenizer / stream</strong><small>Return generated text</small></div></div>
<div class="bridge"><div class="bridge-row"><b>Scheduler ↔ RadixCache + KV allocator</b> &nbsp;·&nbsp; Locate reusable state, reserve or release GPU memory</div></div>
<figcaption class="figcap">Component relationships, not strict process boundaries. Source: SGLang runtime and Scheduler implementation. <a href="#refs">[1, 2]</a></figcaption></figure>
<p>The critical distinction is that the <strong>Scheduler decides what runs</strong>; the <strong>KV-cache subsystem tracks what can be reused and where it lives</strong>; and the <strong>ModelRunner / attention backend executes the remaining GPU work</strong>. An optional cluster router decides <em>which instance</em> receives the request, not the token-level execution order inside that instance.</p>
<p>For a coding agent, this separation determines whether a repeat visit can reuse repository context, whether a long prefill delays someone else's output, and whether memory pressure causes waiting or recovery.</p>
</section>
<section id="s02"><div class="sectionhead"><span class="sectno">02</span><h2>RadixAttention: reuse is a memory-management problem</h2></div>
<p>Imagine two requests that begin with the same <strong>8,000-token repository context</strong>, then diverge: “fix authentication” and “add tests.” SGLang's radix tree indexes that shared prefix and references the corresponding KV slots. It is not the place where the full K/V tensors themselves live.</p>
<figure class="figure"><div class="figtitle">FIG 02 · One shared prefix, two branches</div>
<div class="branchroot">Stable system + repository prefix <small style="display:block;font-weight:450">8,000 identical tokens · shared KV</small></div>
<div class="branchline"></div><div class="branchfork"></div>
<div class="branchcols"><div class="branchleaf">Fix authentication <span>Request A · new suffix</span></div><div class="branchleaf blue">Write tests <span>Request B · new suffix</span></div></div>
<div class="tagline">Radix tree = token-prefix index + KV slot references</div>
<div class="memorypair" style="margin-top:20px"><div class="memorybox"><strong>Tree metadata</strong>Token segments → slot indices</div><div class="memoryarrow">⇄</div><div class="memorybox alt"><strong>GPU KV pool</strong>Actual K/V tensors at those slots</div></div>
<figcaption class="figcap">Illustrative token counts and branches. Identical text in different positions is not enough: the token prefix, model state and cache conditions must match. <a href="#refs">[2, 3]</a></figcaption></figure>
<p>Under the right conditions, a second request can skip recomputing that shared portion of prefill. But <strong>8,000 reused token positions do not imply an 8,000-token-equivalent reduction in latency or GPU cost</strong>. Queueing, decode, attention kernels, cache residency, and transfer overhead still matter.</p>
<h3>Why reference counts and eviction matter</h3>
<p>When active requests reference a shared prefix, those KV slots must not be reclaimed as ordinary idle cache. When requests release their references, eligible cache leaves can be evicted under memory pressure (often using LRU). SGLang separates prefix metadata, request-to-token mappings, and GPU KV storage so metadata can be reorganized without copying the full tensors. <a class="subtle" href="#refs">[2, 3]</a></p>
<p>For a coding product, the practical design rule is <strong>stable context first, changing context later</strong>—as long as this preserves instruction semantics, correct file versions, and tenant isolation. A changing timestamp or tool result at the front can break a long reusable prefix. Caching an outdated file is worse than a slower response.</p>
</section>
<section id="s03"><div class="sectionhead"><span class="sectno">03</span><h2>Scheduling: maximizing occupancy can hurt the user</h2></div>
<p>SGLang's Scheduler coordinates waiting requests, prefill batches, running decode batches and KV-memory allocation. Its policies can consider prefix reuse; its memory-aware paths may delay or retract requests when the next execution step cannot obtain enough slots. CPU–GPU overlap can hide some scheduling work behind GPU execution, but adds synchronization complexity. <a href="#refs">[2]</a></p>
<figure class="figure"><div class="figtitle">FIG 03 · The decisions that sit between a request and the GPU</div>
<div class="diag-flow"><div class="chip gray">Waiting requests</div><span class="diagar">→</span><div class="chip">Prefix match + ordering</div><span class="diagar">→</span><div class="chip peach">KV capacity check</div><span class="diagar">→</span><div class="chip">Prefill / decode batch</div></div>
<div class="bridge"><div class="bridge-row"><strong>Not enough memory?</strong> &nbsp; Keep waiting, reclaim evictable cache, or retract / recover eligible work according to the execution path.</div></div>
<figcaption class="figcap">Request retraction is a recovery mechanism, not free preemption: it can add delay and recomputation.</figcaption></figure>
<p>A batch policy that improves aggregate tokens per second can still worsen p95 time-to-first-token (TTFT) or time-between-output-tokens (ITL). That is not just a technical trade-off. For an interactive coding assistant, it can make the tool feel unreliable precisely during peak usage.</p>
</section>
<section id="s04"><div class="sectionhead"><span class="sectno">04</span><h2>Disaggregated prefill and decode: where the handoff costs live</h2></div>
<p>Instead of sharing one worker pool, SGLang can place <strong>prefill</strong> and <strong>decode</strong> on separate workers. This lets operators tune their capacity independently—but they now have to transfer the computed KV state before decoding can continue.</p>
<figure class="figure"><div class="figtitle">FIG 04 · The handoff has a control path and a data path</div>
<div class="twolane"><div class="lane"><h4>Prefill worker</h4><div class="blk">Processes prompt, produces K/V tensors</div><div class="lane-note">Potentially optimized for long input processing</div></div><div class="lane"><h4>Decode worker</h4><div class="blk">Reserves destinations, receives KV and generates tokens</div><div class="lane-note">Potentially optimized for stable output-token cadence</div></div></div>
<div class="bridge"><div class="bridge-row"><b>Bootstrap coordination</b> · worker pairing, request metadata, destination information</div><div class="bridge-row"><b>KV transfer engine</b> · move the tensors (e.g., Mooncake / NIXL)</div></div>
<figcaption class="figcap">The diagram separates responsibilities; actual readiness checks and transfer preparation may overlap with computation. <a href="#refs">[4]</a></figcaption></figure>
<p>One current architectural choice makes the trade-off concrete. With the <code>early</code> policy, decode can reserve destination KV slots before prefill finishes. With <code>prefill_complete</code>, allocation waits until prefill is ready. The latter can reduce time spent reserving decode memory, but may leave the prefill worker holding state longer and reduce transfer overlap; the documented option also has configuration restrictions. <a href="#refs">[4]</a></p>
<p>So the win is not “two worker types are always faster.” It is <strong>less interference and more controllable prefill/decode capacity</strong> when those benefits outweigh network and coordination cost. Short prompts, light traffic or slow inter-worker links may favor simpler unified serving.</p>
</section>
<section id="s05"><div class="sectionhead"><span class="sectno">05</span><h2>SGLang vs. vLLM: compare the architecture, not a headline benchmark</h2></div>
<p>Both projects support modern serving techniques, including continuous batching, prefix caching and multi-GPU execution. The more useful comparison is how they implement those ideas and how those choices behave under a specific workload.</p>
<div class="tablewrap"><table><thead><tr><th>Design question</th><th>SGLang</th><th>vLLM (V1, documented design)</th></tr></thead><tbody><tr><td>How is cached prefix found?</td><td>Radix tree: compressed token-prefix segments referencing KV slots.</td><td>Hash-based block lookup: a block hash incorporates its content and preceding prefix.</td></tr><tr><td>How is memory protected?</td><td>Cache-node references / locks, KV allocator, eviction rules.</td><td>Reference-counted KV blocks, free-block queue, block allocation / eviction.</td></tr><tr><td>What controls execution?</td><td>Scheduler, batch construction, prefix-aware policies and memory checks.</td><td>Token-budget scheduling and KV-cache manager working together.</td></tr><tr><td>Can prefill and decode separate?</td><td>Yes; disaggregation transfer backends include Mooncake and NIXL.</td><td>Yes; disaggregated prefilling is documented as experimental.</td></tr><tr><td>Which models / GPUs?</td><td>Version- and backend-dependent; check exact model and hardware matrix.</td><td>Also version- and backend-dependent; verify specific support.</td></tr><tr><td>Which is faster?</td><td>Depends on workload, configuration, model and hardware.</td><td>Depends on the same factors; no universal winner.</td></tr></tbody></table></div>
<p>Radix tree versus hash blocks is a <em>data-structure distinction</em>, not evidence that one always has a better cache-hit rate or TTFT. Both can reuse identical prefixes. Benchmarks also depend on software versions, request distributions, cache warmup, concurrency, output length and equal hardware budgets. <a href="#refs">[5, 6, 7]</a></p>
</section>
<section id="s06"><div class="sectionhead"><span class="sectno">06</span><h2>The workload atlas: six users, six optimization hypotheses</h2></div>
<p class="lead">This is the part I find most useful from a product perspective. “Inference is slow” is not a diagnosis. It is a place to begin asking better questions.</p>
<p>Below are <strong>six common coding-agent workload shapes</strong>. Each suggests different measurements and mechanisms. They are hypotheses, not automatic prescriptions.</p>
<div class="atlas"><div class="atlas-card"><span class="index">01</span><h3>Repeated repository context</h3><dl><dt>USER EXPERIENCE</dt><dd>An agent asks follow-up questions over the same codebase.</dd><dt>POSSIBLE BOTTLENECK</dt><dd>Repeated prefill or low prefix reuse</dd><dt>CHECK FIRST</dt><dd>Cache-hit prefix length, TTFT, cache eviction</dd><dt>CANDIDATE LEVER</dt><dd>RadixAttention, stable prompt ordering</dd></dl><div class="verdict"><strong>TRADE-OFF ·</strong> Caching consumes scarce KV capacity; edits may invalidate the prefix.</div></div><div class="atlas-card"><span class="index">02</span><h3>Different users, different prompts</h3><dl><dt>USER EXPERIENCE</dt><dd>Many unrelated requests arrive with little shared context.</dd><dt>POSSIBLE BOTTLENECK</dt><dd>Low reuse; scheduling and model execution dominate</dd><dt>CHECK FIRST</dt><dd>Cache-hit distribution, queueing, TTFT/ITL</dd><dt>CANDIDATE LEVER</dt><dd>Load-aware scheduling, batching, better capacity allocation</dd></dl><div class="verdict"><strong>TRADE-OFF ·</strong> Forcing cache locality may not help.</div></div><div class="atlas-card"><span class="index">03</span><h3>Very long inputs</h3><dl><dt>USER EXPERIENCE</dt><dd>A user supplies a 40k-token repository snapshot.</dd><dt>POSSIBLE BOTTLENECK</dt><dd>Heavy prefill and KV memory footprint</dd><dt>CHECK FIRST</dt><dd>Prefill time, peak KV usage, TTFT</dd><dt>CANDIDATE LEVER</dt><dd>Chunked prefill, prefix reuse, appropriate parallelism</dd></dl><div class="verdict"><strong>TRADE-OFF ·</strong> Chunk sizing and shared memory contend with decode.</div></div><div class="atlas-card"><span class="index">04</span><h3>Long generated outputs</h3><dl><dt>USER EXPERIENCE</dt><dd>An agent produces a long refactor and explanation.</dd><dt>POSSIBLE BOTTLENECK</dt><dd>Decode steps, memory bandwidth, ongoing KV growth</dd><dt>CHECK FIRST</dt><dd>TPOT/ITL, output tokens/s, energy or cost</dd><dt>CANDIDATE LEVER</dt><dd>Decode batching, efficient attention kernels</dd></dl><div class="verdict"><strong>TRADE-OFF ·</strong> More throughput can raise per-user latency.</div></div><div class="atlas-card"><span class="index">05</span><h3>Peak-hour concurrency</h3><dl><dt>USER EXPERIENCE</dt><dd>It is fast at 9 a.m. and unpredictable at 3 p.m.</dd><dt>POSSIBLE BOTTLENECK</dt><dd>Queueing, admission limits, preemption, contention</dd><dt>CHECK FIRST</dt><dd>p95/p99 latency, queue time, retractions, goodput</dd><dt>CANDIDATE LEVER</dt><dd>Scheduler policies, admission control, capacity scaling</dd></dl><div class="verdict"><strong>TRADE-OFF ·</strong> Aggressive admission may hurt SLO attainment.</div></div><div class="atlas-card"><span class="index">06</span><h3>Dense, evolving agent context</h3><dl><dt>USER EXPERIENCE</dt><dd>The agent keeps tool outputs, diffs and file history across turns.</dd><dt>POSSIBLE BOTTLENECK</dt><dd>Context growth, cache churn, stale context risk</dd><dt>CHECK FIRST</dt><dd>KV occupancy, prefix validity, task success, E2E time</dd><dt>CANDIDATE LEVER</dt><dd>Context design, selective retrieval, session-aware caching</dd></dl><div class="verdict"><strong>TRADE-OFF ·</strong> Correctness and tenant isolation outrank a high cache-hit rate.</div></div></div>
<p>Notice how the same knob can move from helpful to irrelevant across scenarios: prefix caching matters a lot when context repeats, but may offer little for unrelated prompts or long decode-heavy generations. Disaggregation may help noisy high-concurrency deployments while adding unnecessary transfer latency to small ones.</p>
</section>
<section id="s07"><div class="sectionhead"><span class="sectno">07</span><h2>A product experiment: throughput up, useful work down</h2></div>
<p>Let's say our startup tests three configurations on the <strong>same Qwen model, hardware budget, workload mix and SLO definition</strong>. A request counts as meeting the SLO only if it completes successfully within the agreed latency limits.</p>
<p class="note"><strong>All numbers in this section are invented for teaching.</strong> They are not measured SGLang or vLLM performance.</p>
<div class="tablewrap"><table><thead><tr><th>Configuration</th><th>Completed requests/s</th><th>SLO attainment</th><th>Goodput (req/s)</th></tr></thead><tbody><tr><td>Current baseline</td><td>20</td><td>65%</td><td>13.0</td></tr><tr><td>Aggressive batching</td><td>24</td><td>50%</td><td>12.0</td></tr><tr><td>SLO-oriented scheduling</td><td>19</td><td>90%</td><td>17.1</td></tr></tbody></table></div>
<div class="bar-chart"><div class="figtitle">FIG 05 · Useful completed requests per second</div>
<div class="bar-row"><div class="bar-label">Current</div><div class="track"><div class="fill" style="width:76%"></div></div><div class="val">13.0</div></div>
<div class="bar-row"><div class="bar-label">More batching</div><div class="track"><div class="fill muted" style="width:70.2%"></div></div><div class="val">12.0</div></div>
<div class="bar-row"><div class="bar-label">SLO-oriented</div><div class="track"><div class="fill strong" style="width:100%"></div></div><div class="val">17.1</div></div>
<div class="note">Schematic bar lengths scaled to the highest goodput. Source: hypothetical example, not an external benchmark.</div></div>
<div class="formula">Goodput ≈ completed requests per second × fraction satisfying the defined SLO.</div>
<p>The “aggressive batching” configuration finishes more requests in total, yet <strong>fewer requests meet the user-relevant requirement</strong>. Under this defined goal, the third configuration delivers more useful completions. It is a product win even without the highest raw throughput.</p>
<h3>How I'd test it before shipping</h3>
<div class="tinylist"><div><strong>01 / Control</strong><small>Keep model, precision, GPU count, workload mix and request arrival rates comparable.</small></div><div><strong>02 / Instrument</strong><small>Split TTFT into queue, prefill, KV transfer and first-decode components; inspect p50/p95/p99.</small></div><div><strong>03 / Decide</strong><small>Track goodput, task success, retractions and cost per successful task, not utilization alone.</small></div></div>
</section>
<section id="s08"><div class="sectionhead"><span class="sectno">08</span><h2>Translate infrastructure into a customer promise</h2></div>
<p>For a product-oriented reader, the strongest explanation of an infrastructure feature is a causal chain—not a list of kernel names.</p>
<div class="chain"><div class="cell"><strong>Mechanism</strong>Reuse KV / schedule better</div><div class="cell"><strong>System metric</strong>Less work / lower tail latency</div><div class="cell"><strong>User outcome</strong>Faster, more reliable agent</div><div class="cell"><strong>Business value</strong>More useful work per dollar</div></div>
<p>Before proposing an optimization, I'd ask three questions:</p>
<div class="questions"><div class="q-card"><div class="number">01</div><h4>Our workload</h4><p>Do contexts repeat? Are prompts long, outputs long, or arrivals bursty?</p></div><div class="q-card"><div class="number">02</div><h4>Our bottleneck</h4><p>Queueing, prefill, decode, memory pressure, transfer—or product correctness?</p></div><div class="q-card"><div class="number">03</div><h4>Our customers</h4><p>Which SLO, reliability threshold, and cost per successful task actually matter?</p></div></div>
<div class="ending">The best inference engine is not the one with the most impressive single benchmark. It's the one that turns the customer's actual workload into reliable, affordable progress.</div>
<h3 id="refs">References &amp; boundaries</h3>
<ol class="footerrefs">
<li><a href="https://docs.sglang.io/" target="_blank" rel="noopener">SGLang official documentation</a> — serving, features and ecosystem.</li>
<li><a href="https://github.com/sgl-project/sglang/blob/main/python/sglang/srt/managers/scheduler.py" target="_blank" rel="noopener">SGLang Scheduler source</a> — scheduling and execution coordination.</li>
<li><a href="https://github.com/sgl-project/sglang/blob/main/python/sglang/srt/mem_cache/radix_cache.py" target="_blank" rel="noopener">SGLang RadixCache source</a> — prefix tree and cache lifecycle.</li>
<li><a href="https://github.com/sgl-project/sglang/blob/main/docs/docs/advanced_features/pd_disaggregation.mdx" target="_blank" rel="noopener">SGLang PD Disaggregation documentation</a> — transfer backends and allocation policies.</li>
<li><a href="https://docs.vllm.ai/en/latest/design/prefix_caching/" target="_blank" rel="noopener">vLLM Automatic Prefix Caching design</a> — block hashing and reference counting.</li>
<li><a href="https://docs.vllm.ai/en/stable/features/disagg_prefill/" target="_blank" rel="noopener">vLLM Disaggregated Prefilling</a> — design goals and feature maturity.</li>
<li><a href="https://arxiv.org/abs/2312.07104" target="_blank" rel="noopener">Zheng et al., SGLang: Efficient Execution of Structured Language Model Programs</a> — original RadixAttention paper.</li>
</ol>
<div class="lastnote">Scope of these notes: diagrams are explanatory, not complete process diagrams. All example token counts, workload observations and performance numbers are teaching assumptions. Exact support and behavior can change by software release, model architecture, GPU backend, configuration and cache-isolation policy. Performance claims require measured, controlled comparisons.</div>
</section></main>
</div>
<footer class="footnav"><a href="/posts/ai-infra-from-zero-03">← 03</a><span>AI Infra Learning Notes · 04 / 06</span><a href="#top" onclick="window.scrollTo({top:0,behavior:'smooth'});return false">↑ Back to top</a></footer>
</div>
</div>

<div class="lang-zh">
<div class="infra-04 zh">
<header class="hero">
 <div class="eyebrow"><span class="line"></span> AI INFRA LEARNING NOTES <span>·</span> 04 / 06</div>
 <h1>推理引擎怎样才算真正有用？</h1><div class="dek">走进 SGLang：从 RadixAttention、Scheduling、PD Disaggregation，到不同 Workload 背后的产品价值。</div>
 <div class="meta-row"><span>SGLang · Serving Architecture · Product Thinking</span><span>约 15 分钟</span><span>2026 年 11 月</span></div>
 <div class="hero-intro"><p>这是「AI Infra Learning Notes」的 Part 04。前几篇已经讨论过 LLM 如何计算、GPU 为什么成为瓶颈，以及 Serving System 如何处理大量请求。这次，我想把问题变得更贴近真实产品：<strong>为什么同样是“响应慢”，不同的 Coding Agent Workload 却需要完全不同的基础设施优化？</strong> 文中的架构图经过简化，性能数字均为教学假设。重点不在于宣布哪个引擎更快，而是把机制与产品决策真正联系起来。</p></div>
</header>
<div class="wrap">
<aside class="side"><div class="sidehead">本文目录</div>
<nav id="toc-zh" aria-label="Article contents"><a href="#s00-zh"><span>00</span> 三种用户抱怨</a><a href="#s01-zh"><span>01</span> SGLang 架构</a><a href="#s02-zh"><span>02</span> RadixAttention</a><a href="#s03-zh"><span>03</span> Scheduling</a><a href="#s04-zh"><span>04</span> PD Disaggregation</a><a href="#s05-zh"><span>05</span> SGLang vs. vLLM</a><a href="#s06-zh"><span>06</span> 六种 Workload</a><a href="#s07-zh"><span>07</span> 一个产品实验</a><a href="#s08-zh"><span>08</span> Customer Value</a></nav>
 <div class="sidenote">Workload → Bottleneck → Mechanism → Trade-off → Customer Value</div>
</aside>
<main class="article"><section id="s00-zh"><div class="sectionhead"><span class="sectno">00</span><h2>三种用户抱怨，可能是三种完全不同的瓶颈</h2></div>
<p class="lead">假设我们正在做一家使用 Qwen 的 AI Coding Agent startup。产品已经能用，但最近团队同时收到了三种反馈。</p>
<div class="scene"><div class="scene-grid">
<div><div class="speaker">Developer A</div><div class="quote">“我每次打开同一个代码库，再问一个问题，还是要等好几秒才开始回答。”</div><div class="under">交互响应的问题</div></div>
<div><div class="speaker">Developer B</div><div class="quote">“平时挺快的，一到高峰期就忽快忽慢，特别不稳定。”</div><div class="under">可靠性与尾部延迟的问题</div></div>
<div><div class="speaker">Founder</div><div class="quote">“GPU 账单越来越高，难道用户翻一倍，成本也必须翻一倍？”</div><div class="under">成本与容量的问题</div></div>
</div></div>
<p>很容易想要用同一个办法回答这三个问题：买更大的 GPU、增加 batching，或者换一个“更快”的推理引擎。但这三种体验背后，<strong>可能是三种不同的 bottleneck</strong>。</p>
<div class="pull">真正的问题不是“哪项技术很厉害”，而是“什么瓶颈正在限制用户获得价值”。</div>
<p>这篇笔记以 SGLang 为一套真实的推理系统，比较它和 vLLM 的设计，再回到 Coding Agent 的产品场景，判断：<em>什么值得优化，什么暂时不值得？</em></p>
</section>
<section id="s01-zh"><div class="sectionhead"><span class="sectno">01</span><h2>进入 Inference Engine：每个组件究竟负责什么？</h2></div>
<p>我们在前几个 Module 已经理解了 prefill、decode、GPU bottleneck 和 serving 的通用原理。现在把这些知识映射到 SGLang 的实际运行结构。首先注意：<strong>Router 是可选组件</strong>，不是每一个单实例请求都必须经过它。</p>
<figure class="figure"><div class="figtitle">图 01 · 一次请求在 SGLang 中的路径（简化）</div>
<div class="steps"><div class="step"><span class="n">01 / 可选</span><strong>Router</strong><small>选择 Serving Instance</small></div><div class="step"><span class="n">02</span><strong>API + TokenizerManager</strong><small>准备 Token IDs</small></div><div class="step primary"><span class="n">03</span><strong>Scheduler</strong><small>组 Batch / 决定准入</small></div><div class="step"><span class="n">04</span><strong>ModelRunner + GPU</strong><small>执行 Forward Pass</small></div><div class="step"><span class="n">05</span><strong>Detokenizer / Stream</strong><small>返回生成结果</small></div></div>
<div class="bridge"><div class="bridge-row"><b>Scheduler ↔ RadixCache + KV Allocator</b> &nbsp;·&nbsp; 查找可复用状态，分配或回收 GPU 内存</div></div>
<figcaption class="figcap">这是职责关系，不是精确进程图。参考 SGLang Runtime 与 Scheduler 源码。<a href="#refs-zh">[1, 2]</a></figcaption></figure>
<p>最关键的区分是：<strong>Scheduler 决定什么时候执行</strong>；<strong>KV Cache 子系统管理哪些计算结果可以复用、存在哪里</strong>；<strong>ModelRunner / Attention Backend 才执行剩余 GPU 计算</strong>。而可选的 Router 管的是<em>把请求交给哪个实例</em>，不是实例内部每一步 token 的调度。</p>
<p>对于 Coding Agent，这个分工决定了：重复打开同一代码库能否复用上下文、长 prefill 会不会干扰别人的生成、GPU memory 不够时请求是等待还是进入恢复流程。</p>
</section>
<section id="s02-zh"><div class="sectionhead"><span class="sectno">02</span><h2>RadixAttention：复用前缀，本质也是管理 GPU 内存</h2></div>
<p>想象两个请求拥有完全相同的 <strong>8,000-token repository context</strong>，随后分别要求“修复登录问题”和“补充测试”。SGLang 使用 radix tree 索引公共前缀，并保存对应的 KV slot 引用。注意：树本身<strong>不是</strong>存储完整 K/V tensors 的地方。</p>
<figure class="figure"><div class="figtitle">图 02 · 同一个 Prefix，分成两个 Branch</div>
<div class="branchroot">Stable System + Repository Prefix<small style="display:block;font-weight:450">8,000 个相同 tokens · 共享 KV</small></div>
<div class="branchline"></div><div class="branchfork"></div>
<div class="branchcols"><div class="branchleaf">修复 Authentication <span>Request A · 新 suffix</span></div><div class="branchleaf blue">编写 Tests <span>Request B · 新 suffix</span></div></div>
<div class="tagline">Radix Tree = Token Prefix 索引 + KV Slot 引用</div>
<div class="memorypair" style="margin-top:20px"><div class="memorybox"><strong>Tree Metadata</strong>Token Segments → Slot Indices</div><div class="memoryarrow">⇄</div><div class="memorybox alt"><strong>GPU KV Pool</strong>保存实际的 K/V Tensors</div></div>
<figcaption class="figcap">假设性的 token 数量。即使文本相似，也需要前缀 token、模型配置与缓存条件兼容才能真正复用。<a href="#refs-zh">[2, 3]</a></figcaption></figure>
<p>满足条件时，第二个请求可以跳过已复用部分的 prefill。但<strong>复用 8,000 个 token positions，不代表 TTFT 或 GPU 成本按比例下降</strong>。排队、decode、attention kernels、缓存是否仍在、网络传输等都会影响最终结果。</p>
<h3>Reference Count 与 Eviction 为什么重要？</h3>
<p>活跃请求正在引用的 KV slots 不能被当作空闲缓存随便释放。请求结束、引用解除后，符合条件的 cache leaf nodes 才可能在内存紧张时被 eviction（常见策略是 LRU）。SGLang 分离 prefix metadata、request-to-token mappings 与 GPU KV storage，让系统能够调整索引，而无需为拆分树节点复制完整 tensors。<a href="#refs-zh">[2, 3]</a></p>
<p>对应到 Coding Agent，一个有用的原则是：<strong>稳定上下文尽量放在前面，动态内容放在后面</strong>。但前提是不能改变指令语义、不能使用过时的文件版本，更不能破坏用户之间的数据隔离。为了更高 cache hit rate 而让 Agent 读错代码，是得不偿失的。</p>
</section>
<section id="s03-zh"><div class="sectionhead"><span class="sectno">03</span><h2>Scheduling：GPU 更忙，不代表用户体验更好</h2></div>
<p>SGLang Scheduler 协调 waiting requests、prefill batches、正在运行的 decode requests 和 KV memory allocation。它可以考虑 prefix reuse；当下一轮执行缺少 KV slots 时，也可能推迟请求或进行 retraction / recovery。CPU–GPU overlap 能把部分 CPU 调度工作藏在 GPU 执行的时间里，但也增加同步复杂度。<a href="#refs-zh">[2]</a></p>
<figure class="figure"><div class="figtitle">图 03 · 请求进入 GPU 之前的几个关键决策</div>
<div class="diag-flow"><div class="chip gray">Waiting Requests</div><span class="diagar">→</span><div class="chip">Prefix Match + 排序</div><span class="diagar">→</span><div class="chip peach">KV 容量检查</div><span class="diagar">→</span><div class="chip">Prefill / Decode Batch</div></div>
<div class="bridge"><div class="bridge-row"><strong>内存不够怎么办？</strong> &nbsp; 继续等待、回收可淘汰缓存，或根据当前执行路径 retract / recover 部分请求。</div></div>
<figcaption class="figcap">Request Retraction 是恢复机制，不是免费的抢占：它可能增加等待或重复计算。</figcaption></figure>
<p>更激进的 batching 可能提高每秒生成的 tokens，却同时让 p95 TTFT 或 ITL 变差。这不是“技术指标之间的矛盾”这么简单：对交互式 Coding Agent 来说，用户会在高峰期直接感到这个工具不可靠。</p>
</section>
<section id="s04-zh"><div class="sectionhead"><span class="sectno">04</span><h2>Prefill–Decode Disaggregation：真正复杂的是交接</h2></div>
<p>SGLang 可以将 <strong>Prefill</strong> 和 <strong>Decode</strong> 放在不同的 Worker 上，让两者的资源能够分别配置。但这也带来了一个新问题：Prefill 算出来的 KV state，必须安全、及时地传给 Decode Worker。</p>
<figure class="figure"><div class="figtitle">图 04 · Worker 之间有两条不同的路径</div>
<div class="twolane"><div class="lane"><h4>Prefill Worker</h4><div class="blk">处理长输入，计算 K/V Tensors</div><div class="lane-note">可以针对输入计算配置资源</div></div><div class="lane"><h4>Decode Worker</h4><div class="blk">准备接收 KV，然后逐步生成 Tokens</div><div class="lane-note">可以针对持续生成配置资源</div></div></div>
<div class="bridge"><div class="bridge-row"><b>Bootstrap Coordination</b> · 对接 Worker、Request Metadata、目标 Memory 位置</div><div class="bridge-row"><b>KV Transfer Engine</b> · 真正传输 Tensors，例如 Mooncake / NIXL</div></div>
<figcaption class="figcap">这里是职责图。实际 readiness checks 与传输准备有可能和模型计算重叠。<a href="#refs-zh">[4]</a></figcaption></figure>
<p>一个很具体的架构选择是：使用 <code>early</code> allocation 时，Decode 可以在 Prefill 完成前预留 KV slots；改为 <code>prefill_complete</code>，就等 Prefill 准备好后再分配。后者可能减少 Decode Worker 提前占着内存等待的时间，但也可能让 Prefill Worker 更久地持有缓存，减少传输 overlap；该模式的官方文档还列出了具体的配置限制。<a href="#refs-zh">[4]</a></p>
<p>因此，PD Disaggregation 并不等于“两类 Worker 一定更快”。它的价值在于：如果负载值得，系统可以<strong>减少 Prefill 对 Decode 的干扰，并独立调节两种资源</strong>。但网络、协调、运维成本可能抵消收益。短 prompt、低并发或较慢的 Worker 间网络，反而可能更适合 Unified Serving。</p>
</section>
<section id="s05-zh"><div class="sectionhead"><span class="sectno">05</span><h2>SGLang vs. vLLM：比较设计，而不是比较一张跑分图</h2></div>
<p>这两套系统都支持成熟的 LLM serving 技术，例如 continuous batching、prefix caching 和多 GPU 执行。更有价值的问题是：<strong>它们用什么结构实现这些能力？在怎样的 workload 下，这些差异才会变得重要？</strong></p>
<div class="tablewrap"><table><thead><tr><th>设计问题</th><th>SGLang</th><th>vLLM（V1 的公开设计）</th></tr></thead><tbody><tr><td>如何查找缓存前缀？</td><td>Radix Tree：压缩的 token-prefix 节点，引用 KV slots。</td><td>Hash-based blocks：利用 block 内容和此前 prefix 形成 hash 进行查找。</td></tr><tr><td>如何保护内存？</td><td>节点引用 / lock、KV allocator、eviction rules。</td><td>KV block reference count、free-block queue、allocation / eviction。</td></tr><tr><td>谁来决定执行？</td><td>Scheduler、batch construction、prefix-aware policies、memory checks。</td><td>统一 token-budget scheduling 与 KV Cache Manager 协作。</td></tr><tr><td>能否 Prefill / Decode 分离？</td><td>可以；传输后端包括 Mooncake 与 NIXL。</td><td>可以；官方文档将 disaggregated prefilling 标为 experimental。</td></tr><tr><td>哪些模型 / GPU 可用？</td><td>取决于版本和 backend，需要核对具体支持矩阵。</td><td>同样取决于版本和 backend，不能笼统判断。</td></tr><tr><td>谁一定更快？</td><td>没有普遍胜者，要看具体测试条件。</td><td>同样没有普遍胜者。</td></tr></tbody></table></div>
<p>Radix Tree 和 Hash Blocks 首先是<strong>数据结构的差别</strong>，不能直接推导出谁的 cache hit rate 或 TTFT 一定更好。两者都能复用相同的前缀。而 benchmark 还受到版本、输入输出分布、warm cache、并发、模型、GPU 和部署配置影响。<a href="#refs-zh">[5, 6, 7]</a></p>
</section>
<section id="s06-zh"><div class="sectionhead"><span class="sectno">06</span><h2>Workload Atlas：六种用户场景，六种不同的优化假设</h2></div>
<p class="lead">这是我觉得从 Product 角度最值得保留的一部分。“Inference 很慢”不是诊断结论，而是一个值得继续追问的现象。</p>
<p>下面整理了 <strong>六种常见 Coding Agent workload</strong>。每一种，都意味着不同的测量指标和工程机制。这些是有待检验的假设，而不是看到症状就能直接开出的处方。</p>
<div class="atlas"><div class="atlas-card"><span class="index">01</span><h3>重复的 Repository Context</h3><dl><dt>用户看到的现象</dt><dd>Coding Agent 多轮读取同一个代码库。</dd><dt>可能的瓶颈</dt><dd>重复 prefill，或 prefix reuse 不足</dd><dt>先测量什么</dt><dd>命中前缀长度、TTFT、cache eviction</dd><dt>可能的工程手段</dt><dd>RadixAttention、稳定的 prompt 顺序</dd></dl><div class="verdict"><strong>潜在代价 ·</strong> 缓存占用 KV 空间；代码改动可能让前缀失效。</div></div><div class="atlas-card"><span class="index">02</span><h3>不同用户、不同 Prompts</h3><dl><dt>用户看到的现象</dt><dd>大量请求几乎不共享上下文。</dd><dt>可能的瓶颈</dt><dd>缓存重用低，调度与模型执行更重要</dd><dt>先测量什么</dt><dd>cache-hit 分布、排队时间、TTFT/ITL</dd><dt>可能的工程手段</dt><dd>Load-aware scheduling、batching、容量配置</dd></dl><div class="verdict"><strong>潜在代价 ·</strong> 强求 cache locality 可能适得其反。</div></div><div class="atlas-card"><span class="index">03</span><h3>超长输入</h3><dl><dt>用户看到的现象</dt><dd>用户一次传来 40k tokens 的仓库内容。</dd><dt>可能的瓶颈</dt><dd>Prefill 计算重、KV memory 占用大</dd><dt>先测量什么</dt><dd>prefill time、KV 峰值、TTFT</dd><dt>可能的工程手段</dt><dd>Chunked prefill、prefix reuse、并行配置</dd></dl><div class="verdict"><strong>潜在代价 ·</strong> Chunk 大小与 Decode 共享资源时会相互影响。</div></div><div class="atlas-card"><span class="index">04</span><h3>超长输出</h3><dl><dt>用户看到的现象</dt><dd>Agent 要生成长篇重构方案和解释。</dd><dt>可能的瓶颈</dt><dd>Decode 步骤多、带宽压力、KV 不断增长</dd><dt>先测量什么</dt><dd>TPOT/ITL、output tokens/s、单位成本</dd><dt>可能的工程手段</dt><dd>Decode batching、高效 attention kernels</dd></dl><div class="verdict"><strong>潜在代价 ·</strong> 吞吐提高可能同时拉高单用户延迟。</div></div><div class="atlas-card"><span class="index">05</span><h3>高峰期高并发</h3><dl><dt>用户看到的现象</dt><dd>上午很快，下午却时快时慢。</dd><dt>可能的瓶颈</dt><dd>排队、admission limit、preemption、资源竞争</dd><dt>先测量什么</dt><dd>p95/p99 latency、queue time、retractions、goodput</dd><dt>可能的工程手段</dt><dd>Scheduling、admission control、容量扩容</dd></dl><div class="verdict"><strong>潜在代价 ·</strong> 过度激进的准入可能损害 SLO。</div></div><div class="atlas-card"><span class="index">06</span><h3>密集且不断变化的 Agent Context</h3><dl><dt>用户看到的现象</dt><dd>工具结果、代码 diff、历史文件不断累计。</dd><dt>可能的瓶颈</dt><dd>上下文膨胀、cache churn、过期信息风险</dd><dt>先测量什么</dt><dd>KV occupancy、prefix validity、任务成功率、端到端时间</dd><dt>可能的工程手段</dt><dd>Context 组织、选择性检索、session-aware cache</dd></dl><div class="verdict"><strong>潜在代价 ·</strong> 正确性与用户隔离，比 cache hit rate 更重要。</div></div></div>
<p>这里有一个很重要的认识：<strong>同一个 optimization，在不同 workload 下可能从“特别有用”变成“几乎没用”。</strong> 比如 Prefix Caching 对重复上下文很有价值，却未必能帮助几乎不共享 prompt 的用户，或者主要耗时在长 decode 的任务。PD Disaggregation 也可能缓解高并发下的干扰，但对小流量服务反而增加额外传输开销。</p>
</section>
<section id="s07-zh"><div class="sectionhead"><span class="sectno">07</span><h2>一个产品实验：Throughput 提高，真正有用的工作反而减少</h2></div>
<p>现在假设我们的 Startup 在<strong>同一个 Qwen 模型、相同 GPU 预算、相同 Workload Mix、相同 SLO 定义</strong>下，对比三种配置。只有请求成功完成、并满足预先约定的延迟要求，才被计为 SLO 达标。</p>
<p class="note"><strong>以下全部是教学假设数据，不是 SGLang 或 vLLM 的真实 Benchmark。</strong></p>
<div class="tablewrap"><table><thead><tr><th>配置</th><th>完成请求数 / 秒</th><th>SLO 达标率</th><th>Goodput（req/s）</th></tr></thead><tbody><tr><td>当前基线</td><td>20</td><td>65%</td><td>13.0</td></tr><tr><td>Aggressive Batching</td><td>24</td><td>50%</td><td>12.0</td></tr><tr><td>SLO-oriented Scheduling</td><td>19</td><td>90%</td><td>17.1</td></tr></tbody></table></div>
<div class="bar-chart"><div class="figtitle">图 05 · 每秒真正满足要求的请求数</div>
<div class="bar-row"><div class="bar-label">当前基线</div><div class="track"><div class="fill" style="width:76%"></div></div><div class="val">13.0</div></div>
<div class="bar-row"><div class="bar-label">更大 Batch</div><div class="track"><div class="fill muted" style="width:70.2%"></div></div><div class="val">12.0</div></div>
<div class="bar-row"><div class="bar-label">SLO 优先</div><div class="track"><div class="fill strong" style="width:100%"></div></div><div class="val">17.1</div></div>
<div class="note">条形长度按最大 Goodput 归一化。数据为教学假设，不是外部实测。</div></div>
<div class="formula">Goodput ≈ 每秒完成请求数 × 满足所定义 SLO 的比例。</div>
<p>Aggressive Batching 虽然让系统完成了更多请求，但<strong>真正达到用户要求的请求反而更少</strong>。在这个明确的目标下，第三种方案没有最高 Throughput，却完成了更多“有用的请求”。这才是产品意义上的优化。</p>
<h3>如果由我来设计实验</h3>
<div class="tinylist"><div><strong>01 / 控制变量</strong><small>模型、精度、GPU 数量、请求分布、到达率尽量保持一致。</small></div><div><strong>02 / 找到延迟来源</strong><small>把 TTFT 拆成排队、Prefill、KV Transfer、首次 Decode 等部分；观察 p50/p95/p99。</small></div><div><strong>03 / 用价值衡量</strong><small>看 Goodput、任务成功率、Retraction 频率、Cost per Successful Task，而不只看 GPU Utilization。</small></div></div>
</section>
<section id="s08-zh"><div class="sectionhead"><span class="sectno">08</span><h2>把 Engineering Mechanism 翻译成真正的 Customer Value</h2></div>
<p>对于做产品的人，我认为最有说服力的讲法不是罗列底层技术名称，而是建立一条完整的因果链。</p>
<div class="chain"><div class="cell"><strong>工程机制</strong>KV 复用 / 更好的调度</div><div class="cell"><strong>系统表现</strong>更少重复计算 / 更低尾延迟</div><div class="cell"><strong>用户体验</strong>更快、更稳定的 Agent</div><div class="cell"><strong>业务价值</strong>每美元完成更多有效工作</div></div>
<p>在建议团队动手优化之前，我想先问三个问题：</p>
<div class="questions"><div class="q-card"><div class="number">01</div><h4>Our Workload</h4><p>我们的 Context 重复吗？是长 Prompt、长 Output，还是请求突然集中涌入？</p></div><div class="q-card"><div class="number">02</div><h4>Our Bottleneck</h4><p>问题发生在 Queue、Prefill、Decode、KV Memory、Transfer，还是 Agent 本身的正确性？</p></div><div class="q-card"><div class="number">03</div><h4>Our Customers</h4><p>用户真正看重什么 SLO、可靠性、任务成功率与单位成本？</p></div></div>
<div class="ending">最好的 Inference Engine，不是某一张 Benchmark 上最快的那个，而是能让客户的真实 Workload 变成可靠、可负担的有效成果的那个。</div>
<h3 id="refs-zh">References &amp; Notes</h3>
<ol class="footerrefs">
<li><a href="https://docs.sglang.io/" target="_blank" rel="noopener">SGLang 官方文档</a>：Serving、功能与生态。</li>
<li><a href="https://github.com/sgl-project/sglang/blob/main/python/sglang/srt/managers/scheduler.py" target="_blank" rel="noopener">SGLang Scheduler 源码</a>：调度和执行协调。</li>
<li><a href="https://github.com/sgl-project/sglang/blob/main/python/sglang/srt/mem_cache/radix_cache.py" target="_blank" rel="noopener">SGLang RadixCache 源码</a>：前缀树与 Cache Lifecycle。</li>
<li><a href="https://github.com/sgl-project/sglang/blob/main/docs/docs/advanced_features/pd_disaggregation.mdx" target="_blank" rel="noopener">SGLang PD Disaggregation 文档</a>：传输后端与内存分配策略。</li>
<li><a href="https://docs.vllm.ai/en/latest/design/prefix_caching/" target="_blank" rel="noopener">vLLM Automatic Prefix Caching 设计文档</a>：Block Hash 与 Reference Counting。</li>
<li><a href="https://docs.vllm.ai/en/stable/features/disagg_prefill/" target="_blank" rel="noopener">vLLM Disaggregated Prefilling</a>：设计目标和功能成熟度。</li>
<li><a href="https://arxiv.org/abs/2312.07104" target="_blank" rel="noopener">Zheng et al., SGLang: Efficient Execution of Structured Language Model Programs</a>：RadixAttention 原始论文。</li>
</ol>
<div class="lastnote">阅读边界：图解是为了理解机制，不是完整的进程部署图。文中的 Tokens、Workload 与性能数字均为教学假设。具体能力受软件版本、模型结构、GPU backend、部署配置及 Cache 隔离策略影响；所有性能判断都需要对照真实、可控的测试。</div>
</section></main>
</div>
<footer class="footnav"><a href="/posts/ai-infra-from-zero-03">← 03</a><span>AI Infra Learning Notes · 04 / 06</span><a href="#top" onclick="window.scrollTo({top:0,behavior:'smooth'});return false">↑ 回到顶部</a></footer>
</div>
</div>

<script>
(function(){
  function bind(nav){
    if(!nav || !('IntersectionObserver' in window)) return;
    var root = nav.closest('.lang-en, .lang-zh') || document;
    var links = [].slice.call(nav.querySelectorAll('a'));
    var sections = [].slice.call(root.querySelectorAll('section[id]'));
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var id = e.target.id;
        links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
      });
    }, {rootMargin:'-90px 0px -70% 0px', threshold:0});
    sections.forEach(function(s){ observer.observe(s); });
  }
  document.querySelectorAll('nav[id^="toc"]').forEach(bind);
})();
</script>
