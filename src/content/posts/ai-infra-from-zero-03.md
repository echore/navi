---
title: "How Does an LLM Serve Thousands of Requests?"
lang: en
tags: ["AI"]
date: 2026-11-14
readTime: 12
slug: ai-infra-from-zero-03
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">

<div class="infra-note infra-note--serving">


<div class="series">AI Infra Learning Notes · 03 / 06</div>

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
