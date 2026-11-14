---
title: "What Makes AI Infrastructure Worth Using?"
titleZh: "AI 基础设施，什么时候值得用？"
lang: en
tags: ["AI"]
date: 2026-11-14
readTime: 11
slug: ai-infra-product-lens
series: "AI Infra · product"
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">

<div class="lang-en">
<div class="infra-note infra-note--product">


<div class="series"><span></span>AI Infrastructure · Product Field Notes / 01</div>

<div class="meta">From technical performance to user problems, product value, and developer adoption</div>

<p class="note">This essay extends my <a href="/posts/ai-infra-from-zero-01">AI Infra From Zero</a> technical series. The diagrams are simplified teaching models. Customer scenarios and funnel numbers are illustrative, not confidential company information or actual product analytics. Product judgments are hypotheses unless backed by cited public evidence.</p>

<div class="article-nav" aria-label="Sections"><a href="#shift">The shift</a><a href="#map">Product map</a><a href="#users">Users</a><a href="#value">Value</a><a href="#diagnosis">Discovery</a><a href="#adoption">Adoption</a><a href="#practice">Practice</a></div>

<section id="shift">
<h2><span class="num">00</span> Why Would a Team Need This?</h2>
<p>My first few weeks learning AI infrastructure were about mechanics: prefill and decode, GPU memory, KV cache, batching, scheduling. I could begin to explain <em>how</em> a serving system works.</p>
<p>But I ran into a much more basic question: <strong>Who actually needs this?</strong> If I am building a small AI application, I can call a hosted model API. Why would I run my own model? Why would I need an inference engine, let alone a managed infrastructure service?</p>
<p>That question changed the way I studied. Instead of stopping at the technical mechanism, I started asking four things about every product:</p>
<div class="steps">
<div class="step"><div class="n">01</div><h4>What?</h4><p>What is the product actually responsible for? Which part of the stack does it own?</p></div>
<div class="step"><div class="n">02</div><h4>Who?</h4><p>Who has the problem: a model researcher, an infra engineer, an AI application team, or a buyer?</p></div>
<div class="step"><div class="n">03</div><h4>Why?</h4><p>What is painful or expensive today? Why is a new tool worth adopting?</p></div>
<div class="step"><div class="n">04</div><h4>How do we know?</h4><p>What evidence would show a real improvement, rather than a good-looking benchmark?</p></div>
</div>
<blockquote><p>Understanding the mechanism tells me what technology <em>can</em> do. Understanding the user tells me whether that capability matters.</p></blockquote>
</section>

<section id="map">
<h2><span class="num">01</span> One AI Application, Different Infrastructure Choices</h2>
<p>Consider a hypothetical startup building an AI coding agent. The end user asks the agent to fix a bug. From the outside, it is just a product experience. Behind the scenes, the company must decide how to run the model.</p>
<p>There is no universal answer. A team may rely on a hosted frontier-model API, operate an open-weight model itself, or use a managed service that operates a chosen model on its behalf.</p>
<figure class="wide">
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-01.svg" loading="lazy" decoding="async" alt="Three routes to deploying an AI application: a hosted model API, self-hosted open-weight inference, or managed inference services." width="790" height="370"></div>
<figcaption>Three deployment choices. The right question is not “Which is best?” but “Which fits the workload, constraints, and team?”</figcaption>
</figure>
<p>Below the application sits a wider stack: model weights, inference engines, GPU software, hardware, networking, monitoring, and operations. A separate <strong>post-training</strong> path can improve a model through supervised fine-tuning or reinforcement learning; a training framework may use an inference engine to generate rollouts. The product categories cooperate, but they solve different jobs.</p>
<div class="chain"><b>Inference engine:</b> run a trained model efficiently.<br><b>Post-training framework:</b> organize the process of changing a model's behavior through additional training.<br><b>Managed platform:</b> take responsibility for some of the deployment, tuning, and operational work.</div>
<p>An important lesson for me: <strong>not every AI developer is an infrastructure customer.</strong> Someone validating a small MVP with a hosted API may have no reason to operate an inference engine at all.</p>
</section>

<section id="users">
<h2><span class="num">02</span> Who Is the User, Really?</h2>
<p>I originally imagined “AI developers” as one broad group. That hides major differences. A model lab deploying its own architecture has a different job from a startup optimizing an agent's cost per task; a GPU cloud has a different job again.</p>
<div class="steps">
<div class="persona"><div class="tag">Model teams</div><h4>“Can we serve our new model?”</h4><p class="job">A lab releasing an architecture needs compatibility, performance, and reliable model support.</p><p>Evidence to seek: launch requirements, support gaps, reproducible model benchmarks.</p></div>
<div class="persona"><div class="tag">Agent companies</div><h4>“Can we make each task viable?”</h4><p class="job">An application with repeated or long-running inference wants useful speed and cost per completed task.</p><p>Evidence to seek: representative traces, latency distribution, unit economics.</p></div>
<div class="persona"><div class="tag">Compute providers</div><h4>“Can we serve workloads efficiently?”</h4><p class="job">An infrastructure provider must manage GPU capacity, multiple customers, and operational reliability.</p><p>Evidence to seek: utilization, throughput under SLOs, operational load.</p></div>
<div class="persona"><div class="tag">Enterprise teams</div><h4>“Can we operate this safely?”</h4><p class="job">A business may need deployment control, integration, governance, and support.</p><p>Evidence to seek: architecture constraints, SLA needs, internal ownership.</p></div>
</div>
<h3>User ≠ Buyer</h3>
<p>Another distinction matters in B2B software. The engineer evaluating a tool may not control the budget. An infra lead worries about migration risk; a CTO may care about total cost and delivery speed. A product message has to speak to the right question without pretending they are the same person.</p>
<figure>
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-02.svg" loading="lazy" decoding="async" alt="A comparison of the technical user, the technical evaluator, and the economic buyer, each with a different decision question." width="660" height="238"></div>
<figcaption>One product, several decision-makers. “Developer-friendly” and “worth purchasing” are related but distinct questions.</figcaption>
</figure>
</section>

<section id="value">
<h2><span class="num">03</span> Connect a Feature to a Result</h2>
<p>I had learned how prefix caching avoids redundant computation. But knowing the mechanism was not enough. To explain a technical feature as a product, I needed a longer chain of reasoning.</p>
<figure class="wide">
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-03.svg" loading="lazy" decoding="async" alt="A feature-to-value chain from prefix caching, to less repeated prefill, to improved workload metrics, to potential user and business results." width="780" height="214"></div>
<figcaption>A technical capability becomes a value proposition only when the intermediate assumptions hold.</figcaption>
</figure>
<p>The same caution applies to batching. A higher throughput number can come with worse latency for an individual request. A good product story has to name the workload and the trade-off, not just display the biggest benchmark.</p>
<p>For an AI coding agent, I might care about <strong>cost per successfully completed task</strong> and the time a user waits for that task, not just raw tokens per second. For a cloud provider, requests served within latency targets per GPU might matter more. The right metric depends on the job.</p>
<div class="pull"><div class="eyebrow">Explaining the Product</div><div class="statement">Do not market a benchmark. Explain a verified improvement to a user who has that problem.</div><p class="detail">Performance claims should specify the model, hardware, workload, baseline, and measurement conditions.</p></div>
<h3>Open source is free. Operating it is not.</h3>
<p>My first answer to “Why pay for a managed service?” was about reliability and focus. A team may be able to download the software, but must still provision machines, tune performance, monitor the system, manage upgrades, and respond to incidents.</p>
<div class="formula">Total Cost of Ownership ≠ Software License Price</div>
<div class="split">
<div class="panel"><div class="mini">Self-hosted</div><h4>Control, with ownership</h4><p>GPU costs, engineering time, deployment, monitoring, maintenance, incident response, and the opportunity cost of work not done elsewhere.</p></div>
<div class="panel"><div class="mini">Managed service</div><h4>Service fee, with delegation</h4><p>Platform charges, integration, vendor dependence, and the expected savings from fewer internal operations and faster delivery.</p></div>
</div>
<p>The decision is not automatically “managed is better.” A mature infrastructure team may prefer self-hosting. A smaller team might reasonably pay to focus on its product. The product question is whether the service creates <strong>enough net value for this particular customer</strong>.</p>
</section>

<section id="diagnosis">
<h2><span class="num">04</span> When a Customer Already Uses Another Engine</h2>
<p>Here is the case that most changed how I think about positioning: a developer says, “I already use an inference engine. It works reasonably well. Why should I switch?”</p>
<p>My first instinct is no longer to list features. I want to understand the current system.</p>
<div class="steps">
<div class="step"><div class="n">1</div><h4>What job?</h4><p>Which models, hardware, prompts, traffic pattern, and performance requirements?</p></div>
<div class="step"><div class="n">2</div><h4>What works?</h4><p>Why did the team adopt its current tool? What is it already good at?</p></div>
<div class="step"><div class="n">3</div><h4>What breaks?</h4><p>Is the problem latency, throughput, compatibility, reliability, or operational work?</p></div>
<div class="step"><div class="n">4</div><h4>Why change?</h4><p>Can a measured improvement justify migration and validation costs?</p></div>
</div>
<p>This is a product discovery problem before it is a product comparison problem. If the current engine is meeting the customer's needs, <strong>not switching may be the right answer</strong>. If there is a real bottleneck, we can compare alternatives on the actual workload instead of on an unrelated public benchmark.</p>
<figure>
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-04.svg" loading="lazy" decoding="async" alt="Problem diagnosis decision tree: user complaint, bottleneck evidence, suitable solution, and evaluation of migration value." width="670" height="277"></div>
<figcaption>Diagnose the job and bottleneck first. The correct intervention may not be a new inference engine.</figcaption>
</figure>
<p>That was also a lesson from learning about post-training: a wrong model output does not automatically mean “run RL.” The agent may be missing context, calling a tool incorrectly, or using unclear instructions. Training only makes sense after understanding the failure mode.</p>
</section>

<section id="adoption">
<h2><span class="num">05</span> A Great Feature Is Not the Same as Adoption</h2>
<p>Now suppose an engineering team releases a performance optimization. Its benchmark is strong, but developers are not adopting it. My data-science instinct is to ask, <strong>“What exactly counts as adoption?”</strong></p>
<p>A GitHub star, a documentation visit, a successful first run, and a sustained production deployment are four different events. Traffic and attention may help, but they are not the outcome.</p>
<h3>Where does the developer journey break?</h3>
<figure class="wide">
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-05.svg" loading="lazy" decoding="async" alt="Illustrative adoption funnel: 1000 aware, 600 read documentation, 400 try, 80 successful first runs, and 30 production users. Largest step drop is trial to first success." width="780" height="340"></div>
<figcaption>Illustrative funnel, not real project or company analytics. The question shifts from “How do we get attention?” to “Why can't users reach first value?”</figcaption>
</figure>
<p>If 400 developers try a feature and only 80 complete a first successful run, buying more traffic may be the wrong move. The activation rate among trial users is only <strong>80 / 400 = 20%</strong>. Before changing anything, I would check measurement quality, segment by model and hardware, and look for recurring setup failures.</p>
<div class="chain"><b>Define success</b> → locate the drop-off → observe failures → form a hypothesis → improve the experience → measure again</div>
<p>That is where the <em>Growth Hacking</em> framework started to feel familiar to me. Acquisition, activation, retention, referral, and revenue describe different moments in the journey. As someone trained in statistical analysis, I also recognize the danger of mistaking correlation for causation.</p>
<h3>A small experiment, not a big campaign</h3>
<p>Suppose qualitative research suggests that the quickstart guide is unclear. A possible intervention is a tested, model-specific guide with clearer compatibility requirements and error messages. If measurable and practical, the team could compare it with the existing guide; otherwise it could start with usability testing and a staged documentation improvement.</p>
<div class="table-wrap"><table>
<tbody><tr><th>Question</th><th>Experiment design</th></tr>
<tr><td>Hypothesis</td><td>Unclear setup instructions are blocking first successful runs.</td></tr>
<tr><td>Intervention</td><td>A simpler, validated quickstart for an eligible model/hardware combination.</td></tr>
<tr><td>Primary metric</td><td>First successful run among eligible trial users.</td></tr>
<tr><td>Guardrails</td><td>Configuration errors, deployment quality, follow-up support burden.</td></tr>
<tr><td>Evidence</td><td>Usage data where legitimately available, plus opt-in user research and issue themes.</td></tr>
</tbody></table></div>
<p>A practical caveat: open-source projects often cannot observe private self-hosted deployments. So these metrics may be unavailable or biased. Honest product research can use opt-in surveys, community feedback, support issues, and targeted usability sessions without pretending to have perfect telemetry.</p>
<div class="pull"><div class="eyebrow">Measuring Useful Adoption</div><div class="statement">More GitHub stars do not necessarily mean more developers are successfully using the product.</div><p class="detail">For open-source infrastructure, sustained useful adoption is closer to the goal, even when it is harder to measure directly. A commercial platform also needs to examine customer value and retention.</p></div>
</section>

<section id="practice">
<h2><span class="num">06</span> Where a Product-Facing Person Can Contribute</h2>
<p>The most interesting part of this exercise is that I did not need to become an inference-kernel engineer to find meaningful problems. I did need enough technical literacy to understand the limits of a feature and enough product judgment to find where users struggle.</p>
<p>In a small infrastructure team, product management, product marketing, developer relations, technical writing, growth, and engineering may overlap. I would begin by making the developer journey more observable and easier to complete.</p>
<div class="steps">
<div class="workcard"><div class="tag eyebrow">Project idea 01</div><h4>Issue → Insight Brief</h4><p>Read a focused set of public GitHub issues. Cluster failure modes, identify user segments, check what is already resolved, and write a short memo with evidence and uncertainty.</p><div class="output">DELIVERABLE · Source-linked user pain-point map, not a speculative feature wishlist.</div></div>
<div class="workcard"><div class="tag eyebrow">Project idea 02</div><h4>First-Run Experience Audit</h4><p>Try a documented quickstart in a supported environment or observe a developer doing so. Record each confusing step and propose specific improvements.</p><div class="output">DELIVERABLE · Usability findings + a testable documentation improvement.</div></div>
<div class="workcard"><div class="tag eyebrow">Project idea 03</div><h4>Performance → Value Guide</h4><p>Choose a real technical capability, explain its mechanism, name when it helps and when it does not, and tie the claim to a representative workload.</p><div class="output">DELIVERABLE · Developer-facing explainer with measurement conditions.</div></div>
<div class="workcard"><div class="tag eyebrow">Project idea 04</div><h4>Adoption Experiment</h4><p>Choose a known point of friction, define a legitimate success measure, run a small intervention with the relevant team, and compare outcomes.</p><div class="output">DELIVERABLE · Hypothesis, intervention, results, limitations, and decision.</div></div>
</div>
<p>These are <strong>proposed contribution paths</strong>, not claims about a particular company's internal priorities. The first step would always be to ask the team what its most important user problem actually is.</p>
<h3>One feature, two conversations</h3>
<p>The same performance improvement needs different explanations depending on who is listening.</p>
<figure>
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-06.svg" loading="lazy" decoding="async" alt="How to explain a performance improvement differently to a developer and to an engineering decision maker." width="660" height="230"></div>
<figcaption>Technical accuracy should stay constant; the framing changes with the reader's job.</figcaption>
</figure>
</section>

<section>
<h2><span class="num">07</span> What I Now Ask Before Recommending a Tool</h2>
<p>This is the small checklist I want to carry into any technical product conversation:</p>
<ol>
<li><strong>Who has the problem?</strong> Be specific about the user, their workload, and who makes the decision.</li>
<li><strong>What are they doing now?</strong> Understand the current solution, including what already works.</li>
<li><strong>What fails, and why?</strong> Diagnose before selecting a technology.</li>
<li><strong>What would improve?</strong> Translate a feature into a measurable user or business outcome.</li>
<li><strong>What would adoption require?</strong> Consider documentation, migration, reliability, and the cost of change.</li>
<li><strong>How would we know?</strong> Choose an honest metric and acknowledge its blind spots.</li>
</ol>
<blockquote><p>A faster engine is a technical achievement. Helping the right developer succeed with it is a product achievement.</p></blockquote>
<p>I still want to understand the underlying systems. But now, when I learn a concept like caching, scheduling, or post-training, I also ask who needs it, what trade-off they face, and what evidence would convince them. I want to use that technical knowledge in user research and product work.</p>
</section>

<section>
<h2><span class="num">08</span> Public References &amp; Boundaries</h2>
<p class="small">The technical examples above describe general product patterns. I have not used private interviews, internal product metrics, confidential company details, or claims about proprietary roadmaps. The funnel and customer scenarios are explicitly illustrative. My own analysis is not an endorsement or official representation of any project.</p>
<ol class="references">
<li><a href="https://docs.sglang.io/">SGLang documentation</a>: open-source model serving, performance, APIs, and deployment basics.</li>
<li><a href="https://github.com/sgl-project/sglang/issues/42473">SGLang public Q4 2026 roadmap</a>: usability, cookbooks, deployment simplicity, and compatibility as publicly stated development goals.</li>
<li><a href="https://github.com/sgl-project/sglang/issues/50045">SGLang public 1.0 tracker</a>: production stability and configuration clarity as an example of developer-experience work.</li>
<li><a href="https://docs.vllm.ai/">vLLM documentation</a>: another open-source inference-serving framework and an example of the existing alternatives a developer might evaluate.</li>
<li><a href="/posts/ai-infra-from-zero-01">AI Infra From Zero: Note 01</a>: my earlier technical learning note on prefill, decode, KV cache, and prefix reuse.</li>
</ol>
</section>
<div class="footer">From how models run → to why people choose to run them.<br><a href="/posts">← Back to AI Projects</a></div>
<nav class="next" aria-label="Related AI infrastructure articles"><a href="/posts/ai-infra-from-zero-02">Why Is the GPU Still a Bottleneck?</a><br><a href="/posts/ai-infra-from-zero-03">How Does an LLM Serve Thousands of Requests?</a></nav>
</div>
</div>

<div class="lang-zh">
<div class="infra-note infra-note--product">


<div class="series"><span></span>AI 基础设施 · 产品现场笔记 / 01</div>

<div class="meta">从技术性能，到用户的问题、产品值不值得用，以及开发者会不会真的用上</div>

<p class="note">这篇是我 <a href="/posts/ai-infra-from-zero-01">AI Infra From Zero</a> 技术系列的延伸。图是简化过的教学模型。客户场景和漏斗里的数字都是示意，不是公司机密，也不是真实的产品数据。没有公开材料支撑的判断，只是假设。</p>

<div class="article-nav" aria-label="章节"><a href="#shift">转变</a><a href="#map">地图</a><a href="#users">用户</a><a href="#value">价值</a><a href="#diagnosis">诊断</a><a href="#adoption">采用</a><a href="#practice">实践</a></div>

<section id="shift">
<h2><span class="num">00</span> 一个团队为什么需要这个？</h2>
<p>我刚开始学 AI 基础设施的那几周，学的是机制：prefill 和 decode、GPU 显存、KV cache、batching、调度。我开始能讲清楚一套 serving 系统<em>怎么</em>工作。</p>
<p>但很快碰到一个更基本的问题：<strong>到底谁需要这个？</strong>如果我自己做一个小的 AI 应用，直接调托管的模型 API 就行。为什么要自己跑模型？为什么需要推理引擎，又为什么需要一套托管的基础设施服务？</p>
<p>这个问题改了我后面的学法。我不只停在技术机制上。看每个产品，我会问四件事：</p>
<div class="steps">
<div class="step"><div class="n">01</div><h4>是什么？</h4><p>这个产品实际负责什么？技术栈里哪一段是它的？</p></div>
<div class="step"><div class="n">02</div><h4>给谁？</h4><p>问题在谁身上：模型研究员、基础设施工程师、AI 应用团队，还是买单的人？</p></div>
<div class="step"><div class="n">03</div><h4>为什么？</h4><p>现在哪里痛、哪里贵？为什么值得换一个新工具？</p></div>
<div class="step"><div class="n">04</div><h4>怎么知道？</h4><p>什么样的证据能说明真的变好了，而不是一张好看的 benchmark？</p></div>
</div>
<blockquote><p>懂机制，我知道技术<em>能</em>做什么。懂用户，我才知道这个能力有没有人在乎。</p></blockquote>
</section>

<section id="map">
<h2><span class="num">01</span> 同一个 AI 应用，基础设施可以有不同选法</h2>
<p>假设有一家创业公司在做 AI 编程助手。用户让助手修一个 bug。从外面看，这只是产品体验。背后，公司得决定模型怎么跑。</p>
<p>没有标准答案。团队可以调用托管的前沿模型 API，可以自己跑一个开放权重模型，也可以用托管服务，让对方替自己把选好的模型跑起来。</p>
<figure class="wide">
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-01.svg" loading="lazy" decoding="async" alt="部署一个 AI 应用的三条路：托管模型 API、自己托管开放权重模型做推理，或者托管推理服务。" width="790" height="370"></div>
<figcaption>三种部署选择。该问的不是“哪个最好”，而是“哪个适合这套负载、这些约束，以及这个团队”。</figcaption>
</figure>
<p>应用下面还有一整层：模型权重、推理引擎、GPU 软件、硬件、网络、监控和运维。旁边还有一条<strong>后训练</strong>的路，可以用监督微调或强化学习把模型改得更合适；训练框架有时会调用推理引擎来生成 rollout。这些产品会配合，但干的不是同一件事。</p>
<div class="chain"><b>推理引擎：</b>把训练好的模型高效地跑起来。<br><b>后训练框架：</b>把“再用一轮训练改变模型行为”这件事组织起来。<br><b>托管平台：</b>把一部分部署、调优和运维接过去。</div>
<p>我自己的一个教训：<strong>不是每个做 AI 的人都是基础设施客户。</strong>一个人用托管 API 验证一个小 MVP，可能根本没有理由去运维一套推理引擎。</p>
</section>

<section id="users">
<h2><span class="num">02</span> 用户到底是谁？</h2>
<p>我一开始把“AI 开发者”想成一大类人。这么叫，差别就被盖住了。自己部署新架构的模型实验室，和想把单次任务成本打下来的创业公司，不是同一份工作；GPU 云又是另一份。</p>
<div class="steps">
<div class="persona"><div class="tag">模型团队</div><h4>“我们的新模型能服务出去吗？”</h4><p class="job">实验室发布一种新架构，需要兼容、性能，以及靠得住的模型支持。</p><p>要去找的证据：上线要求、支持上的缺口、可以复现的模型 benchmark。</p></div>
<div class="persona"><div class="tag">Agent 公司</div><h4>“每个任务还能做下来吗？”</h4><p class="job">推理又多又长的应用，在意的是完成一个任务的速度和成本。</p><p>要去找的证据：有代表性的请求轨迹、延迟分布、每个任务的成本账。</p></div>
<div class="persona"><div class="tag">算力提供方</div><h4>“这些负载我们能不能高效地接住？”</h4><p class="job">基础设施提供方要管 GPU 容量、多个客户，以及运行是否稳定。</p><p>要去找的证据：利用率、SLO 之内的吞吐、运维负担。</p></div>
<div class="persona"><div class="tag">企业团队</div><h4>“这个我们能放心地用起来吗？”</h4><p class="job">一家公司可能需要部署上的控制权、集成、治理和支持。</p><p>要去找的证据：架构约束、SLA 要求、内部由谁负责。</p></div>
</div>
<h3>用户 ≠ 买单的人</h3>
<p>B2B 软件里还有一层差别。评估工具的工程师不一定管预算。基础设施负责人担心迁移风险；CTO 可能更在意总成本和交付速度。产品要讲到对方真正在问的问题，不能假装他们是同一个人。</p>
<figure>
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-02.svg" loading="lazy" decoding="async" alt="技术用户、技术评估者和经济买家的对照，每个人要做的决定不一样。" width="660" height="238"></div>
<figcaption>一个产品，几个做决定的人。“开发者觉得好用”和“值得买”有关，但是两件事。</figcaption>
</figure>
</section>

<section id="value">
<h2><span class="num">03</span> 把一个功能接到一个结果上</h2>
<p>我学过 prefix caching 怎么避开重复计算。但知道机制不够。要把一个技术功能讲成产品，我得把中间的因果补全。</p>
<figure class="wide">
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-03.svg" loading="lazy" decoding="async" alt="从 prefix caching，到更少的重复 prefill，到负载指标变好，再到可能的用户结果和业务结果。" width="780" height="214"></div>
<figcaption>一项技术能力要变成价值主张，中间的假设得先成立。</figcaption>
</figure>
<p>batching 也一样。吞吐数字可以更高，单个请求的延迟却可能更差。一个站得住的产品故事要讲清是什么负载、做了什么取舍，不能只把最大的那个 benchmark 摆出来。</p>
<p>对一个 AI 编程助手，我可能更在意<strong>每成功完成一个任务的成本</strong>，以及用户为这个任务等了多久，而不只是每秒多少 token。对云厂商，每块 GPU 在延迟目标内服务了多少请求，可能更要紧。指标对不对，取决于这份工作是什么。</p>
<div class="pull"><div class="eyebrow">讲这个产品的时候</div><div class="statement">别拿 benchmark 当卖点。向真正有这个问题的人，解释一个已经被验证的改进。</div><p class="detail">性能说法要写明模型、硬件、负载、对照基线，以及测量条件。</p></div>
<h3>开源软件不收费。把它跑起来要钱。</h3>
<p>别人问“为什么要为一套托管服务付钱”，我先想到的是稳定，以及团队能不能把时间放在自己的事上。软件可以下载，机器还是得自己准备，性能得调，系统得盯，升级得做，故障得有人接。</p>
<div class="formula">总拥有成本 ≠ 软件授权价格</div>
<div class="split">
<div class="panel"><div class="mini">自己托管</div><h4>控制权，连同责任</h4><p>GPU 费用、工程师的时间、部署、监控、维护、故障响应，以及这些时间没花在别处的机会成本。</p></div>
<div class="panel"><div class="mini">托管服务</div><h4>服务费，把事情交出去</h4><p>平台费用、集成、对供应商的依赖，以及内部少做运维、交付更快之后，预期能省下来的部分。</p></div>
</div>
<p>这不是“托管一定更好”。基础设施成熟的团队可能更想自己托管。小团队付钱，把时间留在自己的产品上，也可能合理。产品问题是：对<strong>这个具体的客户</strong>，这项服务有没有带来足够的净价值。</p>
</section>

<section id="diagnosis">
<h2><span class="num">04</span> 客户已经在用别的引擎</h2>
<p>最改过我想法的是这种情况：一个开发者说，“我已经有推理引擎了，跑得也还行。为什么要换？”</p>
<p>我的第一反应不再是列功能。我想先看清他们现在的系统。</p>
<div class="steps">
<div class="step"><div class="n">1</div><h4>什么工作？</h4><p>哪些模型、硬件、prompt、流量形态、性能要求？</p></div>
<div class="step"><div class="n">2</div><h4>什么已经好用？</h4><p>团队为什么选了现在的工具？它已经擅长什么？</p></div>
<div class="step"><div class="n">3</div><h4>哪里不行？</h4><p>问题是延迟、吞吐、兼容、稳定性，还是运维工作量？</p></div>
<div class="step"><div class="n">4</div><h4>为什么要换？</h4><p>测到的改进，能不能盖过迁移和验证的成本？</p></div>
</div>
<p>这首先是搞清楚问题，然后才是比较产品。如果现在的引擎已经满足客户，<strong>不换可能就是对的答案</strong>。如果真有瓶颈，就在实际负载上比，而不是拿一个不相干的公开 benchmark 比。</p>
<figure>
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-04.svg" loading="lazy" decoding="async" alt="问题诊断的决策树：用户的抱怨、瓶颈的证据、合适的办法，以及对迁移值不值得的判断。" width="670" height="277"></div>
<figcaption>先看清工作和瓶颈。该做的事未必是换一个新的推理引擎。</figcaption>
</figure>
<p>学后训练的时候我也碰到同样的事：模型输出错了，不自动等于“去跑 RL”。Agent 可能缺上下文，工具调错了，或者指令写得不清楚。先弄明白失败是怎么发生的，训练才有意义。</p>
</section>

<section id="adoption">
<h2><span class="num">05</span> 功能好，不等于有人在用</h2>
<p>假设工程团队发了一个性能优化。Benchmark 很强，开发者却没有用起来。我做数据的直觉是先问：<strong>“用起来”到底指哪一件事？</strong></p>
<p>一个 GitHub star、一次文档访问、一次成功的第一次运行、一次持续的生产部署，是四件不同的事。流量和注意力可能有帮助，但它们不是结果。</p>
<h3>开发者的路径断在哪？</h3>
<figure class="wide">
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-05.svg" loading="lazy" decoding="async" alt="示意采用漏斗：1000 人知道，600 人读了文档，400 人试用，80 人第一次成功跑通，30 人用到生产。掉得最多的一步是从试用到第一次成功。" width="780" height="340"></div>
<figcaption>漏斗是示意，不是真实项目或公司的数据。问题从“怎么获得关注”变成“为什么用户到不了第一次有用的结果”。</figcaption>
</figure>
<p>如果 400 个开发者试用，只有 80 个完成第一次成功运行，再去买流量可能是错的。试用用户里的激活率只有 <strong>80 / 400 = 20%</strong>。改任何东西之前，我会先检查测量本身可不可靠，按模型和硬件拆开看，再找反复出现的安装失败。</p>
<div class="chain"><b>定义成功</b> → 找到掉下去的地方 → 看失败是怎么发生的 → 形成一个假设 → 改体验 → 再测一次</div>
<p>那套 <em>增长黑客</em> 框架到这里我开始觉得眼熟。获客、激活、留存、推荐、收入，说的是路径上不同的时刻。我受过统计分析的训练，也知道把相关当成因果有多容易。</p>
<h3>做一个小实验，不是铺一场大推广</h3>
<p>假设访谈里大家说快速上手指南看不懂。一种改法，是一份测过的、针对具体模型的指南，把兼容要求和报错写清楚。如果测得到、也做得了，团队可以拿它和现有指南比；不然就先做可用性测试，再分步改文档。</p>
<div class="table-wrap"><table>
<tbody><tr><th>问题</th><th>实验设计</th></tr>
<tr><td>假设</td><td>安装说明不清楚，挡住了第一次成功运行。</td></tr>
<tr><td>改什么</td><td>一份更简单、验证过的快速上手，针对一种符合条件的模型和硬件。</td></tr>
<tr><td>主指标</td><td>符合条件的试用用户里，第一次成功运行的比例。</td></tr>
<tr><td>护栏</td><td>配置错误、部署质量、后续支持的负担。</td></tr>
<tr><td>证据</td><td>合法拿到的使用数据，加上自愿参加的用户研究，以及 issue 里反复出现的主题。</td></tr>
</tbody></table></div>
<p>一个实际限制：开源项目往往看不到别人私有的自托管部署。这些指标可能拿不到，或者有偏差。诚实的产品研究可以用自愿问卷、社区反馈、支持 issue，以及有目标的可用性访谈，不必假装自己有完整的遥测。</p>
<div class="pull"><div class="eyebrow">衡量有用的采用</div><div class="statement">GitHub star 变多，不代表有更多开发者成功地用上了产品。</div><p class="detail">对开源基础设施，持续、有用的采用更接近目标，即便它更难直接量。商业平台还得看客户价值和留存。</p></div>
</section>

<section id="practice">
<h2><span class="num">06</span> 做产品的人可以补在哪里</h2>
<p>这个练习里最有意思的一点是：我不必变成写推理 kernel 的工程师，也能找到有意义的问题。我需要的是，技术上够明白一个功能的边界，判断上能找到用户卡在哪。</p>
<p>在一个小的基础设施团队里，产品、市场、开发者关系、技术写作、增长和工程可能会叠在一起。我会从这里开始：让开发者走的那条路更容易被看见，也更容易走完。</p>
<div class="steps">
<div class="workcard"><div class="tag eyebrow">项目想法 01</div><h4>Issue → 洞察简报</h4><p>读一组范围收好的公开 GitHub issue。把失败模式归类，分出用户是谁，看哪些已经解决，写一份短备忘，带上证据和不确定的地方。</p><div class="output">产出 · 带来源的用户痛点图，不是一份空想的功能清单。</div></div>
<div class="workcard"><div class="tag eyebrow">项目想法 02</div><h4>第一次运行体验审计</h4><p>在支持的环境里自己走一遍文档里的快速上手，或者看着一个开发者走。记下每一步让人迷惑的地方，提出具体改法。</p><div class="output">产出 · 可用性发现，加上一个可以拿去测的文档改进。</div></div>
<div class="workcard"><div class="tag eyebrow">项目想法 03</div><h4>性能 → 价值说明</h4><p>选一个真实的技术能力，讲清机制，写明什么时候有用、什么时候没有，并把说法绑在一份有代表性的负载上。</p><div class="output">产出 · 给开发者看的说明，写明测量条件。</div></div>
<div class="workcard"><div class="tag eyebrow">项目想法 04</div><h4>采用实验</h4><p>选一个已知的摩擦点，定一个说得通的成功指标，和相关团队一起做一个小干预，比较结果。</p><div class="output">产出 · 假设、改动、结果、局限，以及最后的决定。</div></div>
</div>
<p>这些是<strong>我设想的贡献路径</strong>，不是在说某家公司内部先做什么。第一步永远是去问团队：他们最重要的用户问题到底是什么。</p>
<h3>一个功能，两种说法</h3>
<p>同一项性能改进，听的人不同，讲法就不同。</p>
<figure>
<div class="svg-scroll">
<img src="/assets/posts/ai-infra-product-lens/figure-06.svg" loading="lazy" decoding="async" alt="同一项性能改进，对开发者讲和对做工程决策的人讲，说法不同。" width="660" height="230"></div>
<figcaption>技术上要说得一样准。框架跟着读者的工作变。</figcaption>
</figure>
</section>

<section>
<h2><span class="num">07</span> 我现在推荐一个工具之前会问什么</h2>
<p>这是我想带进任何技术产品对话的一小张清单：</p>
<ol>
<li><strong>问题在谁身上？</strong>说清楚用户是谁、负载是什么、谁做决定。</li>
<li><strong>他们现在在做什么？</strong>看清现有的做法，包括已经好用的部分。</li>
<li><strong>哪里失败了，为什么？</strong>先诊断，再选技术。</li>
<li><strong>什么会变好？</strong>把功能说成一个可以测量的用户结果或业务结果。</li>
<li><strong>用起来要付出什么？</strong>文档、迁移、稳定性，以及改变的成本。</li>
<li><strong>我们怎么知道？</strong>选一个诚实的指标，并承认它看不见的地方。</li>
</ol>
<blockquote><p>引擎更快，是技术上做成的事。让对的开发者用它做成事，是产品上做成的事。</p></blockquote>
<p>我还是想把底层系统搞懂。但现在学到缓存、调度或后训练，我也会问：谁需要它，他们面对什么取舍，什么样的证据能说服他们。我想把这些技术知识用到用户研究和产品工作里。</p>
</section>

<section>
<h2><span class="num">08</span> 公开资料和边界</h2>
<p class="small">上面的技术例子讲的是一般的产品模式。我没有用私下访谈、内部产品指标、公司机密，也没有对专有路线图下结论。漏斗和客户场景明确是示意。我自己的分析不是对任何项目的背书，也不代表官方立场。</p>
<ol class="references">
<li><a href="https://docs.sglang.io/">SGLang 文档</a>：开源模型服务、性能、API 和部署的基础。</li>
<li><a href="https://github.com/sgl-project/sglang/issues/42473">SGLang 公开的 2026 年第四季度路线图</a>：易用性、cookbook、部署更简单、兼容性，是公开写明的开发目标。</li>
<li><a href="https://github.com/sgl-project/sglang/issues/50045">SGLang 公开的 1.0 跟踪 issue</a>：生产稳定性和配置是否清楚，是开发者体验工作的一个例子。</li>
<li><a href="https://docs.vllm.ai/">vLLM 文档</a>：另一个开源推理服务框架，也是开发者可能会拿来比较的现有选择。</li>
<li><a href="/posts/ai-infra-from-zero-01">AI Infra From Zero：笔记 01</a>：我之前关于 prefill、decode、KV cache 和前缀复用的技术笔记。</li>
</ol>
</section>
<div class="footer">从模型怎么跑 → 到人为什么选择自己去跑。<br><a href="/posts">← 返回 AI 项目</a></div>
<nav class="next" aria-label="相关的 AI 基础设施文章"><a href="/posts/ai-infra-from-zero-02">为什么 GPU 还是瓶颈？</a><br><a href="/posts/ai-infra-from-zero-03">LLM 怎么同时服务几千个请求？</a></nav>
</div>
</div>
