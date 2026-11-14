---
title: "Why Is the GPU Still a Bottleneck?"
lang: en
tags: ["AI"]
date: 2026-11-14
readTime: 12
slug: ai-infra-from-zero-02
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">

<div class="infra-note infra-note--gpu">

<div class="series">AI Infra Learning Notes · 02 / 06</div>

<div class="meta">Memory capacity, bandwidth, batching, and the cost of serving many users</div>
<p class="note">This is the second note in my AI infrastructure learning series, following <a href="https://echore.github.io/ai-projects/posts/ai-infra-from-zero-01-en.html">What Happens After a Prompt Enters an LLM?</a> It is for readers who know the basics of large language models (LLMs) and want to understand the engineering limits. Numerical examples are teaching assumptions unless a source is given.</p>
<h2><span class="num">00</span> Picking Up the Previous Question</h2>
<p>In Note 01, I learned why models need a key-value cache, or KV cache. It stores attention states so the model can reuse them while generating tokens. Requests with matching prefixes can also reuse compatible cached states.</p>
<p>But this creates a trade-off: <strong>saving computation takes memory, and GPU memory is finite.</strong></p>
<p>Suppose I build an AI coding agent with an open-source 8B model. The model fits on the GPU. Why might the service still struggle when more users arrive?</p>
<blockquote><p>Fitting the model into memory is only the first part of serving users.</p></blockquote>
<p>I need to separate four questions. How much data can the GPU store? How fast can it move data? How much computation can it do? How does the service schedule competing requests?</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-01.svg" alt="Figure 1 · Model weights, KV cache, and runtime buffers all use GPU memory." loading="lazy" decoding="async" width="840" height="394"></div><figcaption>Figure 1 · Model weights, KV cache, and runtime buffers all use GPU memory.</figcaption></figure>
<h2><span class="num">01</span> What Uses GPU Memory?</h2>
<p>Start with <strong>model weights</strong>, the learned parameters. An 8B model has about eight billion parameters. BF16, a 16-bit number format, uses 2 bytes per parameter. The weights alone take about 16 billion bytes, or <strong>14.9 GiB</strong>.</p>
<p>The GPU also needs KV cache for active requests. It must leave room for activations, the intermediate values computed by the model, along with temporary buffers and other runtime data.</p>
<div class="formula">GPU Memory ≈ Weights + KV Cache + Runtime Overhead</div>
<p>Suppose the service has 80 GiB of usable memory. Weights take 15 GiB and runtime data takes 8 GiB. Thirty independent requests each need about 1 GiB of KV cache. Total use is <strong>15 + 8 + 30 = 53 GiB</strong>, leaving 27 GiB. Subtracting the weights alone would suggest 65 GiB free and miss most of the request memory.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-02.svg" alt="Figure 2 · An illustrative 80 GiB memory budget, not a measurement from a particular GPU." loading="lazy" decoding="async" width="840" height="380"></div><figcaption>Figure 2 · An illustrative 80 GiB memory budget, not a measurement from a particular GPU.</figcaption></figure>
<h3>Why would one request need 1 GiB of KV cache?</h3>
<p>That amount depends on the model. Suppose it has 32 transformer layers, 8 KV heads per layer, and 128 dimensions per head. With BF16 cache values, KV memory per token is approximately:</p>
<div class="formula">2 × 32 × 8 × 128 × 2 Bytes = 128 KiB / Token</div>
<p>The first 2 counts the key and value states. The last 2 is the number of bytes per BF16 value. An 8,192-token context therefore needs about <strong>1 GiB of KV cache</strong>.</p>
<p>These dimensions match common Llama 8B configurations. Other models, number formats, and attention designs can have very different memory needs.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-03.svg" alt="Figure 3 · With a fixed model and precision, independent requests need more KV memory as their number or context length grows." loading="lazy" decoding="async" width="840" height="402"></div><figcaption>Figure 3 · With a fixed model and precision, independent requests need more KV memory as their number or context length grows.</figcaption></figure>
<p>The distinction I had missed was simple: <strong>requests on one model instance share weights, but independent contexts need additional KV cache.</strong> Matching prefixes may share some cached states. I cannot assume that every user sends the same context.</p>
<h3>Could we just shorten the context?</h3>
<p>That was my first idea. A coding agent could drop older messages or send fewer repository files. This saves memory, but it might remove information the model needs to understand dependencies between files.</p>
<p>Another option is to keep the context and use prefix caching. This helps when many requests share the same beginning. If users work in different repositories, they may share little project context. A single user may reuse context across turns, but the cache still has a capacity limit.</p>
<p>A service can combine context selection, prefix reuse, and cache eviction, which discards cached states to free space. I would judge that combination by model usefulness and user experience within the memory budget. Cache hit rate alone is too narrow a goal.</p>
<h2><span class="num">02</span> Capacity, Bandwidth, and Compute</h2>
<p>When I started learning about GPUs, memory capacity, memory bandwidth, and compute throughput sounded similar. They describe different limits.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-04.svg" alt="Figure 4 · Capacity limits how much fits. Bandwidth limits data movement. Compute limits mathematical work." loading="lazy" decoding="async" width="840" height="397"></div><figcaption>Figure 4 · Capacity limits how much fits. Bandwidth limits data movement. Compute limits mathematical work.</figcaption></figure>
<div class="table-wrap"><table><tbody><tr><th>Resource</th><th>Question</th><th>Common Unit</th></tr><tr><td>Memory capacity</td><td>Can the model and request states fit at the same time?</td><td>GiB</td></tr><tr><td>Memory bandwidth</td><td>How fast can data move to and from GPU memory?</td><td>GB/s, TB/s</td></tr><tr><td>Compute throughput</td><td>How many mathematical operations can the hardware do per second?</td><td>FLOP/s</td></tr></tbody></table></div>
<p>A GPU can slow down while waiting for data even if it has free memory. Adding more compute units does little for a workload that is already waiting on memory bandwidth.</p>
<p>Suppose one decode step with a small batch reads about 16 GB of weights from memory. At an effective bandwidth of 1 TB/s, moving those bytes alone takes at least about <strong>16 ms</strong> under idealized conditions.</p>
<p>This is not a prediction of end-to-end generation time. It leaves out caching, computation, KV access, and other costs. The calculation shows how data movement can set a lower bound on execution time.</p>
<h3>Why do prefill and decode have different bottlenecks?</h3>
<p><strong>Prefill</strong> processes the input tokens. Their positions are already known, so the model can compute many positions together and reuse weights across them. With a large input, compute speed often limits this stage.</p>
<p><strong>Decode</strong> generates the output. A standard autoregressive model usually generates one new token per request at each step. With a small batch, that step reads a lot of model data for relatively little computation. Memory bandwidth often becomes the limit.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-05.svg" alt="Figure 5 · Prefill and small-batch decode reuse model weights differently." loading="lazy" decoding="async" width="840" height="374"></div><figcaption>Figure 5 · Prefill and small-batch decode reuse model weights differently.</figcaption></figure>
<p><strong>Arithmetic intensity</strong> measures how many mathematical operations happen per byte moved.</p>
<div class="formula">Arithmetic Intensity = FLOPs ÷ Bytes Transferred</div>
<p>Higher arithmetic intensity gives compute units more work for each byte read. With low intensity, the GPU may spend more time waiting for data.</p>
<p>These are common patterns, not fixed rules. The model, batch size, context length, GPU computation routines called kernels, and hardware all affect the bottleneck.</p>
<h2><span class="num">03</span> Why can a larger batch slow down each user?</h2>
<p>I kept returning to this question. Batching improves GPU efficiency, so I initially expected every user to get an answer faster. But total work and individual waiting time measure different things.</p>
<p>For a linear layer, computing one token can be written as <code>y = xW</code>. Stacking token representations from different requests into a matrix X gives <code>Y = XW</code>. The weights W now serve more computation together.</p>
<p>This can raise total <strong>throughput</strong>, the amount of work the service completes per second. A larger batched step still does more work than a small one, so it may take longer even while producing more tokens.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-06.svg" alt="Figure 6 · An illustrative example: total throughput rises while each user receives tokens more slowly." loading="lazy" decoding="async" width="840" height="456"></div><figcaption>Figure 6 · An illustrative example: total throughput rises while each user receives tokens more slowly.</figcaption></figure>
<div class="table-wrap"><table><tbody><tr><th>Metric</th><th class="r">Batch 1</th><th class="r">Batch 8</th></tr><tr><td>One decode step</td><td class="r">20 ms</td><td class="r">55 ms</td></tr><tr><td>Total tokens per step</td><td class="r">1 token</td><td class="r">8 tokens</td></tr><tr><td>Total throughput</td><td class="r">50 tokens/s</td><td class="r">≈145 tokens/s</td></tr><tr><td>Output rate per user</td><td class="r">50 tokens/s</td><td class="r">≈18 tokens/s</td></tr></tbody></table></div>
<p>In the eight-user batch, each user receives <strong>one token in 55 ms</strong>. Each does not receive eight tokens. The service produces more tokens overall, but the gap between each user's tokens grows from 20 ms to 55 ms.</p>
<p>This is a latency-throughput trade-off. It does not mean every increase in batch size makes users slower. If the GPU has spare resources, a larger batch may barely increase step time. The result depends on when compute, bandwidth, memory, or scheduling becomes the limit.</p>
<h3>Three Metrics to Keep Separate</h3>
<div class="table-wrap"><table><tbody><tr><th>Metric</th><th>What It Measures</th></tr><tr><td>TTFT</td><td>Time to first token: how long the user waits for the first output token, including queueing and other stages.</td></tr><tr><td>ITL / TPOT</td><td>Inter-token latency / time per output token: gaps between output tokens or average time per output token. Benchmark definitions differ.</td></tr><tr><td>Throughput</td><td>The whole service's work per second, such as output tokens/s.</td></tr></tbody></table></div>
<p>These metrics answer different business questions. A high-volume model API may prioritize throughput and cost per token. An interactive coding assistant may prioritize TTFT and smooth streaming.</p>
<p>If throughput rises by 40% while user latency stays about the same, some customers benefit. Calling that result “40% faster answers” would misrepresent what changed.</p>
<h2><span class="num">04</span> Requests Start and Finish at Different Times</h2>
<p>Real traffic adds another complication. User A needs 2,000 output tokens, B needs 100, and C needs 500. D arrives later.</p>
<p>If a fixed batch must finish together, resources may sit idle after short requests finish. D may wait for A, the longest request. <strong>Continuous batching</strong> lets the scheduler remove finished requests and admit new ones between generation steps.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-07.svg" alt="Figure 7 · After B finishes, D joins later decode steps while A and C keep running." loading="lazy" decoding="async" width="840" height="425"></div><figcaption>Figure 7 · After B finishes, D joins later decode steps while A and C keep running.</figcaption></figure>
<p>The scheduler has to track more than arrival order. Every active request uses KV memory. Some requests are in prefill; others are decoding. Admitting, pausing, and removing requests changes the available resources.</p>
<p>Continuous batching gives the GPU more chances to do useful work. Capacity and bandwidth still limit it. When demand is high enough, the scheduler must choose which work runs first.</p>
<h2><span class="num">05</span> Why can a long prefill interrupt decode?</h2>
<p>Return to the coding agent. At 9 a.m., many developers send prompts containing large repositories. Other users already have answers streaming back.</p>
<p>If prefill and decode share the same GPU workers, a long prefill can occupy execution resources and pause those answers. A delay that looks like a network problem may come from <strong>GPU scheduling</strong>.</p>
<h3>Option A: Chunked Prefill</h3>
<p>Chunked prefill splits a large prompt into smaller pieces. The scheduler can run decode between chunks. Some implementations also mix prefill and decode work in one iteration.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-08.svg" alt="Figure 8 · Splitting a long prefill into chunks gives existing decode requests more chances to run." loading="lazy" decoding="async" width="840" height="389"></div><figcaption>Figure 8 · Splitting a long prefill into chunks gives existing decode requests more chances to run.</figcaption></figure>
<p>This can shorten pauses between output tokens. Processing a new prompt may take longer, raising TTFT. Results depend on chunk size, scheduling policy, and workload. This approach usually needs fewer architectural changes than separating GPU worker pools.</p>
<h3>Option B: Prefill-Decode Disaggregation</h3>
<p>Prefill-decode disaggregation runs the two stages on <strong>different GPU workers or resource pools</strong>. Prefill workers process the input context. Decode workers generate output tokens. After prefill, the service transfers the KV cache needed for generation to the decode workers.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-09.svg" alt="Figure 9 · Separate GPU workers handle prefill and decode, with added KV transfer and coordination costs." loading="lazy" decoding="async" width="840" height="406"></div><figcaption>Figure 9 · Separate GPU workers handle prefill and decode, with added KV transfer and coordination costs.</figcaption></figure>
<p>Separating the workers can reduce direct interference between long prefills and ongoing decode. But <strong>KV transfer takes time and network bandwidth</strong>. Long prompts can create large caches. The service also needs more routing, resource allocation, and operational work.</p>
<p>Separate pools can also cost more. At light load, a shared worker may be simpler and avoid transfers between workers. Dedicated pools may offer more value under sustained, heavy traffic that mixes prefill and decode.</p>
<h2><span class="num">06</span> How would I choose as a product manager?</h2>
<p>I first noticed two costs: chunking may delay the completion of a new prefill, while separate pools add KV transfers and deployment complexity. That is a start, but it is too little for a product decision.</p>
<p>I would first ask: <strong>what are users waiting for?</strong> Is the first token late? Does output pause midway? Are requests stuck in a queue? Then I would inspect traffic during the problem, rather than rely on averages for the whole day.</p>
<div class="steps"><div class="step"><div class="n">1</div><h4>Inspect the Workload</h4><p>Input and output lengths, morning traffic peaks, concurrent requests, cache hits, and queue length.</p></div><div class="step"><div class="n">2</div><h4>Find the Bottleneck</h4><p>Compute, high-bandwidth memory (HBM) bandwidth, KV memory, network transfer, or scheduling interference.</p></div><div class="step"><div class="n">3</div><h4>Compare Trade-offs</h4><p>p95/p99 TTFT and ITL, completed requests, GPU cost, reliability, and complexity.</p></div><div class="step"><div class="n">4</div><h4>Test the User Goal</h4><p>Replay representative requests and compare the options at similar cost.</p></div></div>
<p>I would compare the current system, chunked prefill, separate pools, and a combination if needed. With one GPU pool and brief daily peaks, chunking may be the practical first test. If large prefills constantly interrupt decode, separate pools deserve testing, provided KV transfer is fast enough.</p>
<p>For complaints about output freezing, I would pay particular attention to <strong>p95 and p99 ITL</strong>. The p95 value covers 95% of measured intervals; p99 covers 99%. These percentiles show the slower end of the distribution. A low average can hide pauses that make the product frustrating to use.</p>
<h2><span class="num">07</span> From System Metrics to User Value</h2>
<p>I now ask three questions about an optimization: which workload does it help, which bottleneck does it reduce, and what does it cost?</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-10.svg" alt="Figure 10 · Workload → bottleneck → trade-offs → user value: connect system measurements to the user’s problem." loading="lazy" decoding="async" width="840" height="402"></div><figcaption>Figure 10 · Workload → bottleneck → trade-offs → user value: connect system measurements to the user’s problem.</figcaption></figure>
<p>Suppose an engineer says, “Our change raises throughput by 40%, but latency for each user stays about the same.”</p>
<p>For a high-volume inference API, the same GPUs may now do more work. With enough demand, that could lower infrastructure cost per token.</p>
<p>For an interactive coding assistant whose users complain about pauses, the result <strong>does not show that output feels faster</strong>. It may still help the company serve more users without GPU costs growing at the same rate. That is a separate benefit to measure.</p>
<p>An optimization can be technically effective and still leave a particular customer's main problem unsolved.</p>
<blockquote><p>Understand the workload, find the bottleneck, compare the costs, and measure the result users care about.</p></blockquote>
<h2><span class="num">08</span> Connecting the Ideas</h2>
<div class="chain"><b>The model fits on the GPU</b> → active requests also need KV cache and temporary memory → long contexts and concurrency increase memory use → bandwidth and compute limit execution speed → prefill and decode need different resources → batching affects both total throughput and individual latency → scheduling and worker placement determine how those trade-offs play out.</div>
<p>I now ask five questions about GPU performance. Does the state fit? How must data move? Which computations dominate? How do requests interfere? Which result matters to the user?</p>
<p>The same coding agent may need different architectures as traffic changes. I would keep measuring, comparing, and adjusting as its workload grows.</p>
<p class="note">The diagrams, batch timings, and memory budgets explain mechanisms. They are not official architectures or measured benchmarks. Actual results depend on model design, numerical precision, GPU links, kernels, concurrency, and scheduling policy.</p>
<h2>Further Reading and References</h2>
<ol class="refs"><li><a href="https://huggingface.co/blog/tngtech/llm-performance-prefill-decode-concurrent-requests" target="_blank" rel="noopener">TNG Technology: Prefill and Decode for Concurrent Requests</a>: The compute and bandwidth patterns of prefill and decode.</li><li><a href="https://nvidia.github.io/TensorRT-LLM/features/disagg-serving.html" target="_blank" rel="noopener">NVIDIA TensorRT-LLM: Disaggregated Serving</a>: Why separate prefill and decode.</li><li><a href="https://docs.nvidia.com/dynamo/dev/knowledge-base/concepts/system-architecture/disaggregated-serving" target="_blank" rel="noopener">NVIDIA Dynamo: Disaggregated Serving</a>: KV transfer and resource allocation trade-offs.</li><li><a href="https://docs.vllm.ai/en/latest/design/arch_overview/" target="_blank" rel="noopener">vLLM: Architecture Overview and Scheduler</a>: An example of scheduling in an open-source inference engine.</li><li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener">Kwon et al. (2023): PagedAttention</a>: KV cache memory management.</li><li><a href="https://huggingface.co/unsloth/Llama-3.1-8B/blob/main/config.json" target="_blank" rel="noopener">Llama 3.1 8B Configuration Example</a>: The model dimensions used in the KV cache estimate.</li></ol>
<div class="next"><a href="https://echore.github.io/ai-projects/posts/ai-infra-from-zero-01-en.html">← Previous · 01: What Happens After a Prompt Enters an LLM?</a><br><a href="/posts/ai-infra-from-zero-03">Next · 03: How Does an LLM Serve Thousands of Requests? →</a></div><nav class="next" aria-label="Related AI infrastructure articles"><a href="/posts/ai-infra-product-lens">What Makes AI Infrastructure Worth Using?</a><br><a href="/posts/ai-infra-from-zero-03">How Does an LLM Serve Thousands of Requests?</a></nav>
</div>
