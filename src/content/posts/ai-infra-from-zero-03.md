---
title: "How Does an LLM Serve Thousands of Requests?"
titleZh: "LLM 怎么同时服务几千个请求？"
lang: en
tags: ["AI"]
date: 2026-11-14
readTime: 12
slug: ai-infra-from-zero-03
series: "AI Infra Track Technology"
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">

<div class="lang-en">
<div class="infra-note infra-note--serving">


<div class="series">AI Infra Learning Notes · 03 / 05</div>

<div class="meta">From request queues and GPU workers to KV memory, scheduling, and routing</div>

<p class="note">This is the third note in my AI infrastructure learning series. The example throughout is a fictional startup building an AI coding agent with an open-source model such as Qwen. All token counts, timing examples, and dashboards are teaching assumptions, not measured benchmarks or a description of any one company's deployment. The diagrams show conceptual mechanisms rather than a complete production implementation.</p>

<!-- ============ 00 ============ -->
<h2><span class="num">00</span> One Model Is Not a Service</h2>
<p>In the first two notes, I learned what happens inside one model computation and why the GPU can become a bottleneck. I knew about prefill, decode, KV cache, memory bandwidth, and batching. But then I ran into a different question.</p>
<p>What if our coding agent suddenly has a thousand users?</p>
<p>It's tempting to think the hard part is just making Qwen's forward pass faster. But a production system has to make decisions <em>before</em> the next forward pass begins: which request should run, where should its KV states live, what happens if memory fills up, and which model replica should receive the next user?</p>
<blockquote><p>Making a model compute is one problem. Making thousands of users share that computation efficiently is another.</p></blockquote>
<p>That second problem is <strong>LLM serving</strong>. My mental model shifted from a single model processing a single prompt to a system continuously allocating scarce compute and memory across many requests.</p>

<!-- ============ 01 ============ -->
<h2><span class="num">01</span> The Whole Request Lifecycle</h2>
<p>Let's start with one user: “Find the bug in my Python repository and suggest a fix.” Here is the simplified path from the application to generated code.</p>
<figure class="wide">
<div class="diagram" role="img" aria-label="Request lifecycle: client and API, router, replica with request queue, scheduler and KV cache manager, GPU worker, and streaming response.">
<div class="figure-kicker">Figure 01 / The serving system at a glance</div>
<div class="node-wrap">
<div class="box"><div class="head">Client / API</div><div class="sub">Accept request · validate · prepare tokens</div></div>
<div class="arrow">↓</div>
<div class="box blue"><div class="head">Router</div><div class="sub">Choose a model replica or worker</div></div>
<div class="arrow">↓</div>
<div class="box"><div class="head">Request Queue</div><div class="sub">Requests waiting to enter execution</div></div>
<div class="arrow">↓</div>
<div class="mini-grid" style="max-width:490px;width:100%;margin:auto">
<div class="box highlight"><div class="head">Scheduler</div><div class="sub">Who runs next? How much work?</div></div>
<div class="box gold"><div class="head">KV Cache Manager</div><div class="sub">Reuse · allocate · evict</div></div>
</div>
<div class="flow-label">coordinate on every execution cycle</div>
<div class="arrow">↓</div>
<div class="box blue"><div class="head">Model Worker / GPU</div><div class="sub">Execute prefill and decode · update KV</div></div>
<div class="arrow">↓</div>
<div class="box"><div class="head">Streaming Response</div><div class="sub">Return generated tokens to the coding agent</div></div>
</div>
<div class="tiny-callout">This is a responsibility map, not a one-way assembly line. Scheduler, memory manager, and model worker repeatedly coordinate as tokens are generated.</div>
</div>
<figcaption>The router decides <em>where</em> a request goes. The scheduler decides <em>what runs next</em> inside the selected serving instance.</figcaption>
</figure>
<p>Those two decisions are easy to mix up. A router might distribute requests across multiple independent model replicas. Once a request reaches one replica, that replica's scheduler decides when to execute it alongside other requests.</p>
<p>Inside an engine, the request can move between <strong>waiting</strong> and <strong>running</strong> states. It may also finish, be cancelled, or be preempted when resources are insufficient. That is why the arrows above are only the beginning of the story.</p>

<!-- ============ 02 ============ -->
<h2><span class="num">02</span> The Scheduler: Who Gets to Run Next?</h2>
<p>Imagine A and B are already generating code. A new request, C, arrives with a long prompt. The engine doesn't have to wait until A and B finish their entire responses before considering C.</p>
<p>With <strong>continuous batching</strong>, the scheduler constructs a new execution workload across iterations. It can keep A and B decoding while admitting eligible work from C, subject to token budgets, memory limits, and the engine's scheduling policy.</p>
<figure>
<div class="diagram" role="img" aria-label="A conceptual time sequence showing A and B decoding alongside pieces of C's prompt prefill.">
<div class="figure-kicker">Figure 02 / Scheduling across iterations</div>
<div class="timeline">
<div class="lane-label">Iteration 1</div>
<div class="lane"><span class="d">A</span><span class="d">B</span><span class="q">C · prefill chunk</span></div>
<div class="lane-label">Iteration 2</div>
<div class="lane"><span class="d">A</span><span class="d">B</span><span class="q">C · prefill chunk</span></div>
<div class="lane-label">Iteration 3</div>
<div class="lane"><span class="d">A</span><span class="d">B</span><span class="q">C · final chunk</span></div>
<div class="lane-label">Iteration 4</div>
<div class="lane"><span class="d">A</span><span class="d">B</span><span class="d">C</span><span class="blank">all decoding</span></div>
</div>
<div class="legend"><span style="--c:#709EA0">Decode</span><span style="--c:#D6DD63">Prefill chunk</span></div>
<div class="fine" style="margin-top:14px">Conceptual mixed prefill/decode scheduling, not a measured GPU timeline. Real engines vary in whether and how these workloads can share an iteration.</div>
</div>
<figcaption>A running batch changes over time. It is not a permanent group that must finish together.</figcaption>
</figure>
<p>The scheduler also needs a policy for choosing among waiting requests. <strong>First-Come, First-Served (FCFS)</strong> respects arrival order; a <strong>Longest Prefix Match (LPM)</strong> policy can favor requests likely to reuse more cached context. The latter may save computation, but it can also delay older requests.</p>
<p>I initially framed the choice as fairness versus efficiency. Then I noticed that the missing variable is actual latency: how many milliseconds do we save in prefill, and how long has the bypassed user already waited?</p>
<div class="chain"><b>Scheduling policy → which work enters execution → queueing delay + GPU work → user latency and system throughput</b></div>

<!-- ============ 03 ============ -->
<h2><span class="num">03</span> KV Cache: Not All Occupied Memory Is Equal</h2>
<p>KV cache is both an accelerator and a constraint. It saves repeated attention-state computation, but it consumes finite GPU memory. The serving engine therefore needs to know not just how much memory is occupied, but <em>who still needs it</em>.</p>
<figure>
<div class="diagram" role="img" aria-label="KV cache capacity of 16 thousand token slots: 8 thousand active, 6 thousand inactive reusable, and 2 thousand free.">
<div class="figure-kicker">Figure 03 / A simplified 16K-slot KV pool</div>
<div class="kv-track"><div class="active">8K<small>active</small></div><div class="reuse">6K<small>evictable</small></div><div class="free">2K<small>free</small></div></div>
<div class="legend"><span style="--c:#587B8A">Required by running requests</span><span style="--c:#BC9565">Inactive cached prefixes</span><span style="--c:#D9D6C8">Unallocated</span></div>
<div class="line"></div>
<div class="mini-grid">
<div class="box"><div class="head">New request needs 5K slots</div><div class="sub">2K free + 3K reclaimed</div></div>
<div class="box highlight"><div class="head">No active preemption needed</div><div class="sub">Assuming reclaimable blocks can be allocated</div></div>
</div>
</div>
<figcaption>Evicting inactive cached states is different from interrupting a running request. The exact allocator may use blocks or pages, not literal individual-token slots.</figcaption>
</figure>
<p><strong>Reuse</strong> means a new request can use compatible cached prefix states instead of recomputing them. <strong>Eviction</strong> means discarding eligible inactive cached states to free space. <strong>Preemption</strong> means interrupting active execution when the engine cannot safely continue with its available resources.</p>
<p>The distinction matters. Reclaiming an inactive cached prefix may cause a future cache miss. Preempting a live request can delay a user who is already seeing output, and can require recomputing KV states when that request resumes.</p>
<p>To avoid mixing up requests, serving systems maintain logical request-to-token mappings and physical KV storage. A request's token sequence does not necessarily correspond to one contiguous region of GPU memory. Paged or block-based memory management makes allocations more flexible. <a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener">PagedAttention</a> is a well-known published example of this idea.</p>

<!-- ============ 04 ============ -->
<h2><span class="num">04</span> Admission, Waiting, and Preemption</h2>
<p>There is another layer of decision-making before the GPU executes anything. If a server receives more work than it can handle, should it accept the work into a queue, let it run now, or reject it promptly?</p>
<div class="steps">
<div class="step"><div class="n">1</div><h4>Accept</h4><p>The service allows the request into its system. That is not the same as having GPU resources ready now.</p></div>
<div class="step"><div class="n">2</div><h4>Wait</h4><p>The request remains queued until there is sufficient execution budget and KV capacity.</p></div>
<div class="step"><div class="n">3</div><h4>Run</h4><p>The scheduler admits eligible work into model execution, subject to configured limits.</p></div>
<div class="step"><div class="n">4</div><h4>Throttle / Reject</h4><p>The frontend or gateway limits excess traffic instead of allowing an unbounded backlog.</p></div>
</div>
<p>A subtle problem appears during decode. A request that fits into memory <em>now</em> may need more KV capacity as it generates additional tokens. If admission is too aggressive, requests can repeatedly get retracted and rescheduled. The engine makes room, then may spend more GPU time recovering lost work.</p>
<blockquote><p>Admitting more requests can make a system less productive if too many of them keep getting interrupted.</p></blockquote>
<p>So admission control is partly about anticipating future resource demand, not merely checking whether memory is available at this instant.</p>

<!-- ============ 05 ============ -->
<h2><span class="num">05</span> GPU Workers and the Two Ways to Use Two GPUs</h2>
<p>Once the scheduler selects work, a model worker or runner prepares the tensors, attention metadata, and KV mappings needed for GPU computation. The GPU performs the actual model operations; output tokens are sampled and returned for the next round of scheduling.</p>
<p>When we add a second GPU, we face an architectural choice.</p>
<figure>
<div class="diagram" role="img" aria-label="Comparison of tensor parallelism, in which two GPUs cooperate on one sharded model, and data parallelism, in which each GPU hosts an independent full model replica.">
<div class="figure-kicker">Figure 04 / Tensor parallelism vs. data parallelism</div>
<div class="mini-grid">
<div>
<div class="box blue"><div class="head">Tensor Parallelism</div><div class="sub">One model, two shards</div></div>
<div class="arrow">↓</div>
<div class="mini-grid" style="gap:5px"><div class="box blue"><div class="head">GPU 1</div><div class="sub">Shard A</div></div><div class="box blue"><div class="head">GPU 2</div><div class="sub">Shard B</div></div></div>
<div class="fine" style="text-align:center;margin-top:10px">GPUs cooperate and exchange intermediate data.</div>
</div>
<div>
<div class="box highlight"><div class="head">Data Parallelism</div><div class="sub">Two independent replicas</div></div>
<div class="arrow">↓</div>
<div class="mini-grid" style="gap:5px"><div class="box highlight"><div class="head">GPU 1</div><div class="sub">Full model</div></div><div class="box highlight"><div class="head">GPU 2</div><div class="sub">Full model</div></div></div>
<div class="fine" style="text-align:center;margin-top:10px">Each replica serves a separate request workload.</div>
</div>
</div>
</div>
<figcaption>If the model fits comfortably on one GPU and the main challenge is serving more users, independent replicas are often a useful baseline. But this is a hypothesis to benchmark, not a universal rule.</figcaption>
</figure>
<p><strong>Data parallelism</strong> avoids cross-GPU synchronization during ordinary independent inference, at the cost of duplicating model weights and having separate KV caches. <strong>Tensor parallelism</strong> can make an oversized model fit or speed up demanding computation, but its GPUs must coordinate, and communication can erase the benefit.</p>
<p>For our coding agent, I leaned toward data parallelism first: the Qwen model already fits on one GPU, and the problem is concurrent user demand. I would still measure throughput, tail latency, KV capacity, and cost before treating that choice as final.</p>

<!-- ============ 06 ============ -->
<h2><span class="num">06</span> Routing: The Least Busy GPU May Not Be the Fastest</h2>
<p>Independent replicas introduce a new problem. Each GPU has its own working set of cached prefixes. If a coding agent repeatedly sends the same repository context, the replica that already processed it might save substantial prefill work.</p>
<p>But the cached replica might also be overloaded.</p>
<figure>
<div class="diagram" role="img" aria-label="Route a new 10K input request between a busy GPU with 8K prefix cached and a less busy GPU with no matching cached prefix.">
<div class="figure-kicker">Figure 05 / Cache locality vs. load</div>
<div class="box" style="max-width:410px;margin:0 auto"><div class="head">New coding-agent request · 10K input tokens</div><div class="sub">First 8K tokens are a previously seen prefix</div></div>
<div class="arrow">↓</div>
<div class="box blue" style="max-width:220px;margin:0 auto"><div class="head">Request router</div><div class="sub">Where should this request go?</div></div>
<div class="arrow">↙ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↘</div>
<div class="mini-grid">
<div class="route-card">
<h4>GPU 1 · Cache-rich</h4><p>12 active requests</p><span class="tag rust">High load</span>
<div class="meter"><span style="width:85%;background:#C5A176"></span></div>
<div class="metric">8K</div><div class="metric-label">reusable prefix tokens</div>
<div class="line"></div><div class="fine">Less new prefill, potentially more queueing.</div>
</div>
<div class="route-card">
<h4>GPU 2 · Cache-cold</h4><p>3 active requests</p><span class="tag green">Lower load</span>
<div class="meter"><span style="width:25%;background:#78978A"></span></div>
<div class="metric">0K</div><div class="metric-label">matching cached tokens</div>
<div class="line"></div><div class="fine">More new prefill, potentially less queueing.</div>
</div>
</div>
<div class="tiny-callout">The winner depends on saved computation <em>and</em> current waiting time. Cache-aware does not mean cache-only.</div>
</div>
<figcaption>A router should consider both cache locality and load. A predicted cache match may also be stale if the cached blocks have already been evicted.</figcaption>
</figure>
<p>Compare three strategies:</p>
<div class="table-wrap"><table><thead><tr><th>Strategy</th><th>Core idea</th><th>Blind spot</th></tr></thead><tbody>
<tr><td>Round robin</td><td>Rotate requests between replicas</td><td>Requests have very different costs</td></tr>
<tr><td>Load-aware</td><td>Prefer workers estimated to be less busy</td><td>May throw away valuable cached prefixes</td></tr>
<tr><td>Cache-aware</td><td>Consider reusable prefixes and worker load</td><td>Can overload a cache-rich worker if tuned poorly</td></tr>
</tbody></table></div>
<p>One result surprised me: a higher cache hit rate can coexist with <em>worse</em> user latency.</p>
<div class="table-wrap"><table><thead><tr><th>Hypothetical metric</th><th class="r">Before</th><th class="r">After</th></tr></thead><tbody>
<tr><td>Prefix cache hit rate</td><td class="r">30%</td><td class="r">75%</td></tr>
<tr><td>p95 TTFT</td><td class="r">400 ms</td><td class="r">900 ms</td></tr>
<tr><td>Replica loads</td><td class="r">Balanced</td><td class="r">Uneven</td></tr>
</tbody></table></div>
<p>The cache-aware router may have concentrated too much traffic on a few replicas. Less prefill computation helped, but longer queues hurt even more. It would be a mistake to celebrate the hit-rate increase without checking the full latency distribution.</p>
<div class="formula">TTFT ≈ <i>queueing</i> + <i>prefill</i> + <i>other costs</i></div>
<p class="note">This is a simplified decomposition. Real engines can overlap work, and the time to first output also involves execution scheduling, sampling, and networking. Cache-hit percentages alone cannot predict how much TTFT will improve.</p>

<!-- ============ 07 ============ -->
<h2><span class="num">07</span> Diagnosing a Slow Service, Not Just a Slow Model</h2>
<p>Once I had the full system in mind, one question became much easier: what do we investigate when users say the coding agent is slow?</p>
<div class="table-wrap"><table><thead><tr><th>What users experience</th><th>First metrics to inspect</th><th>Possible mechanisms</th></tr></thead><tbody>
<tr><td>No response for a long time</td><td>TTFT, queue wait, prefill duration</td><td>Routing imbalance, backlog, long prefill</td></tr>
<tr><td>Code starts flowing, then freezes</td><td>ITL distribution, preemption, forward duration</td><td>Scheduling delay, memory pressure, interference</td></tr>
<tr><td>GPUs are busy, but few requests finish</td><td>Throughput, goodput, work mix</td><td>Excess recomputation, ineffective batching, saturation</td></tr>
</tbody></table></div>
<p>One of our exercises had this imaginary dashboard:</p>
<figure>
<div class="diagram" role="img" aria-label="Example production dashboard with 600 millisecond TTFT, 180 millisecond ITL, 95 percent KV utilization, and rising preemptions.">
<div class="figure-kicker">Figure 06 / A diagnosis exercise</div>
<div class="mini-grid">
<div class="route-card"><h4>p95 TTFT</h4><div class="metric">600 <span style="font-size:16px">ms</span></div><div class="metric-label">Inside the assumed 1s target</div></div>
<div class="route-card"><h4>p95 ITL</h4><div class="metric" style="color:#9A4E2C">180 <span style="font-size:16px">ms</span></div><div class="metric-label">Above the assumed 50ms target</div></div>
<div class="route-card"><h4>KV utilization</h4><div class="metric">95<span style="font-size:16px">%</span></div><div class="metric-label">Near capacity</div></div>
<div class="route-card"><h4>Preemptions</h4><div class="metric" style="font-size:24px;color:#9A4E2C">Rising</div><div class="metric-label">Requests repeatedly interrupted</div></div>
</div>
<div class="tiny-callout">Hypothesis to test: KV pressure → more preemptions → waiting or recomputation → larger gaps between output tokens.</div>
</div>
<figcaption>These numbers are invented. The point is to connect symptoms to mechanisms rather than guessing from a single metric.</figcaption>
</figure>
<p>My first instinct was: “Decode is slow, so the GPU worker must be slow.” That's not precise enough.</p>
<p>The user sees <strong>inter-token latency (ITL)</strong>, the interval between delivered output tokens. A long interval might mean the GPU forward computation itself takes longer. But it might also mean the request is waiting for its next turn, or that it was preempted and needs some KV state recomputed.</p>
<div class="formula">Observed ITL ≠ GPU forward duration alone</div>
<p>In the example above, I would first look for a relationship between preemption spikes and ITL spikes, then inspect per-iteration execution time. High KV utilization is a warning sign, not proof by itself. Likewise, high GPU utilization is not inherently bad, it matters whether the GPU is completing valuable work.</p>
<h3>What Changes When We Limit Concurrency?</h3>
<p>Suppose we reduce the maximum number of running requests per worker, from 32 to 24, and get these hypothetical results:</p>
<div class="table-wrap"><table><thead><tr><th>Metric</th><th class="r">Before</th><th class="r">After</th></tr></thead><tbody>
<tr><td>p95 ITL</td><td class="r">180 ms</td><td class="r">65 ms</td></tr>
<tr><td>p95 TTFT</td><td class="r">600 ms</td><td class="r">950 ms</td></tr>
<tr><td>Aggregate output throughput</td><td class="r">2,800 tok/s</td><td class="r">2,300 tok/s</td></tr>
</tbody></table></div>
<p>Existing users now see smoother code generation. New users wait longer. The service produces fewer output tokens each second. Is that a win?</p>
<p>It depends on the product. An interactive coding assistant might value smooth output enough to accept the trade-off. A background code-analysis pipeline might prefer total completed work. I would also measure <strong>goodput</strong>: how many requests meet the application's latency targets, rather than treating raw throughput as the whole answer.</p>

<!-- ============ 08 ============ -->
<h2><span class="num">08</span> The Mental Model I Wanted</h2>
<p>At the beginning of this module, I pictured a request moving into a GPU, getting processed, and returning an answer. That was too linear.</p>
<p>Now I think of a serving engine as a set of decisions that repeat:</p>
<div class="chain">New requests arrive → the router chooses a replica → requests wait or become eligible → the scheduler chooses token work → cache management allocates or reclaims memory → GPU workers execute → results stream back → the system schedules again</div>
<p>And every optimization has a cost somewhere else:</p>
<ul>
<li>Favor cached requests, and other users may wait longer.</li>
<li>Admit more concurrent requests, and KV pressure may trigger repeated preemption.</li>
<li>Reduce concurrent work, and streaming may become smoother while queueing gets worse.</li>
<li>Split a model across GPUs, and communication may offset the benefit.</li>
<li>Replicate models across GPUs, and routing determines how effectively their separate caches are used.</li>
</ul>
<blockquote><p>Workload → Bottleneck → Engineering trade-off → Customer value.</p></blockquote>
<p>That's the chain I want to be able to explain, not just the vocabulary. If a coding-agent startup says users are waiting too long or generation keeps freezing, I now know to ask <em>which kind of waiting</em>, <em>which resource is actually constrained</em>, and <em>what gets worse if we optimize it</em>.</p>
<p>That takes me to the next question: once we understand the serving system, how does a real inference engine implement these mechanisms efficiently?</p>

<h2><span class="num">—</span> References</h2>
<ol class="refs">
<li><a href="https://www.usenix.org/conference/osdi22/presentation/yu" target="_blank" rel="noopener">Yu et al., Orca: A Distributed Serving System for Transformer-Based Generative Models (OSDI 2022)</a>: iteration-level scheduling and batching.</li>
<li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener">Kwon et al., Efficient Memory Management for Large Language Model Serving with PagedAttention (2023)</a>: block-based KV memory management.</li>
<li><a href="https://arxiv.org/abs/2401.09670" target="_blank" rel="noopener">Zhong et al., DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving (2024)</a>: prefill/decode interference and service objectives.</li>
<li><a href="https://docs.vllm.ai/en/latest/design/prefix_caching.html" target="_blank" rel="noopener">vLLM documentation: Automatic Prefix Caching</a>: a public example of reusable KV prefixes and cache management.</li>
</ol>
<p class="note">Scope and limitations: These notes synthesize general serving concepts from public research and documentation. Implementations differ in scheduling, cache eviction, routing, batching, and preemption details. All diagrams and benchmark-like values are illustrative, not measurements or production claims. Prefix reuse requires compatible requests and cache residency; improved hit rate or GPU utilization does not guarantee improved latency.</p>
<div class="next">Next · 04: Inside an inference engine: how prefix-aware serving is actually built.</div>
<nav class="next" aria-label="Related AI infrastructure articles"><a href="/posts/ai-infra-product-lens">What Makes AI Infrastructure Worth Using?</a><br><a href="/posts/ai-infra-from-zero-02">Why Is the GPU Still a Bottleneck?</a></nav>
</div>
</div>

<div class="lang-zh">
<div class="infra-note infra-note--serving">


<div class="series">AI Infra 学习笔记 · 03 / 05</div>

<div class="meta">从请求队列和 GPU worker，到 KV 显存、调度和路由</div>

<p class="note">这是我 AI 基础设施学习系列的第三篇。贯穿全文的例子是一家虚构的创业公司，用 Qwen 这样的开源模型做 AI 编程助手。所有 token 数量、时间例子和仪表盘都是为了讲清楚而设的假设，不是实测 benchmark，也不是在描述某一家公司的部署。图讲的是概念上的机制，不是一套完整的生产实现。</p>

<!-- ============ 00 ============ -->
<h2><span class="num">00</span> 有一个模型，还不等于有一项服务</h2>
<p>前两篇里，我学的是一次模型计算里面发生什么，以及 GPU 为什么会变成瓶颈。Prefill、decode、KV cache、显存带宽、batching，这些我都知道了。然后我碰到另一个问题。</p>
<p>如果我们的编程助手突然有了一千个用户呢？</p>
<p>很容易觉得，难的部分就是把 Qwen 的前向计算做快。但一套生产系统在下一次前向计算开始<em>之前</em>就要做决定：哪个请求该跑，它的 KV 状态放在哪，显存满了怎么办，下一个用户该进哪一个模型副本。</p>
<blockquote><p>让模型算起来，是一个问题。让几千个用户高效地共用这次计算，是另一个问题。</p></blockquote>
<p>第二个问题就是 <strong>LLM serving</strong>。我脑子里的图，从“一个模型处理一条提示词”，变成“一个系统在很多请求之间，持续分配紧缺的计算和显存”。</p>

<!-- ============ 01 ============ -->
<h2><span class="num">01</span> 一个请求的整段生命周期</h2>
<p>先看一个用户：“帮我在 Python 仓库里找到 bug，并给一个改法。”下面是从应用到生成代码的简化路径。</p>
<figure class="wide">
<div class="diagram" role="img" aria-label="请求的生命周期：客户端和 API、路由器、带请求队列的副本、调度器和 KV cache 管理、GPU worker，以及流式响应。">
<div class="figure-kicker">图 01 / 服务系统一眼看过去</div>
<div class="node-wrap">
<div class="box"><div class="head">客户端 / API</div><div class="sub">接收请求 · 校验 · 准备 token</div></div>
<div class="arrow">↓</div>
<div class="box blue"><div class="head">路由器</div><div class="sub">选一个模型副本或 worker</div></div>
<div class="arrow">↓</div>
<div class="box"><div class="head">请求队列</div><div class="sub">等着进入执行的请求</div></div>
<div class="arrow">↓</div>
<div class="mini-grid" style="max-width:490px;width:100%;margin:auto">
<div class="box highlight"><div class="head">调度器</div><div class="sub">下一个跑谁？跑多少？</div></div>
<div class="box gold"><div class="head">KV Cache 管理</div><div class="sub">复用 · 分配 · 驱逐</div></div>
</div>
<div class="flow-label">每一轮执行都要配合</div>
<div class="arrow">↓</div>
<div class="box blue"><div class="head">模型 Worker / GPU</div><div class="sub">执行 prefill 和 decode · 更新 KV</div></div>
<div class="arrow">↓</div>
<div class="box"><div class="head">流式响应</div><div class="sub">把生成的 token 交回编程助手</div></div>
</div>
<div class="tiny-callout">这是一张职责图，不是一条单向流水线。token 在生成的过程中，调度器、显存管理和模型 worker 会反复配合。</div>
</div>
<figcaption>路由器决定请求去<em>哪</em>。调度器决定，在选中的那台服务实例里，<em>下一轮跑什么</em>。</figcaption>
</figure>
<p>这两个决定很容易混在一起。路由器可以把请求分到多个彼此独立的模型副本上。请求进了某一个副本之后，这个副本的调度器再决定什么时候把它和其他请求一起执行。</p>
<p>在引擎内部，请求可以在<strong>等待</strong>和<strong>运行</strong>之间来回。它也可能结束、被取消，或者在资源不够时被抢占。所以上面的箭头只是故事的开头。</p>

<!-- ============ 02 ============ -->
<h2><span class="num">02</span> 调度器：下一轮轮到谁？</h2>
<p>想象 A 和 B 已经在生成代码。一个新请求 C 到了，提示词很长。引擎不必等 A 和 B 把整段回答生成完，才来考虑 C。</p>
<p>有了<strong>连续 batching</strong>，调度器会在一次次迭代里重新组这一轮要执行的工作。在 token 预算、显存上限和引擎的调度策略允许的范围内，它可以让 A 和 B 继续 decode，同时放进 C 里符合条件的那部分工作。</p>
<figure>
<div class="diagram" role="img" aria-label="一张概念上的时间顺序：A 和 B 在 decode，旁边是 C 的提示词 prefill 被切成的几段。">
<div class="figure-kicker">图 02 / 跨迭代的调度</div>
<div class="timeline">
<div class="lane-label">迭代 1</div>
<div class="lane"><span class="d">A</span><span class="d">B</span><span class="q">C · prefill 一块</span></div>
<div class="lane-label">迭代 2</div>
<div class="lane"><span class="d">A</span><span class="d">B</span><span class="q">C · prefill 一块</span></div>
<div class="lane-label">迭代 3</div>
<div class="lane"><span class="d">A</span><span class="d">B</span><span class="q">C · 最后一块</span></div>
<div class="lane-label">迭代 4</div>
<div class="lane"><span class="d">A</span><span class="d">B</span><span class="d">C</span><span class="blank">都在 decode</span></div>
</div>
<div class="legend"><span style="--c:#709EA0">Decode</span><span style="--c:#D6DD63">Prefill 的一块</span></div>
<div class="fine" style="margin-top:14px">这是概念上的 prefill / decode 混合调度，不是测出来的 GPU 时间线。真实引擎在“这些工作能不能、以及怎么共用同一次迭代”上并不一样。</div>
</div>
<figcaption>正在跑的 batch 会随时间变。它不是一个必须一起结束的固定小组。</figcaption>
</figure>
<p>调度器还要有一套办法，在等待的请求里挑。 <strong>先到先服务（FCFS）</strong>尊重到达顺序；<strong>最长前缀匹配（LPM）</strong>可以优先那些可能复用更多缓存上下文的请求。后者可能省计算，但也可能让更早到的请求等更久。</p>
<p>我一开始把这个选择理解成公平对效率。后来发现缺的那个变量是真实的延迟：prefill 能省下多少毫秒，被插队的用户已经等了多久？</p>
<div class="chain"><b>调度策略 → 哪一份工作进入执行 → 排队延迟 + GPU 上的工作 → 用户延迟和系统吞吐</b></div>

<!-- ============ 03 ============ -->
<h2><span class="num">03</span> KV Cache：占着的显存并不都一样</h2>
<p>KV cache 既是加速器，也是约束。它省下重复计算 attention 状态的工作，但吃掉有限的 GPU 显存。所以服务引擎要知道的不只是占了多少显存，还有<em>谁还需要它</em>。</p>
<figure>
<div class="diagram" role="img" aria-label="KV cache 容量一共 1.6 万个 token 槽：8000 个正在使用，6000 个不活跃但可以复用，2000 个空闲。">
<div class="figure-kicker">图 03 / 一个简化的 16K 槽位 KV 池</div>
<div class="kv-track"><div class="active">8K<small>使用中</small></div><div class="reuse">6K<small>可驱逐</small></div><div class="free">2K<small>空闲</small></div></div>
<div class="legend"><span style="--c:#587B8A">正在跑的请求还需要</span><span style="--c:#BC9565">不活跃的缓存前缀</span><span style="--c:#D9D6C8">还没分配</span></div>
<div class="line"></div>
<div class="mini-grid">
<div class="box"><div class="head">新请求需要 5K 个槽</div><div class="sub">2K 空闲 + 3K 回收来的</div></div>
<div class="box highlight"><div class="head">不必抢占正在跑的请求</div><div class="sub">前提是可回收的块能够分配出去</div></div>
</div>
</div>
<figcaption>清掉不活跃的缓存，和打断一个正在跑的请求，不是一回事。真正的分配器可能用的是块或页，不是字面上一个一个 token 的槽。</figcaption>
</figure>
<p><strong>复用</strong>是说，新请求可以用兼容的缓存前缀，而不必重算。<strong>驱逐</strong>是说，丢掉符合条件、已经不活跃的缓存，把空间腾出来。<strong>抢占</strong>是说，引擎靠现有资源没法安全地继续时，打断正在进行的执行。</p>
<p>这个差别要紧。收回一个不活跃的缓存前缀，以后可能会缓存未命中。抢占一个正在跑的请求，会让已经在看输出的用户变慢，请求恢复时还可能要重算 KV 状态。</p>
<p>为了不把请求混在一起，服务系统会维护“请求到 token”的逻辑映射，以及物理上的 KV 存储。一个请求的 token 序列，不一定对应 GPU 显存里连续的一块。按页或按块管理显存，分配会更灵活。<a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener">PagedAttention</a> 是这个想法一个广为人知的公开例子。</p>

<!-- ============ 04 ============ -->
<h2><span class="num">04</span> 接收、等待和抢占</h2>
<p>GPU 真正执行之前，还有一层决定。如果一台服务器收到的工作超过它处理得了的量，它该把工作接进队列、现在就跑，还是立刻拒绝？</p>
<div class="steps">
<div class="step"><div class="n">1</div><h4>接收</h4><p>服务允许这个请求进入系统。这不等于 GPU 资源现在就准备好了。</p></div>
<div class="step"><div class="n">2</div><h4>等待</h4><p>请求留在队列里，直到执行预算和 KV 容量都够。</p></div>
<div class="step"><div class="n">3</div><h4>运行</h4><p>调度器把符合条件的工作放进模型执行，同时受配置好的上限约束。</p></div>
<div class="step"><div class="n">4</div><h4>限流 / 拒绝</h4><p>前端或网关把多余的流量挡住，而不是让积压没有上限地涨。</p></div>
</div>
<p>Decode 期间会出现一个不容易注意到的问题。一个请求<em>现在</em>放得进显存，生成更多 token 之后可能需要更多 KV 容量。如果接收太激进，请求会反复被撤下来、再重新调度。引擎腾出了地方，然后可能花更多 GPU 时间去补回丢掉的工作。</p>
<blockquote><p>接进更多请求，如果其中太多一直被打断，系统完成的活可能反而更少。</p></blockquote>
<p>所以准入控制有一部分是在预估后面还要多少资源，不只是看这一瞬间显存够不够。</p>

<!-- ============ 05 ============ -->
<h2><span class="num">05</span> GPU Worker，以及两块 GPU 的两种用法</h2>
<p>调度器选好工作之后，模型 worker（或 runner）会准备好 GPU 计算需要的张量、attention 元数据和 KV 映射。GPU 做实际的模型运算；输出 token 被采样出来，交回下一轮调度。</p>
<p>加上第二块 GPU 时，我们要做一个架构上的选择。</p>
<figure>
<div class="diagram" role="img" aria-label="张量并行和数据并行的对照：张量并行是两块 GPU 合力算一个被切开的模型，数据并行是每块 GPU 上放一个独立的完整模型副本。">
<div class="figure-kicker">图 04 / 张量并行和数据并行</div>
<div class="mini-grid">
<div>
<div class="box blue"><div class="head">张量并行</div><div class="sub">一个模型，两片分片</div></div>
<div class="arrow">↓</div>
<div class="mini-grid" style="gap:5px"><div class="box blue"><div class="head">GPU 1</div><div class="sub">分片 A</div></div><div class="box blue"><div class="head">GPU 2</div><div class="sub">分片 B</div></div></div>
<div class="fine" style="text-align:center;margin-top:10px">GPU 一起算，并交换中间数据。</div>
</div>
<div>
<div class="box highlight"><div class="head">数据并行</div><div class="sub">两个独立的副本</div></div>
<div class="arrow">↓</div>
<div class="mini-grid" style="gap:5px"><div class="box highlight"><div class="head">GPU 1</div><div class="sub">完整模型</div></div><div class="box highlight"><div class="head">GPU 2</div><div class="sub">完整模型</div></div></div>
<div class="fine" style="text-align:center;margin-top:10px">每个副本服务各自的请求。</div>
</div>
</div>
</div>
<figcaption>如果模型在一块 GPU 上放得比较宽松，主要的挑战是服务更多用户，独立副本常常是一个有用的起点。但这是一个要拿去测的假设，不是普遍规则。</figcaption>
</figure>
<p><strong>数据并行</strong>在普通的、彼此独立的推理里不必做跨 GPU 同步，代价是模型权重要复制一份，KV cache 也是分开的。<strong>张量并行</strong>可以让一个放不进单卡的模型放进去，或者加快很重的计算，但 GPU 必须互相配合，通信可能把好处吃掉。</p>
<p>对我们的编程助手，我更倾向先用数据并行：这个 Qwen 模型已经放得进一块 GPU，问题是同时来的用户。在把这个选择当成定论之前，我还是会去量吞吐、尾部延迟、KV 容量和成本。</p>

<!-- ============ 06 ============ -->
<h2><span class="num">06</span> 路由：最闲的那块 GPU 不一定最快</h2>
<p>独立副本带来一个新问题。每块 GPU 自己缓存着一组前缀。如果编程助手反复发来同一个仓库的上下文，已经处理过它的那个副本，可能省下相当多的 prefill。</p>
<p>但缓存命中的那个副本，也可能已经很忙。</p>
<figure>
<div class="diagram" role="img" aria-label="把一个 10K 输入的新请求，分到一块很忙、但缓存了 8K 前缀的 GPU，或者一块比较闲、但没有匹配缓存前缀的 GPU。">
<div class="figure-kicker">图 05 / 缓存局部性和负载</div>
<div class="box" style="max-width:410px;margin:0 auto"><div class="head">编程助手的新请求 · 10K 输入 token</div><div class="sub">前 8K 个 token 是见过的前缀</div></div>
<div class="arrow">↓</div>
<div class="box blue" style="max-width:220px;margin:0 auto"><div class="head">请求路由器</div><div class="sub">这个请求该去哪？</div></div>
<div class="arrow">↙ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↘</div>
<div class="mini-grid">
<div class="route-card">
<h4>GPU 1 · 缓存多</h4><p>12 个正在处理的请求</p><span class="tag rust">负载高</span>
<div class="meter"><span style="width:85%;background:#C5A176"></span></div>
<div class="metric">8K</div><div class="metric-label">可复用的前缀 token</div>
<div class="line"></div><div class="fine">新的 prefill 更少，排队可能更久。</div>
</div>
<div class="route-card">
<h4>GPU 2 · 缓存冷</h4><p>3 个正在处理的请求</p><span class="tag green">负载较低</span>
<div class="meter"><span style="width:25%;background:#78978A"></span></div>
<div class="metric">0K</div><div class="metric-label">匹配上的缓存 token</div>
<div class="line"></div><div class="fine">新的 prefill 更多，排队可能更短。</div>
</div>
</div>
<div class="tiny-callout">哪边赢，取决于省下的计算<em>和</em>现在的等待时间。知道缓存，不等于只看缓存。</div>
</div>
<figcaption>路由器应该同时看缓存局部性和负载。如果缓存块已经被驱逐，预测中的缓存命中也可能是过期的。</figcaption>
</figure>
<p>比较三种策略：</p>
<div class="table-wrap"><table><thead><tr><th>策略</th><th>核心想法</th><th>看不见的地方</th></tr></thead><tbody>
<tr><td>轮询</td><td>请求在副本之间轮着来</td><td>请求的成本可以差很多</td></tr>
<tr><td>看负载</td><td>优先估计上比较闲的 worker</td><td>可能丢掉很有价值的缓存前缀</td></tr>
<tr><td>看缓存</td><td>同时考虑可复用的前缀和 worker 的负载</td><td>调得不好时，会把缓存多的 worker 压满</td></tr>
</tbody></table></div>
<p>有一个结果出乎我意料：缓存命中率更高，可以和<em>更差</em>的用户延迟同时出现。</p>
<div class="table-wrap"><table><thead><tr><th>假设的指标</th><th class="r">之前</th><th class="r">之后</th></tr></thead><tbody>
<tr><td>前缀缓存命中率</td><td class="r">30%</td><td class="r">75%</td></tr>
<tr><td>p95 TTFT</td><td class="r">400 ms</td><td class="r">900 ms</td></tr>
<tr><td>副本负载</td><td class="r">比较均衡</td><td class="r">不均衡</td></tr>
</tbody></table></div>
<p>考虑缓存的路由器可能把太多流量集中到少数几个副本上。Prefill 的计算少了，但更长的队列伤得更多。只庆祝命中率上升、不去看完整的延迟分布，会看错。</p>
<div class="formula">TTFT ≈ <i>排队</i> + <i>prefill</i> + <i>其他开销</i></div>
<p class="note">这是一个简化的拆法。真实引擎里工作可以重叠，等到第一个输出的时间还包括执行调度、采样和网络。单看缓存命中的百分比，预测不了 TTFT 会改善多少。</p>

<!-- ============ 07 ============ -->
<h2><span class="num">07</span> 诊断的是变慢的服务，不只是变慢的模型</h2>
<p>脑子里有了整套系统之后，有一个问题变得好答很多：用户说编程助手慢，我们该去查什么？</p>
<div class="table-wrap"><table><thead><tr><th>用户感受到的</th><th>先看哪些指标</th><th>可能的机制</th></tr></thead><tbody>
<tr><td>很久都没有响应</td><td>TTFT、排队等待、prefill 花了多久</td><td>路由不均衡、积压、prefill 很长</td></tr>
<tr><td>代码开始往外流，然后卡住</td><td>ITL 的分布、抢占、前向计算花了多久</td><td>调度延迟、显存压力、互相干扰</td></tr>
<tr><td>GPU 很忙，但完成的请求很少</td><td>吞吐、有效吞吐、工作构成</td><td>重算太多、batching 没有效果、已经饱和</td></tr>
</tbody></table></div>
<p>我们有一次练习用的是这样一张虚构的仪表盘：</p>
<figure>
<div class="diagram" role="img" aria-label="一张示例仪表盘：TTFT 600 毫秒，ITL 180 毫秒，KV 利用率 95%，抢占在上升。">
<div class="figure-kicker">图 06 / 一次诊断练习</div>
<div class="mini-grid">
<div class="route-card"><h4>p95 TTFT</h4><div class="metric">600 <span style="font-size:16px">ms</span></div><div class="metric-label">在假设的 1 秒目标之内</div></div>
<div class="route-card"><h4>p95 ITL</h4><div class="metric" style="color:#9A4E2C">180 <span style="font-size:16px">ms</span></div><div class="metric-label">高于假设的 50 毫秒目标</div></div>
<div class="route-card"><h4>KV 利用率</h4><div class="metric">95<span style="font-size:16px">%</span></div><div class="metric-label">接近容量上限</div></div>
<div class="route-card"><h4>抢占</h4><div class="metric" style="font-size:24px;color:#9A4E2C">在上升</div><div class="metric-label">请求被反复打断</div></div>
</div>
<div class="tiny-callout">要去检验的假设：KV 压力 → 更多抢占 → 等待或重算 → 输出 token 之间的空隙变大。</div>
</div>
<figcaption>这些数字是编的。重点是把症状接到机制上，而不是凭一个指标去猜。</figcaption>
</figure>
<p>我的第一反应是：“Decode 慢，所以 GPU worker 一定慢。”这不够精确。</p>
<p>用户看到的是 <strong>token 间隔（ITL）</strong>，也就是交到手上的输出 token 之间隔了多久。间隔长，可能是 GPU 前向计算本身更久了。也可能是请求在等下一轮轮到自己，或者它被抢占了，有些 KV 状态要重算。</p>
<div class="formula">观察到的 ITL ≠ 只有 GPU 前向计算的时间</div>
<p>在上面的例子里，我会先看抢占的尖峰和 ITL 的尖峰有没有关系，再去看每一次迭代的执行时间。KV 利用率高是一个警告，本身不是证明。同样，GPU 利用率高并不自动是坏事，要看 GPU 完成的是不是有价值的工作。</p>
<h3>把并发限下来，会变什么？</h3>
<p>假设我们把每个 worker 同时运行的请求上限从 32 降到 24，得到这些假设的结果：</p>
<div class="table-wrap"><table><thead><tr><th>指标</th><th class="r">之前</th><th class="r">之后</th></tr></thead><tbody>
<tr><td>p95 ITL</td><td class="r">180 ms</td><td class="r">65 ms</td></tr>
<tr><td>p95 TTFT</td><td class="r">600 ms</td><td class="r">950 ms</td></tr>
<tr><td>合计输出吞吐</td><td class="r">2,800 tok/s</td><td class="r">2,300 tok/s</td></tr>
</tbody></table></div>
<p>已经在用的用户，代码生成更顺了。新用户等得更久。服务每秒产出的输出 token 变少了。这算赢吗？</p>
<p>取决于产品。交互式的编程助手可能愿意用这个取舍，换更顺的输出。后台的代码分析流水线可能更想要完成的总工作量。我还会去量<strong>有效吞吐（goodput）</strong>：有多少请求达到了应用自己的延迟目标，而不是把原始吞吐当成全部答案。</p>

<!-- ============ 08 ============ -->
<h2><span class="num">08</span> 我想要的那个心智模型</h2>
<p>这一模块开始的时候，我把请求想成：进 GPU，被处理，返回答案。那条线太直了。</p>
<p>现在我把服务引擎看成一组反复发生的决定：</p>
<div class="chain">新请求到达 → 路由器选一个副本 → 请求等待，或者变得可以执行 → 调度器选择 token 上的工作 → 缓存管理分配或回收显存 → GPU worker 执行 → 结果流回去 → 系统再调度一次</div>
<p>每一项优化，都会在别处有一笔成本：</p>
<ul>
<li>优先缓存命中的请求，其他用户可能等得更久。</li>
<li>同时接进更多请求，KV 压力可能引发反复抢占。</li>
<li>把并发降下来，流式输出可能更顺，排队会更差。</li>
<li>把一个模型拆到多块 GPU 上，通信可能把好处抵消。</li>
<li>在多块 GPU 上复制模型，路由决定它们各自的缓存被用得有多好。</li>
</ul>
<blockquote><p>负载 → 瓶颈 → 工程上的取舍 → 客户价值。</p></blockquote>
<p>我想能讲清楚的是这条链，不只是那一串名词。如果一家做编程助手的创业公司说，用户等得太久，或者生成总是卡住，我现在知道要问：<em>等的是哪一种</em>，<em>真正紧的是哪一种资源</em>，以及<em>如果我们去优化它，什么会变差</em>。</p>
<p>这就带到下一个问题：把服务系统看懂之后，一个真实的推理引擎是怎么把这些机制高效地做出来的？</p>

<h2><span class="num">—</span> 参考</h2>
<ol class="refs">
<li><a href="https://www.usenix.org/conference/osdi22/presentation/yu" target="_blank" rel="noopener">Yu 等人，Orca：面向 Transformer 生成模型的分布式服务系统（OSDI 2022）</a>：迭代级的调度和 batching。</li>
<li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener">Kwon 等人，用 PagedAttention 为大规模语言模型服务做高效显存管理（2023）</a>：按块管理 KV 显存。</li>
<li><a href="https://arxiv.org/abs/2401.09670" target="_blank" rel="noopener">Zhong 等人，DistServe：为了优化有效吞吐，把大语言模型服务里的 prefill 和 decode 拆开（2024）</a>：prefill / decode 的互相干扰，以及服务目标。</li>
<li><a href="https://docs.vllm.ai/en/latest/design/prefix_caching.html" target="_blank" rel="noopener">vLLM 文档：自动前缀缓存</a>：可复用的 KV 前缀和缓存管理的一个公开例子。</li>
</ol>
<p class="note">范围和局限：这些笔记综合的是公开研究和文档里的一般服务概念。具体实现在调度、缓存驱逐、路由、batching 和抢占的细节上并不相同。所有的图和看起来像 benchmark 的数值都是示意，不是测量，也不是生产环境里的说法。前缀复用要求请求彼此兼容，而且缓存还在；命中率或 GPU 利用率变高，并不保证延迟变好。</p>
<div class="next">下一篇 · 04：推理引擎内部：感知前缀的服务到底是怎么做出来的。</div>
<nav class="next" aria-label="相关的 AI 基础设施文章"><a href="/posts/ai-infra-product-lens">AI 基础设施，什么时候值得用？</a><br><a href="/posts/ai-infra-from-zero-02">为什么 GPU 还是瓶颈？</a></nav>
</div>
</div>
