---
title: "What Happens After a Prompt Enters an LLM?"
titleZh: "提示词进了 LLM 之后，发生了什么？"
lang: en
tags: ["AI"]
date: 2026-11-13
readTime: 12
slug: ai-infra-from-zero-01
series: "AI Infra Track Technology"
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">

<div class="lang-en">
<div class="infra-note infra-note--gpu">
<div class="series">AI Infra Learning Notes · 01 / 05</div>
<div class="meta">From prefill and decode to the KV cache, and prefix reuse across requests</div>

  <p class="note">This is the first note in my series on learning AI infra from zero. I'm writing for readers like me: you've used AI and know roughly how it works, but you aren't an infra specialist. The token counts and examples below are teaching assumptions I chose to make the mechanisms clear, and the diagrams don't show any engine's full official implementation.</p>

  <!-- ============ 00 ============ -->
  <h2><span class="num">00</span>How I Started Learning AI Infra</h2>

  <p>I knew nothing about AI infra. I didn't even know where to start. But the company I was interviewing with builds AI infra, so I had to figure out what the field actually does.</p>
  <p>My first move was to ask AI to explain it.</p>
  <p>On the first try, I asked for the basics. The answer was too shallow, and several parts didn't match AI infra at all. On the second try, I asked it to focus on the company's core technology. It started describing the company instead. My reaction: no, no, no, hold on. This is wrong.</p>
  <p>That's when I noticed the most important lesson of the whole process:</p>

  <blockquote><p>When AI gives you something that feels wrong, don't ask it to try again and again. It hasn't understood what you want, so more attempts won't get you there. Stop, and work out with it what you actually need.</p></blockquote>

  <p>So I changed the question: "I don't understand this field yet. Can we build a knowledge tree first? Give me the structure, break it into steps, and then I'll work down the tree one level at a time."</p>
  <p>This time, the learning plan it gave me was right.</p>
  <p>One more habit made a big difference. After each concept, I had AI ask me a question, and I answered it. That way it could test whether I'd actually understood the idea. This is the Feynman technique: if you can explain something in your own words, you understand it. I wrote about how I use AI for this in <a href="https://echore.github.io/ai-projects/posts/learn-anything-with-ai.html">How to Learn Anything (the AI Edition)</a>.</p>

  <div class="steps">
    <div class="step"><div class="n">1</div><h4>Stop, Don't Retry</h4><p>Retrying only gives you new versions of the same misunderstanding. First agree with AI on what you actually want.</p></div>
    <div class="step"><div class="n">2</div><h4>Get the Structure First</h4><p>Ask AI to map the field as a knowledge tree with clear levels, then pick where to start.</p></div>
    <div class="step"><div class="n">3</div><h4>One Question per Node</h4><p>After each module, you should be able to explain one real question, not just recite definitions.</p></div>
    <div class="step"><div class="n">4</div><h4>Quiz Me after Each Concept</h4><p>After each concept, AI asks one question and I answer in my own words. If I can't, I haven't understood it yet.</p></div>
  </div>

  <figure class="fig wide">
    <img src="/assets/posts/ai-infra-from-zero-01/00_knowledge_tree.svg" alt="AI infra knowledge tree with six modules">
    <figcaption>My AI infra knowledge tree: four levels, six modules. Each module comes with one question I must be able to answer.</figcaption>
  </figure>

  <p>The order of the four levels matters. First I need to understand <strong>one computation</strong> on its own: how the model computes and where the hardware gets stuck. Next comes <strong>serving many users</strong>, then <strong>improving the model</strong> over time, and last, how all of this <strong>becomes a business</strong>. This post covers module 01: what computation happens when a prompt enters an LLM, and which repeated work we can avoid?</p>
  <p>To keep the ideas concrete, I use one example throughout: <strong>a startup that builds an AI coding agent on an open-source model such as Qwen</strong>. For each idea, I ask the same four questions in order. Why does this problem come up? How does the computation actually work? So what does it change? And how does it apply in a real product?</p>

  <!-- ============ 01 ============ -->
  <h2><span class="num">01</span>Training, Inference, and the Life of a Request</h2>

  <p><strong>Training</strong> adjusts the model's weights so the model learns to do a task. Ordinary <strong>inference</strong> uses the trained weights to compute outputs for new inputs, and the weights usually stay fixed. Inference doesn't pull a prepared answer from a database. It runs a fresh forward pass and generates tokens one by one.</p>

  <figure class="fig">
    <img src="/assets/posts/ai-infra-from-zero-01/01_overview.svg" alt="How training, weights, inference, serving, and GPUs relate">
    <figcaption>Training produces the weights. Inference uses them. The serving system and the GPU make inference actually run.</figcaption>
  </figure>

  <p>Back to the AI coding agent. A user submits <strong>20,000 input tokens</strong> of code context, and the model generates <strong>50 output tokens</strong>. Here is the main flow:</p>
  <ol>
    <li>The application turns the content into token IDs the model can process.</li>
    <li><strong>Prefill</strong>: the model runs over all known input tokens, computes each layer's hidden states and KV, and gets what it needs to generate the first token.</li>
    <li><strong>Decode</strong>: the model usually generates one token per step, appends it to the context, and then generates the next one.</li>
    <li>The application turns the output tokens back into readable text and returns it.</li>
  </ol>

  <figure class="fig wide">
    <img src="/assets/posts/ai-infra-from-zero-01/02_prefill_decode.svg" alt="Prefill and decode flow">
    <figcaption>Prefill processes the whole known input at once. Decode generates one token per step.</figcaption>
  </figure>

  <h3>Prefill vs. Decode</h3>
  <div class="table-wrap">
    <table>
      <tr><th></th><th>Prefill</th><th>Decode</th></tr>
      <tr><td>Main job</td><td>Process the existing input</td><td>Generate new output step by step</td></tr>
      <tr><td>Parallelism</td><td>Input positions are known, so the work runs largely in parallel</td><td>Each step in a request usually depends on the token the previous step produced</td></tr>
      <tr><td>Typical metric</td><td>A large part of TTFT (time to first token)</td><td>TPOT (time per output token), generation speed</td></tr>
      <tr><td>Engineering focus</td><td>Handling long prompts efficiently</td><td>Efficiency of each generation step and KV access</td></tr>
    </table>
  </div>

  <p><strong>A quick check:</strong> one request has 20,000 input tokens and 50 output tokens. Another has 100 input tokens and 2,000 output tokens. The first will likely spend most of its resources on prefill. The second will likely feel the long decode. Token counts alone can't predict total latency, though.</p>
  <p><strong>An easy detail to get wrong:</strong> 2,000 output tokens means roughly 2,000 sequential prediction steps, and each step still runs a huge amount of parallel GPU work. Batching also lets the GPU process different users' requests in the same decode step. In short, decoding is <em>sequential across generation steps; parallel within each step and across batched requests</em>. Methods such as speculative decoding can cut some of the sequential cost.</p>

  <!-- ============ 02 ============ -->
  <h2><span class="num">02</span>Causal Attention: Why Past States Stay Fixed</h2>

  <p>In a Transformer's self-attention, each token produces three vectors: a query, a key, and a value. For the 4th token, attention conceptually matches <strong>Q₄</strong> against <strong>K₁…K₄</strong>, then uses the resulting weights to combine <strong>V₁…V₄</strong>.</p>

  <figure class="fig">
    <img src="/assets/posts/ai-infra-from-zero-01/03_causal_matrix.svg" alt="Causal attention matrix">
    <figcaption>Blue cells are already computed, green is the new token's row, and gray is the future the model can't see. A new token adds only one new row.</figcaption>
  </figure>

  <p><strong>Causal</strong> means a position can't see tokens that come after it. When the 4th token arrives, the attention results for the first three positions don't change. The model only computes the output for the new position.</p>
  <p>The standard attention formula:</p>
  <div class="formula">Attention(<i>Q</i>, <i>K</i>, <i>V</i>) = softmax<span style="font-size:1.4em">(</span><span class="frac"><span><i>QK</i><sup>T</sup></span><span>√<i>d</i><sub><i>k</i></sub></span></span><span style="font-size:1.4em">)</span> <i>V</i></div>

  <h3>Why Cache K and V but Not Past Q?</h3>

  <figure class="fig">
    <img src="/assets/posts/ai-infra-from-zero-01/04_qkv.svg" alt="How Q, K, and V are used when computing a new token">
    <figcaption>Past queries have done their job. The new position keeps reusing the past keys and values, and those are what the KV cache stores.</figcaption>
  </figure>

  <ul>
    <li><strong>Past Q</strong>: the model already used it to compute that position's attention output. A new position doesn't need to send queries from Q₁, Q₂, or Q₃ again.</li>
    <li><strong>Past K</strong>: the new query Q₄ still compares against the past keys to compute new attention scores.</li>
    <li><strong>Past V</strong>: the new attention weights still combine the past values to produce the current output.</li>
    <li><strong>The full attention matrix</strong>: there's no need to keep every score for every past query. Each new query computes its own scores, and the full matrix can get very large.</li>
  </ul>
  <p>So the <strong>KV cache stores the past key and value tensors for each attention layer</strong>. It doesn't store raw text, and it isn't the model's "memory database."</p>

  <div class="chain">The causal chain: <b>causal mask</b> → old positions aren't affected by the future → the old K/V can be reused → the next decode step repeats less work</div>

  <p>The cache doesn't remove attention itself. A new token still has to compute its own state, score it against the past keys, and combine the values.</p>

  <!-- ============ 03 ============ -->
  <h2><span class="num">03</span>The Benefit and Cost of the KV Cache</h2>

  <p><strong>Benefit:</strong> later steps in the same request don't recompute the whole history from scratch. Long conversations and multi-turn agent tasks gain the most.</p>
  <p><strong>Cost:</strong> the KV tensors have to live somewhere, usually in GPU memory. For common full-context attention models, with everything else fixed, KV cache size grows roughly linearly with context length and with the number of active requests. GPU memory is limited, so an engine can't keep every user's full history for free.</p>
  <p>That leaves two goals pulling against each other:</p>
  <blockquote><p>Reuse the cache as much as possible to avoid repeated work, without letting it fill GPU memory and crowd out new requests.</p></blockquote>
  <p>Modules 02 (GPU memory and bandwidth) and 03 (serving) in the knowledge tree pick up this bottleneck.</p>

  <!-- ============ 04 ============ -->
  <h2><span class="num">04</span>From One Request's KV Cache to Prefix Reuse across Requests</h2>

  <p>Ordinary incremental generation first reuses past KV <strong>within the same request</strong>. One step further: if <strong>different requests share exactly the same token prefix</strong>, and the model and inference settings are compatible, the engine can reuse that prefix's KV too.</p>
  <p>Suppose there are three requests:</p>
  <ul>
    <li><strong>A</strong>: shared system prompt (2,000) + Python code (5,000), 7,000 tokens in total.</li>
    <li><strong>B</strong>: the same shared system prompt (2,000) + JavaScript code (3,000), 5,000 tokens in total.</li>
    <li><strong>C</strong>: the same system prompt (2,000) + the same Python code (5,000) + a new question (150), 7,150 tokens in total.</li>
  </ul>

  <figure class="fig">
    <img src="/assets/posts/ai-infra-from-zero-01/05_prefix_tree.svg" alt="A prefix tree built from shared prefixes">
    <figcaption>One edge can stand for a whole run of consecutive tokens. Nodes closer to the root are shared by more requests.</figcaption>
  </figure>

  <p><strong>Inference engines often manage these prefixes with a compressed prefix tree.</strong> One edge can represent a run of consecutive tokens, and requests with the same prefix share a branch. The engine maps token sequences to their KV cache locations, and uses the tree to match prefixes, insert new entries, reuse cached KV, and evict old entries. The tree is an index; the actual KV data lives separately in GPU memory.</p>
  <p>In the ideal case, where the cache stays available:</p>

  <div class="table-wrap">
    <table>
      <tr><th>Request</th><th class="r">Input to process without reuse</th><th class="r">New input with prefix reuse</th></tr>
      <tr><td>A</td><td class="r">7,000</td><td class="r">7,000</td></tr>
      <tr><td>B</td><td class="r">5,000</td><td class="r">3,000</td></tr>
      <tr><td>C</td><td class="r">7,150</td><td class="r">150</td></tr>
      <tr class="total"><td>Total</td><td class="r">19,150</td><td class="r">10,150</td></tr>
    </table>
  </div>

  <p>That cuts repeated prefill work by <strong>9,000 / 19,150 ≈ 47%</strong> of input tokens. It doesn't mean real latency or FLOPs drop by 47%. Actual performance also depends on compute overhead, the implementation, and whether the cache is still there.</p>
  <p>One key point: <strong>the same words don't mean the same KV</strong>. A token's higher-layer representation depends on the context before it. What an engine can reuse is the computed state of an identical prefix, with compatible positions and settings. Matching words across two different conversations doesn't count.</p>

  <h3>Eviction</h3>
  <p>When GPU memory runs short, an engine can't keep every branch. A common policy is LRU (least recently used): free cache starting from evictable leaf nodes, and protect the parts that active requests are using. Some engines also offer LFU, SLRU, or priority-based eviction. Whether a cache entry hits, or still exists, also depends on request scheduling, routing, and GPU capacity.</p>

  <!-- ============ 05 ============ -->
  <h2><span class="num">05</span>Where I Got It Wrong: The Real Split Isn't B2B vs. B2C</h2>

  <p>My first instinct: B2B teams share code repositories, so their prompts seem more likely to repeat. B2C users each have different histories, so sharing seems hard.</p>
  <p>Then I realized that <strong>sharing across users is only one source of reuse</strong>:</p>

  <figure class="fig">
    <img src="/assets/posts/ai-infra-from-zero-01/07_workload.svg" alt="Three sharing scopes that can all produce reuse">
    <figcaption>Reuse can come from three different scopes.</figcaption>
  </figure>

  <div class="table-wrap">
    <table>
      <tr><th>Sharing scope</th><th>Example</th><th>What it means</th></tr>
      <tr><td>Global / cross-user</td><td>A fixed system prompt and tool definitions</td><td>Different users can share a stable prefix</td></tr>
      <tr><td>Project</td><td>The same codebase and project instructions</td><td>Team workflows may share an extra-long prefix</td></tr>
      <tr><td>Session</td><td>One person's ongoing conversation and history</td><td>Even when every user differs, each session keeps reusing its own prefix</td></tr>
    </table>
  </div>

  <p><strong>The value of prefix caching depends on how much of a workload is repeated, stable, reusable prefix, and on whether the engine can keep and reach it. The B2B or B2C label doesn't decide it.</strong></p>

  <!-- ============ 06 ============ -->
  <h2><span class="num">06</span>Prompt Structure Is Engineering Too</h2>

  <p>A concrete question came up for me: suppose a prompt puts a changing <strong>user ID or timestamp</strong> at the very beginning. The 2,000-token system prompt after it is identical every time. Why does the cache still miss so often?</p>
  <p>Prefix matching starts at the first token. Once the beginning differs, every later position has a different context. The engine can't skip the start and reuse the KV for the part after it.</p>
  <p>The better principle: <strong>stable content first, dynamic content last.</strong></p>

  <figure class="fig">
    <img src="/assets/posts/ai-infra-from-zero-01/06_prompt_order.svg" alt="How prompt order affects cache hits">
    <figcaption>Left: dynamic content comes first, so the prefix breaks at the start. Right: content ordered from most to least stable reuses more.</figcaption>
  </figure>

  <p>You can layer a prompt by stability:</p>
  <ol>
    <li><strong>Global</strong>: stable tool definitions and system instructions.</li>
    <li><strong>Project</strong>: shared project instructions and codebase context.</li>
    <li><strong>Session</strong>: the stable history of the current session.</li>
    <li><strong>Dynamic</strong>: the current task, temporary state, the time, and anything else that changes.</li>
  </ol>
  <p>If the user ID or timestamp only exists for application logs, <strong>leave it out of the model prompt entirely</strong> and manage it as application metadata. Two limits apply. Don't reorder instructions the model must follow just to raise the hit rate, and don't cross data isolation boundaries between tenants. Real APIs also often fix the serialization order as <code>tools → system → messages</code>.</p>

  <h3>A Real Case: Claude Code</h3>
  <p>In a 2026 engineering post, "Lessons from building Claude Code: Prompt caching is everything," Anthropic describes what they do in practice. They put the static system prompt and tool definitions in a stable prefix, then layer the project's <code>CLAUDE.md</code>, session state, and conversation after it. They also hit cache misses caused by timestamps and changes in tool order, and they stress stable prefixes and cache metrics.</p>
  <p class="note">To be precise: this describes prompt caching in Anthropic's own API. It says nothing about which open-source inference engine, if any, runs underneath Claude Code. What carries over is the engineering principle, not the implementation.</p>

  <!-- ============ 07 ============ -->
  <h2><span class="num">07</span>Connecting the Chain</h2>

  <p>At this point I won't just say "this inference engine makes AI faster." A causal chain explains more:</p>
  <div class="chain">The same prefixes keep appearing → repeated prefill costs compute → KV makes old computed state reusable → a prefix tree finds shared prefixes automatically → less repeated work, and in some workloads lower latency and resource pressure → memory, eviction, and scheduling still need managing</div>
  <p>An inference engine does far more than prefix caching. It also handles request scheduling, batching, model execution, and other optimizations. This post follows only one important technical thread. That thread leads to some product questions:</p>
  <ul>
    <li>Which developer workloads share a lot of stable prefix: agents, multi-turn coding, or RAG?</li>
    <li>How do you measure effective cache hits, TTFT, TPOT, throughput, and cost per request?</li>
    <li>Under which models, hardware, and request patterns are the gains large? When is the cache worth the GPU memory it takes?</li>
  </ul>
  <p>After this module, I can walk from user input through prefill → decode → causal attention → KV cache → prefix reuse across requests, and explain the benefits, the costs, and when it applies.</p>

  <h2><span class="num">—</span>References</h2>
  <ol class="refs">
    <li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Vaswani et al., Attention Is All You Need (2017)</a></li>
    <li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener">Kwon et al., Efficient Memory Management for Large Language Model Serving with PagedAttention (2023)</a></li>
    <li><a href="https://docs.vllm.ai/en/latest/design/prefix_caching.html" target="_blank" rel="noopener">vLLM: Automatic Prefix Caching (design doc)</a></li>
    <li><a href="https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything" target="_blank" rel="noopener">Anthropic: Lessons from building Claude Code: Prompt caching is everything (2026-04-30)</a></li>
    <li><a href="https://platform.claude.com/docs/en/build-with-claude/prompt-caching" target="_blank" rel="noopener">Anthropic: Prompt Caching Docs</a></li>
  </ol>
  <p class="note">Limits of these notes: the diagrams are simplified and don't show any engine's full official implementation. The token counts are teaching assumptions. Sharing across requests depends on the model, its settings, whether the cache is still resident, and isolation rules. Prompt caching in Anthropic's API isn't the same as prefix caching inside an open-source inference engine. Fewer repeated input tokens don't translate into proportional savings in real GPU compute or cost.</p>

  <div class="next"><a href="/posts/ai-infra-from-zero-02">Next · 02: Why Is the GPU Still a Bottleneck? →</a></div>
<nav class="next" aria-label="Related AI infrastructure articles"><a href="/posts/ai-infra-from-zero-02">Why Is the GPU Still a Bottleneck?</a><br><a href="/posts/ai-infra-from-zero-03">How Does an LLM Serve Thousands of Requests?</a></nav>
</div>
</div>

<div class="lang-zh">
<div class="infra-note infra-note--gpu">
<div class="series">AI Infra 学习笔记 · 01 / 05</div>
<div class="meta">从 prefill 和 decode，到 KV cache，以及请求之间的前缀复用</div>

<p class="note">这是我从零学 AI infra 的第一篇。写给和我一样的人：你用过 AI，大概知道它怎么工作，但不是做基础设施的。下面的 token 数和例子是我为了把机制讲清楚而设的假设。图也不代表任何一个引擎的完整官方实现。</p>

<h2><span class="num">00</span>我是怎么开始学 AI infra 的</h2>
<p>我对 AI infra 一无所知，连从哪开始都不知道。但我当时在面试的那家公司做的就是 AI infra，所以我得搞清楚这个领域到底在干什么。</p>
<p>我的第一步是让 AI 给我讲。</p>
<p>第一次我让它讲基础。答案太浅，而且有几段根本不是 AI infra。第二次我让它盯着那家公司的核心技术。它开始介绍公司了。我的反应是：不对不对，停一下。这不对。</p>
<p>这时候我注意到整个过程里最重要的一课：</p>
<blockquote><p>AI 给你的东西感觉不对时，不要让它一遍遍重来。它没懂你要什么，再试也不会到那儿。停下来，跟它一起把你真正要的东西说清楚。</p></blockquote>
<p>于是我换了问法：“这个领域我还不懂。我们能不能先建一棵知识树？把结构给我，拆成步骤，然后我一层一层往下学。”</p>
<p>这一次，它给的学习计划是对的。</p>
<p>还有一个习惯差别很大。每学完一个概念，我让 AI 问我一个问题，我来答。这样它能检验我是不是真懂了。这就是费曼技巧：你能用自己的话说出来，才算懂。我怎么用 AI 做这件事，写在 <a href="https://echore.github.io/ai-projects/posts/learn-anything-with-ai.html">How to Learn Anything (the AI Edition)</a>。</p>
<div class="steps">
<div class="step"><div class="n">1</div><h4>停下，别重试</h4><p>重试只会给你同一份误解的新版本。先和 AI 对齐你到底要什么。</p></div>
<div class="step"><div class="n">2</div><h4>先要结构</h4><p>让 AI 把这个领域画成一棵层次清楚的知识树，再决定从哪开始。</p></div>
<div class="step"><div class="n">3</div><h4>每个节点一个问题</h4><p>一个模块学完，你应该能讲清一个真实的问题，而不是背定义。</p></div>
<div class="step"><div class="n">4</div><h4>每个概念之后考我</h4><p>每个概念之后，AI 问一个问题，我用自己的话答。答不出，就是还没懂。</p></div>
</div>
<figure class="fig wide">
<img src="/assets/posts/ai-infra-from-zero-01/00_knowledge_tree.svg" alt="AI infra 知识树，六个模块">
<figcaption>我的 AI infra 知识树：四层，六个模块。每个模块配一个我必须能答上来的问题。</figcaption>
</figure>
<p>这四层的顺序有关系。我得先单独看懂<strong>一次计算</strong>：模型怎么算，硬件卡在哪。然后是<strong>同时服务很多用户</strong>，再是<strong>持续把模型改好</strong>，最后是这些东西<strong>怎么变成一门生意</strong>。这篇讲的是模块 01：一条提示词进了 LLM 之后，计算上发生了什么，哪些重复的工作可以避开？</p>
<p>为了让想法具体，全文用同一个例子：<strong>一家创业公司，用 Qwen 这样的开源模型做 AI 编程助手</strong>。每个想法我按同样四个问题往下问。这个问题为什么会出现？计算实际上怎么走？所以它改变了什么？在真实产品里怎么用？</p>

<h2><span class="num">01</span>训练、推理，以及一个请求的一生</h2>
<p><strong>训练</strong>调整模型的权重，让模型学会做一件事。普通的<strong>推理</strong>用训练好的权重，给新的输入算出输出，权重通常不再变。推理不是从数据库里取出一份准备好的答案。它跑一次新的前向计算，一个一个生成 token。</p>
<figure class="fig">
<img src="/assets/posts/ai-infra-from-zero-01/01_overview.svg" alt="训练、权重、推理、服务和 GPU 之间的关系">
<figcaption>训练产出权重。推理使用权重。服务系统和 GPU 让推理真正跑起来。</figcaption>
</figure>
<p>回到 AI 编程助手。用户提交 <strong>20,000 个输入 token</strong> 的代码上下文，模型生成 <strong>50 个输出 token</strong>。主流程是这样：</p>
<ol>
<li>应用把内容变成模型能处理的 token ID。</li>
<li><strong>Prefill</strong>：模型过一遍所有已知的输入 token，算出每一层的隐藏状态和 KV，得到生成第一个 token 需要的东西。</li>
<li><strong>Decode</strong>：模型通常每一步生成一个 token，把它接到上下文后面，再生成下一个。</li>
<li>应用把输出 token 变回可读的文字，返回去。</li>
</ol>
<figure class="fig wide">
<img src="/assets/posts/ai-infra-from-zero-01/02_prefill_decode.svg" alt="Prefill 和 decode 的流程">
<figcaption>Prefill 一次处理整段已知输入。Decode 每一步生成一个 token。</figcaption>
</figure>
<h3>Prefill 和 decode</h3>
<div class="table-wrap">
<table>
<tr><th></th><th>Prefill</th><th>Decode</th></tr>
<tr><td>主要工作</td><td>处理已经有的输入</td><td>一步一步生成新的输出</td></tr>
<tr><td>能不能并行</td><td>输入位置已知，所以工作大体可以并行</td><td>一个请求里，每一步通常依赖上一步产出的 token</td></tr>
<tr><td>常见指标</td><td>TTFT（首 token 时间）里的一大块</td><td>TPOT（每个输出 token 的时间）、生成速度</td></tr>
<tr><td>工程上盯什么</td><td>长提示词怎么高效处理</td><td>每一步生成的效率，以及读取 KV</td></tr>
</table>
</div>
<p><strong>快速核对一下：</strong>一个请求有 20,000 个输入 token、50 个输出 token。另一个有 100 个输入 token、2,000 个输出 token。第一个多半把资源花在 prefill 上。第二个会明显感到 decode 很长。不过只看 token 数，预测不了总延迟。</p>
<p><strong>一个容易弄错的细节：</strong>2,000 个输出 token，大约是 2,000 次按顺序的预测，而每一步里面 GPU 仍然做大量并行的工作。Batching 还让 GPU 在同一次 decode 里处理不同用户的请求。简单说，decode 是<em>生成步骤之间串行；每一步内部、以及 batch 里的不同请求之间并行</em>。投机解码这类方法可以削掉一部分串行成本。</p>

<h2><span class="num">02</span>因果注意力：为什么过去的状态不再变</h2>
<p>Transformer 的自注意力里，每个 token 产出三个向量：query、key、value。对第 4 个 token，注意力在概念上是拿 <strong>Q₄</strong> 去对 <strong>K₁…K₄</strong>，再用得到的权重去组合 <strong>V₁…V₄</strong>。</p>
<figure class="fig">
<img src="/assets/posts/ai-infra-from-zero-01/03_causal_matrix.svg" alt="因果注意力矩阵">
<figcaption>蓝色格子是已经算过的，绿色是新 token 的那一行，灰色是模型看不见的未来。一个新 token 只多加一行。</figcaption>
</figure>
<p><strong>因果</strong>是说，一个位置看不见它后面的 token。第 4 个 token 到来时，前三个位置的注意力结果不变。模型只算新位置的输出。</p>
<p>标准的注意力公式：</p>
<div class="formula">Attention(<i>Q</i>, <i>K</i>, <i>V</i>) = softmax<span style="font-size:1.4em">(</span><span class="frac"><span><i>QK</i><sup>T</sup></span><span>√<i>d</i><sub><i>k</i></sub></span></span><span style="font-size:1.4em">)</span> <i>V</i></div>
<h3>为什么缓存 K 和 V，不缓存过去的 Q？</h3>
<figure class="fig">
<img src="/assets/posts/ai-infra-from-zero-01/04_qkv.svg" alt="计算一个新 token 时，Q、K、V 各自怎么用">
<figcaption>过去的 query 已经完成了它们的工作。新位置反复用的是过去的 key 和 value，KV cache 存的就是这些。</figcaption>
</figure>
<ul>
<li><strong>过去的 Q</strong>：模型已经用它算过那个位置的注意力输出。新位置不需要再把 Q₁、Q₂、Q₃ 的 query 发一遍。</li>
<li><strong>过去的 K</strong>：新的 query Q₄ 还是要和过去的 key 比较，才能算出新的注意力分数。</li>
<li><strong>过去的 V</strong>：新的注意力权重还是要去组合过去的 value，才能得到当前的输出。</li>
<li><strong>整张注意力矩阵</strong>：不必把每个过去 query 的每个分数都留着。每个新 query 自己算自己的分数，整张矩阵可以非常大。</li>
</ul>
<p>所以 <strong>KV cache 存的是每一层注意力里，过去的 key 和 value 张量</strong>。它不存原文，也不是模型的“记忆数据库”。</p>
<div class="chain">这条因果链：<b>因果掩码</b> → 旧位置不受未来影响 → 旧的 K/V 可以复用 → 下一步 decode 少重复一些工作</div>
<p>缓存并没有把注意力本身去掉。一个新 token 还是要算出自己的状态，和过去的 key 打分，再把 value 组合起来。</p>

<h2><span class="num">03</span>KV cache 的好处和代价</h2>
<p><strong>好处：</strong>同一次请求里，后面的步骤不必把整段历史从头重算。长对话和多轮的 agent 任务受益最大。</p>
<p><strong>代价：</strong>这些 KV 张量得放在某个地方，通常是 GPU 显存。对常见的全上下文注意力模型，其他条件不变时，KV cache 的大小大致随上下文长度、以及同时活跃的请求数线性增长。GPU 显存有限，引擎没法免费把每个用户的完整历史都留着。</p>
<p>于是有两个互相拉扯的目标：</p>
<blockquote><p>尽可能复用缓存，避开重复的工作，又不能让它占满 GPU 显存，把新请求挤出去。</p></blockquote>
<p>知识树里的模块 02（GPU 显存和带宽）和模块 03（服务）接着讲这个瓶颈。</p>

<h2><span class="num">04</span>从一次请求里的 KV cache，到请求之间的前缀复用</h2>
<p>普通的增量生成，先是在<strong>同一次请求内部</strong>复用过去的 KV。再进一步：如果<strong>不同请求的 token 前缀完全一样</strong>，而且模型和推理设置兼容，引擎也可以复用这段前缀的 KV。</p>
<p>假设有三个请求：</p>
<ul>
<li><strong>A</strong>：共用的系统提示（2,000）+ Python 代码（5,000），一共 7,000 个 token。</li>
<li><strong>B</strong>：同一段系统提示（2,000）+ JavaScript 代码（3,000），一共 5,000 个 token。</li>
<li><strong>C</strong>：同一段系统提示（2,000）+ 同一段 Python 代码（5,000）+ 一个新问题（150），一共 7,150 个 token。</li>
</ul>
<figure class="fig">
<img src="/assets/posts/ai-infra-from-zero-01/05_prefix_tree.svg" alt="由共享前缀建成的前缀树">
<figcaption>一条边可以代表连续的一整段 token。越靠近根的节点，被越多请求共用。</figcaption>
</figure>
<p><strong>推理引擎常常用一棵压缩过的前缀树来管理这些前缀。</strong>一条边可以代表连续的一段 token，前缀相同的请求共用一条分支。引擎把 token 序列映射到它们的 KV cache 位置，用这棵树来匹配前缀、插入新条目、复用缓存的 KV、驱逐旧条目。树是索引；真正的 KV 数据另外放在 GPU 显存里。</p>
<p>理想情况下，缓存还在：</p>
<div class="table-wrap">
<table>
<tr><th>请求</th><th class="r">不复用时要处理的输入</th><th class="r">前缀复用后的新输入</th></tr>
<tr><td>A</td><td class="r">7,000</td><td class="r">7,000</td></tr>
<tr><td>B</td><td class="r">5,000</td><td class="r">3,000</td></tr>
<tr><td>C</td><td class="r">7,150</td><td class="r">150</td></tr>
<tr class="total"><td>合计</td><td class="r">19,150</td><td class="r">10,150</td></tr>
</table>
</div>
<p>重复的 prefill 少了 <strong>9,000 / 19,150 ≈ 47%</strong> 的输入 token。这不是说真实延迟或 FLOPs 会降 47%。实际表现还取决于计算开销、具体实现，以及缓存还在不在。</p>
<p>一个关键点：<strong>字面相同，不等于 KV 相同</strong>。一个 token 在更高层的表示，取决于它前面的上下文。引擎能复用的，是一段完全相同的前缀、在兼容的位置和设置下已经算好的状态。两段不同对话里碰巧出现同样的词，不算。</p>
<h3>驱逐</h3>
<p>GPU 显存不够时，引擎没法留下每一条分支。常见策略是 LRU（最近最少使用）：从可以驱逐的叶子节点开始释放缓存，并保护正在被活跃请求使用的部分。有的引擎也提供 LFU、SLRU，或按优先级驱逐。一条缓存命中没有、还在不在，也取决于请求调度、路由和 GPU 容量。</p>

<h2><span class="num">05</span>我一开始想错了：真正的分界不是 B2B 和 B2C</h2>
<p>我的第一反应：B2B 团队共用代码仓库，提示词似乎更容易重复。B2C 用户每人历史都不同，共享似乎很难。</p>
<p>后来我发现，<strong>跨用户共享只是复用的一个来源</strong>：</p>
<figure class="fig">
<img src="/assets/posts/ai-infra-from-zero-01/07_workload.svg" alt="三种都能产生复用的共享范围">
<figcaption>复用可以来自三个不同的范围。</figcaption>
</figure>
<div class="table-wrap">
<table>
<tr><th>共享范围</th><th>例子</th><th>它是什么意思</th></tr>
<tr><td>全局 / 跨用户</td><td>固定的系统提示和工具定义</td><td>不同用户可以共用一段稳定的前缀</td></tr>
<tr><td>项目</td><td>同一份代码库和项目说明</td><td>团队的工作流可能共用一段更长的前缀</td></tr>
<tr><td>会话</td><td>一个人正在进行的对话和历史</td><td>即使用户彼此都不同，每个会话也会反复复用自己的前缀</td></tr>
</table>
</div>
<p><strong>前缀缓存有没有价值，取决于一份负载里有多少是重复的、稳定的、可以复用的前缀，以及引擎能不能留住它、用到它。B2B 还是 B2C 这个标签决定不了。</strong></p>

<h2><span class="num">06</span>提示词怎么排，也是工程</h2>
<p>我碰到一个具体问题：假设提示词把会变的<strong>用户 ID 或时间戳</strong>放在最前面。它后面那 2,000 个 token 的系统提示每次都一样。为什么缓存还是经常没命中？</p>
<p>前缀匹配从第一个 token 开始。开头一不一样，后面每个位置的上下文都变了。引擎不能跳过开头，去复用后面那一段的 KV。</p>
<p>更好的原则是：<strong>稳定的内容在前，会变的内容在后。</strong></p>
<figure class="fig">
<img src="/assets/posts/ai-infra-from-zero-01/06_prompt_order.svg" alt="提示词的顺序怎么影响缓存命中">
<figcaption>左边：会变的内容在前，前缀从一开始就断了。右边：从最稳定到最易变来排，能复用的更多。</figcaption>
</figure>
<p>可以按稳定程度把提示词分层：</p>
<ol>
<li><strong>全局</strong>：稳定的工具定义和系统说明。</li>
<li><strong>项目</strong>：共用的项目说明和代码库上下文。</li>
<li><strong>会话</strong>：当前会话里稳定的历史。</li>
<li><strong>动态</strong>：当前任务、临时状态、时间，以及其他会变的东西。</li>
</ol>
<p>如果用户 ID 或时间戳只是给应用日志用的，<strong>就不要放进给模型的提示词</strong>，把它当成应用自己的元数据来管。有两条限制。不要为了提高命中率，打乱模型必须遵守的指令顺序；也不要越过租户之间的数据隔离。真实的 API 也常常把序列化顺序固定成 <code>tools → system → messages</code>。</p>
<h3>一个真实的例子：Claude Code</h3>
<p>在 2026 年的一篇工程文章里，Anthropic 写了他们实际怎么做：《Lessons from building Claude Code: Prompt caching is everything》。他们把静态的系统提示和工具定义放在一段稳定的前缀里，然后依次放上项目的 <code>CLAUDE.md</code>、会话状态和对话。他们也碰到过时间戳和工具顺序变化造成的缓存未命中，并且强调稳定的前缀和缓存指标。</p>
<p class="note">说准确一点：这里讲的是 Anthropic 自己 API 里的 prompt caching。它没有说 Claude Code 底下跑的是哪个开源推理引擎，或者有没有。能搬过来的是工程原则，不是那套实现。</p>

<h2><span class="num">07</span>把这条链接上</h2>
<p>到这里，我不会只说“这个推理引擎让 AI 更快”。一条因果链能解释更多：</p>
<div class="chain">同样的前缀反复出现 → 重复的 prefill 要花计算 → KV 让已经算过的旧状态可以复用 → 前缀树自动找到共用的前缀 → 少做重复的工作，在有些负载上延迟和资源压力也会下来 → 显存、驱逐和调度仍然要管</div>
<p>推理引擎做的远不止前缀缓存。它还要管请求调度、batching、模型执行，以及其他优化。这篇只顺着一条重要的技术线走。这条线会引出一些产品问题：</p>
<ul>
<li>哪些开发者负载有大量稳定前缀：agent、多轮写代码，还是 RAG？</li>
<li>怎么衡量有效的缓存命中、TTFT、TPOT、吞吐，以及每个请求的成本？</li>
<li>在哪些模型、硬件和请求形态下，收益是大的？这块缓存占用的 GPU 显存，什么时候划算？</li>
</ul>
<p>这个模块之后，我可以从用户输入走到 prefill → decode → 因果注意力 → KV cache → 请求之间的前缀复用，并讲清好处、代价，以及它在什么时候适用。</p>

<h2><span class="num">—</span>参考</h2>
<ol class="refs">
<li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Vaswani 等人，Attention Is All You Need（2017）</a></li>
<li><a href="https://arxiv.org/abs/2309.06180" target="_blank" rel="noopener">Kwon 等人，用 PagedAttention 为大规模语言模型服务做高效显存管理（2023）</a></li>
<li><a href="https://docs.vllm.ai/en/latest/design/prefix_caching.html" target="_blank" rel="noopener">vLLM：自动前缀缓存（设计文档）</a></li>
<li><a href="https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything" target="_blank" rel="noopener">Anthropic：Lessons from building Claude Code: Prompt caching is everything（2026-04-30）</a></li>
<li><a href="https://platform.claude.com/docs/en/build-with-claude/prompt-caching" target="_blank" rel="noopener">Anthropic：Prompt Caching 文档</a></li>
</ol>
<p class="note">这些笔记的边界：图是简化的，不是任何一个引擎的完整官方实现。token 数是教学假设。请求之间能不能共享，取决于模型、设置、缓存还在不在，以及隔离规则。Anthropic API 里的 prompt caching，和开源推理引擎内部的前缀缓存不是一回事。少了一些重复的输入 token，并不按比例变成真实 GPU 计算或成本上的节省。</p>
<div class="next"><a href="/posts/ai-infra-from-zero-02">下一篇 · 02：为什么 GPU 还是瓶颈？ →</a></div>
<nav class="next" aria-label="相关的 AI 基础设施文章"><a href="/posts/ai-infra-from-zero-02">为什么 GPU 还是瓶颈？</a><br><a href="/posts/ai-infra-from-zero-03">LLM 怎么同时服务几千个请求？</a></nav>
</div>
</div>
