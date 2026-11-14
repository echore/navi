---
title: "Why Is the GPU Still a Bottleneck?"
titleZh: "为什么 GPU 还是瓶颈？"
lang: en
tags: ["AI"]
date: 2026-11-14
readTime: 12
slug: ai-infra-from-zero-02
series: "AI Infra Track Technology"
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">

<div class="lang-en">
<div class="infra-note infra-note--gpu">

<div class="series">AI Infra Learning Notes · 02 / 06</div>

<div class="meta">Memory capacity, bandwidth, batching, and the cost of serving many users</div>
<p class="note">This is the second note in my AI infrastructure learning series, following <a href="/posts/ai-infra-from-zero-01">What Happens After a Prompt Enters an LLM?</a> It is for readers who know the basics of large language models (LLMs) and want to understand the engineering limits. Numerical examples are teaching assumptions unless a source is given.</p>
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
<div class="next"><a href="/posts/ai-infra-from-zero-01">← Previous · 01: What Happens After a Prompt Enters an LLM?</a><br><a href="/posts/ai-infra-from-zero-03">Next · 03: How Does an LLM Serve Thousands of Requests? →</a></div><nav class="next" aria-label="Related AI infrastructure articles"><a href="/posts/ai-infra-product-lens">What Makes AI Infrastructure Worth Using?</a><br><a href="/posts/ai-infra-from-zero-03">How Does an LLM Serve Thousands of Requests?</a></nav>
</div>
</div>

<div class="lang-zh">
<div class="infra-note infra-note--gpu">

<div class="series">AI Infra 学习笔记 · 02 / 06</div>

<div class="meta">显存容量、带宽、batching，以及同时服务很多用户要付出的代价</div>
<p class="note">这是我 AI 基础设施学习系列的第二篇，接在 <a href="/posts/ai-infra-from-zero-01">提示词进了 LLM 之后发生了什么？</a> 后面。写给已经知道大语言模型（LLM）基础、想看懂工程上限的人。数字如果没有给出处，就是为了讲清楚而设的假设。</p>
<h2><span class="num">00</span> 接着上一个问题</h2>
<p>在笔记 01 里，我搞懂了模型为什么需要键值缓存，也就是 KV cache。它存着 attention 的状态，生成 token 时可以复用。前缀相同的请求，也可以复用彼此兼容的缓存。</p>
<p>但这里有个取舍：<strong>省下计算，要用掉显存，而 GPU 显存是有限的。</strong></p>
<p>假设我用一个开源的 8B 模型做 AI 编程助手。模型放得进 GPU。用户一多，服务为什么还是会吃力？</p>
<blockquote><p>模型放进显存，只是服务用户的第一步。</p></blockquote>
<p>我得把四个问题分开。GPU 能存多少数据？数据搬得有多快？计算做得了多少？服务怎么安排互相抢资源的请求？</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-01.svg" alt="图 1 · 模型权重、KV cache 和运行时缓冲都占 GPU 显存。" loading="lazy" decoding="async" width="840" height="394"></div><figcaption>图 1 · 模型权重、KV cache 和运行时缓冲都占 GPU 显存。</figcaption></figure>
<h2><span class="num">01</span> GPU 显存被什么占着？</h2>
<p>先看<strong>模型权重</strong>，也就是学出来的参数。一个 8B 模型大约有八十亿个参数。BF16 是一种 16 位的数字格式，每个参数 2 字节。光是权重就要大约 160 亿字节，也就是 <strong>14.9 GiB</strong>。</p>
<p>GPU 还要给正在处理的请求留 KV cache。激活值（模型算到一半的中间结果）、临时缓冲和其他运行时数据，也得留地方。</p>
<div class="formula">GPU 显存 ≈ 权重 + KV Cache + 运行时开销</div>
<p>假设服务有 80 GiB 可用显存。权重占 15 GiB，运行时数据占 8 GiB。30 个互不相干的请求，每个大约要 1 GiB 的 KV cache。一共是 <strong>15 + 8 + 30 = 53 GiB</strong>，还剩 27 GiB。如果只减掉权重，会以为还空着 65 GiB，请求真正占的显存大部分就被漏掉了。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-02.svg" alt="图 2 · 一份用来说明的 80 GiB 显存预算，不是某块 GPU 的实测。" loading="lazy" decoding="async" width="840" height="380"></div><figcaption>图 2 · 一份用来说明的 80 GiB 显存预算，不是某块 GPU 的实测。</figcaption></figure>
<h3>一个请求为什么会要 1 GiB 的 KV cache？</h3>
<p>这个数取决于模型。假设它有 32 层 transformer，每层 8 个 KV head，每个 head 128 维。缓存值用 BF16 时，每个 token 的 KV 显存大约是：</p>
<div class="formula">2 × 32 × 8 × 128 × 2 字节 = 128 KiB / token</div>
<p>第一个 2 是 key 和 value 两份状态。最后一个 2 是每个 BF16 数值占的字节。所以 8,192 个 token 的上下文，大约需要 <strong>1 GiB 的 KV cache</strong>。</p>
<p>这些尺寸和常见的 Llama 8B 配置对得上。别的模型、数字格式和 attention 设计，显存可以差很多。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-03.svg" alt="图 3 · 模型和精度固定时，请求变多，或者上下文变长，各自独立的请求就要更多 KV 显存。" loading="lazy" decoding="async" width="840" height="402"></div><figcaption>图 3 · 模型和精度固定时，请求变多，或者上下文变长，各自独立的请求就要更多 KV 显存。</figcaption></figure>
<p>我之前没分开的一点其实很简单：<strong>同一个模型实例上的请求共用权重，但互不相干的上下文要各自再占一份 KV cache。</strong>前缀相同的可以共用一部分缓存。不能假设每个用户发来的上下文都一样。</p>
<h3>把上下文截短就行了吗？</h3>
<p>这是我的第一个想法。编程助手可以丢掉更早的消息，或者少传一些仓库文件。显存是省了，但模型看文件之间依赖时需要的信息，也可能被丢掉。</p>
<p>另一种做法是保留上下文，用前缀缓存。很多请求开头相同时，这有用。如果用户在不同的仓库里工作，能共用的项目上下文可能很少。同一个用户在多轮对话里可以复用上下文，但缓存本身还有容量上限。</p>
<p>服务可以把三件事合在一起：挑选上下文、复用前缀、以及在空间不够时丢掉缓存状态。我会用显存预算之内的模型是否还有用、用户体验如何来判断这套组合。只看缓存命中率，目标太窄了。</p>
<h2><span class="num">02</span> 容量、带宽和计算</h2>
<p>我刚开始学 GPU 的时候，显存容量、显存带宽和计算吞吐听起来差不多。它们说的是不同的上限。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-04.svg" alt="图 4 · 容量决定装得下多少。带宽决定数据搬得有多快。计算决定数学运算做得了多少。" loading="lazy" decoding="async" width="840" height="397"></div><figcaption>图 4 · 容量决定装得下多少。带宽决定数据搬得有多快。计算决定数学运算做得了多少。</figcaption></figure>
<div class="table-wrap"><table><tbody><tr><th>资源</th><th>问题</th><th>常见单位</th></tr><tr><td>显存容量</td><td>模型和请求状态能不能同时放进去？</td><td>GiB</td></tr><tr><td>显存带宽</td><td>数据在 GPU 显存之间来回搬，能有多快？</td><td>GB/s、TB/s</td></tr><tr><td>计算吞吐</td><td>硬件每秒能做多少次数学运算？</td><td>FLOP/s</td></tr></tbody></table></div>
<p>显存还有空，GPU 也可能因为在等数据而慢下来。负载已经卡在显存带宽上时，再加计算单元用处不大。</p>
<p>假设 batch 很小的时候，一次 decode 要从显存里读大约 16 GB 的权重。有效带宽 1 TB/s 时，光是把这些字节搬完，理想情况下至少大约要 <strong>16 毫秒</strong>。</p>
<p>这不是在预测端到端的生成时间。缓存、计算、读取 KV 和其他开销都没算进去。这个计算只说明：数据搬运可以给执行时间设一条下限。</p>
<h3>为什么 prefill 和 decode 的瓶颈不一样？</h3>
<p><strong>Prefill</strong> 处理输入 token。它们的位置已经知道，所以模型可以一次算很多个位置，并在这些位置之间复用权重。输入很长时，这一段常常卡在计算速度上。</p>
<p><strong>Decode</strong> 生成输出。标准的自回归模型，每个请求每一步通常只新生成一个 token。batch 小时，这一步为了相对很少的计算，要读很多模型数据。上限常常变成显存带宽。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-05.svg" alt="图 5 · Prefill 和小 batch 的 decode，复用模型权重的方式不一样。" loading="lazy" decoding="async" width="840" height="374"></div><figcaption>图 5 · Prefill 和小 batch 的 decode，复用模型权重的方式不一样。</figcaption></figure>
<p><strong>算术强度</strong>衡量每搬一个字节，做了多少次数学运算。</p>
<div class="formula">算术强度 = FLOPs ÷ 搬过的字节数</div>
<p>算术强度高，计算单元每读一个字节就有更多活干。强度低的时候，GPU 可能把更多时间花在等数据上。</p>
<p>这是常见的情况，不是固定规则。模型、batch 大小、上下文长度、GPU 上实际跑的计算例程（kernel），还有硬件，都会影响瓶颈在哪。</p>
<h2><span class="num">03</span> 为什么 batch 变大，每个用户会变慢？</h2>
<p>这个问题我反复回来看。Batching 能让 GPU 更忙，所以我一开始以为每个用户都会更快拿到回答。但系统一共干了多少活，和一个人等了多久，是两件事。</p>
<p>对一个线性层，算一个 token 可以写成 <code>y = xW</code>。把不同请求的 token 表示叠成矩阵 X，就变成 <code>Y = XW</code>。权重 W 这一次服务了更多计算。</p>
<p>这可以提高总<strong>吞吐</strong>，也就是服务每秒完成的工作量。更大的 batch 这一步干的活仍然比小 batch 多，所以即便吐出的 token 更多，这一步也可能更久。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-06.svg" alt="图 6 · 一个示意：总吞吐上去了，每个用户收到 token 的速度却更慢。" loading="lazy" decoding="async" width="840" height="456"></div><figcaption>图 6 · 一个示意：总吞吐上去了，每个用户收到 token 的速度却更慢。</figcaption></figure>
<div class="table-wrap"><table><tbody><tr><th>指标</th><th class="r">Batch 1</th><th class="r">Batch 8</th></tr><tr><td>一次 decode</td><td class="r">20 ms</td><td class="r">55 ms</td></tr><tr><td>每步的 token 总数</td><td class="r">1 个 token</td><td class="r">8 个 token</td></tr><tr><td>总吞吐</td><td class="r">50 token/s</td><td class="r">约 145 token/s</td></tr><tr><td>每个用户的输出速度</td><td class="r">50 token/s</td><td class="r">约 18 token/s</td></tr></tbody></table></div>
<p>八个用户的 batch 里，每个人是 <strong>55 毫秒拿到一个 token</strong>。不是一个人拿到八个 token。服务整体产出的 token 更多了，但同一个用户前后两个 token 的间隔，从 20 毫秒变成了 55 毫秒。</p>
<p>这是延迟和吞吐的取舍。不是说 batch 变大就一定让用户更慢。GPU 还有余量时，batch 大一点，这一步的时间可能几乎不变。结果取决于上限先出现在计算、带宽、显存，还是调度上。</p>
<h3>三个要分开看的指标</h3>
<div class="table-wrap"><table><tbody><tr><th>指标</th><th>它量的是什么</th></tr><tr><td>TTFT</td><td>首 token 时间：用户等到第一个输出 token 的时间，包括排队和其他阶段。</td></tr><tr><td>ITL / TPOT</td><td>token 间隔 / 每个输出 token 的时间：输出 token 之间的空隙，或者每个输出 token 的平均时间。Benchmark 的定义并不统一。</td></tr><tr><td>吞吐</td><td>整个服务每秒干的活，比如每秒输出多少 token。</td></tr></tbody></table></div>
<p>这些指标回答的是不同的业务问题。量大的模型 API 可能优先看吞吐和每个 token 的成本。交互式的编程助手可能优先看 TTFT，以及流式输出顺不顺。</p>
<p>如果吞吐提高了 40%，用户延迟差不多没变，有些客户会受益。把这个结果说成“回答快了 40%”，说的就不是实际变了的那件事。</p>
<h2><span class="num">04</span> 请求开始和结束的时间不一样</h2>
<p>真实流量还更麻烦。用户 A 要 2,000 个输出 token，B 要 100 个，C 要 500 个。D 晚一点才来。</p>
<p>如果一个固定的 batch 必须一起结束，短请求结束后，资源可能空着。D 可能得等最长的那个请求 A。 <strong>连续 batching</strong> 让调度器在生成的步骤之间拿走已经结束的请求，再放进新的。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-07.svg" alt="图 7 · B 结束后，D 在后面的 decode 步骤里加入，A 和 C 继续跑。" loading="lazy" decoding="async" width="840" height="425"></div><figcaption>图 7 · B 结束后，D 在后面的 decode 步骤里加入，A 和 C 继续跑。</figcaption></figure>
<p>调度器要盯的不只是谁先到。每个还在跑的请求都占 KV 显存。有的请求在 prefill，有的在 decode。放进、暂停、拿走请求，都会改变还剩多少资源。</p>
<p>连续 batching 让 GPU 有更多机会去干有用的活。容量和带宽仍然限制着它。需求够高时，调度器必须选择先跑哪一份工作。</p>
<h2><span class="num">05</span> 为什么很长的 prefill 会打断 decode？</h2>
<p>回到编程助手。早上 9 点，很多开发者发来带着大仓库的提示词。另一些用户的回答已经在往外流。</p>
<p>如果 prefill 和 decode 共用同一批 GPU worker，一段很长的 prefill 会占住执行资源，把那些正在输出的回答按住。看起来像网络问题的卡顿，可能来自 <strong>GPU 调度</strong>。</p>
<h3>做法 A：分块 prefill</h3>
<p>分块 prefill 把很长的提示词切成小块。调度器可以在块和块之间跑 decode。有的实现还会在同一次迭代里把 prefill 和 decode 混在一起。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-08.svg" alt="图 8 · 把很长的 prefill 切成小块，已经在 decode 的请求就有更多机会接着跑。" loading="lazy" decoding="async" width="840" height="389"></div><figcaption>图 8 · 把很长的 prefill 切成小块，已经在 decode 的请求就有更多机会接着跑。</figcaption></figure>
<p>输出 token 之间的停顿可以变短。新提示词处理完可能更久，TTFT 会上去。结果取决于块有多大、调度策略是什么、负载是什么。和把 GPU worker 拆成不同的池相比，这种做法通常要改的架构更少。</p>
<h3>做法 B：Prefill 和 decode 拆开</h3>
<p>Prefill-decode 分离是把两个阶段放在<strong>不同的 GPU worker 或资源池</strong>上。Prefill 的 worker 处理输入上下文。Decode 的 worker 生成输出 token。Prefill 结束后，服务把生成所需要的 KV cache 传给 decode 的 worker。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-09.svg" alt="图 9 · 不同的 GPU worker 分别处理 prefill 和 decode，同时多了 KV 传输和协调的成本。" loading="lazy" decoding="async" width="840" height="406"></div><figcaption>图 9 · 不同的 GPU worker 分别处理 prefill 和 decode，同时多了 KV 传输和协调的成本。</figcaption></figure>
<p>把 worker 分开，可以减少长 prefill 和正在进行的 decode 直接互相打扰。但 <strong>传 KV 要时间和网络带宽</strong>。长提示词会造出很大的缓存。服务还得做更多路由、资源分配和运维。</p>
<p>分开的池也可能更贵。负载轻的时候，共用一个 worker 可能更简单，也省掉 worker 之间的传输。持续、很重、而且 prefill 和 decode 混在一起的流量下，专用的池可能更值。</p>
<h2><span class="num">06</span> 如果我是产品经理，会怎么选？</h2>
<p>我先看见两笔成本：切块可能让一次新的 prefill 更晚做完；分开的池则多了 KV 传输和部署上的复杂度。这是个开头，但拿来做产品决定还太少。</p>
<p>我会先问：<strong>用户在等什么？</strong>是第一个 token 来得晚？是输出到一半停住？还是请求卡在队列里？然后我会去看出问题那段时间的流量，而不是拿一整天的平均数来判断。</p>
<div class="steps"><div class="step"><div class="n">1</div><h4>看负载</h4><p>输入和输出有多长、早高峰、同时有多少请求、缓存命中、队列有多长。</p></div><div class="step"><div class="n">2</div><h4>找瓶颈</h4><p>计算、高带宽显存（HBM）的带宽、KV 显存、网络传输，还是调度上的互相干扰。</p></div><div class="step"><div class="n">3</div><h4>比取舍</h4><p>p95 / p99 的 TTFT 和 ITL、完成了多少请求、GPU 成本、稳定性，以及复杂度。</p></div><div class="step"><div class="n">4</div><h4>按用户的目标来测</h4><p>重放有代表性的请求，在差不多的成本下比较这几个选项。</p></div></div>
<p>我会比现在的系统、分块 prefill、分开的池，必要的话再加上组合。如果只有一个 GPU 池，而且每天的高峰很短，切块可能是第一个值得试的。如果大的 prefill 一直在打断 decode，分开的池值得测，前提是 KV 传得够快。</p>
<p>如果抱怨的是输出卡住，我会特别看 <strong>p95 和 p99 的 ITL</strong>。p95 覆盖 95% 的测量间隔，p99 覆盖 99%。这两个分位数看的是分布里慢的那一头。平均数很低，也可以藏住让产品用起来很烦的停顿。</p>
<h2><span class="num">07</span> 从系统指标到用户在乎的事</h2>
<p>现在看一项优化，我会问三个问题：它帮的是哪种负载，它减轻的是哪个瓶颈，它要付出什么。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/ai-infra-from-zero-02/figure-10.svg" alt="图 10 · 负载 → 瓶颈 → 取舍 → 用户价值：把系统测量接到用户的问题上。" loading="lazy" decoding="async" width="840" height="402"></div><figcaption>图 10 · 负载 → 瓶颈 → 取舍 → 用户价值：把系统测量接到用户的问题上。</figcaption></figure>
<p>假设一个工程师说：“我们的改动把吞吐提高了 40%，但每个用户的延迟差不多没变。”</p>
<p>对一个量大的推理 API，同样的 GPU 现在可能干更多活。需求够的话，每个 token 的基础设施成本可以降下来。</p>
<p>对一个交互式的编程助手，用户抱怨的是停顿，这个结果<strong>并不能说明输出感觉更快了</strong>。它仍然可能帮公司在 GPU 成本没有同比上涨的情况下服务更多用户。那是另一笔要单独去量的好处。</p>
<p>一项优化可以在技术上有效，同时仍然没有解决某个客户最主要的问题。</p>
<blockquote><p>看清负载，找到瓶颈，把成本比一比，再去量用户在乎的那个结果。</p></blockquote>
<h2><span class="num">08</span> 把这些想法串起来</h2>
<div class="chain"><b>模型放得进 GPU</b> → 正在处理的请求还要 KV cache 和临时显存 → 长上下文和并发会把显存用上去 → 带宽和计算限制执行速度 → prefill 和 decode 要的资源不一样 → batching 同时影响总吞吐和单个人的延迟 → 调度和 worker 怎么放，决定这些取舍最后怎么落到人身上。</div>
<p>现在看 GPU 性能，我会问五个问题。状态放得下吗？数据必须怎么搬？哪些计算占大头？请求之间怎么互相影响？哪个结果是用户在乎的？</p>
<p>同一个编程助手，流量变了，需要的架构也可能变。负载长大的时候，我会继续测、继续比、继续调。</p>
<p class="note">图、batch 的时间和显存预算是用来解释机制的。它们不是官方架构，也不是测出来的 benchmark。实际结果取决于模型设计、数值精度、GPU 之间的连接、kernel、并发和调度策略。</p>
<h2>延伸阅读和参考</h2>
<ol class="refs"><li><a href="https://huggingface.co/blog/tngtech/llm-performance-prefill-decode-concurrent-requests" target="_blank" rel="noopener">TNG Technology：并发请求下的 Prefill 和 Decode</a>：prefill 和 decode 在计算和带宽上的不同表现。</li><li><a href="https://nvidia.github.io/TensorRT-LLM/features/disagg-serving.html" target="_blank" rel="noopener">NVIDIA TensorRT-LLM：分离式服务</a>：为什么把 prefill 和 decode 分开。</li><li><a href="https://docs.nvidia.com/dynamo/dev/knowledge-base/concepts/system-architecture/disaggregated-serving" target="_blank" rel="noopener">NVIDIA Dynamo：分离式服务</a>：KV 传输和资源分配上的取舍。</li><li><a href="https://docs.vllm.ai/en/latest/design/arch_overview/" target="_blank" rel="noopener">vLLM：架构概览和调度器</a>：开源推理引擎里调度长什么样的一个例子。</li><li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener">Kwon 等人（2023）：PagedAttention</a>：KV cache 的显存管理。</li><li><a href="https://huggingface.co/unsloth/Llama-3.1-8B/blob/main/config.json" target="_blank" rel="noopener">Llama 3.1 8B 配置示例</a>：估算 KV cache 时用到的模型尺寸。</li></ol>
<div class="next"><a href="/posts/ai-infra-from-zero-01">← 上一篇 · 01：提示词进了 LLM 之后发生了什么？</a><br><a href="/posts/ai-infra-from-zero-03">下一篇 · 03：LLM 怎么同时服务几千个请求？ →</a></div><nav class="next" aria-label="相关的 AI 基础设施文章"><a href="/posts/ai-infra-product-lens">AI 基础设施，什么时候值得用？</a><br><a href="/posts/ai-infra-from-zero-03">LLM 怎么同时服务几千个请求？</a></nav>
</div>
</div>
