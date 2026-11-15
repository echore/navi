---
title: "Learning AI Infrastructure Through Two Lenses"
titleZh: "AI Infrastructure 学习总览"
lang: en
tags: ["AI"]
date: 2026-11-15
readTime: 8
slug: ai-infra-overview
series: "AI Infra · Overview"
draft: false
featured: true
listed: true
pinned: true
wide: true
showTitle: true
---

<link rel="stylesheet" href="/styles/infra-overview.css">

<div class="infra-overview">
<div class="lang-en">
<div class="article-shell">
<aside class="rail"><nav aria-label="Sections"><span class="rail-title">Contents</span><a href="#why"><span>01</span> Why I started</a><a href="#design"><span>02</span> How I split it</a><a href="#map"><span>03</span> Learning map</a><a href="#insights"><span>04</span> What I can explain</a><a href="#reflection"><span>05</span> Still open</a></nav></aside>
<div class="article-content">

<section class="section" id="why">
<h2><span class="num">01</span> Why I started</h2>
<p>I was interviewing at an AI infrastructure startup. The site, the GitHub, and the job posts are about serving, GPUs, and inference engines. I have used models. I could not explain what those engineers were building, or why a team would pay for it.</p>
<p>If the conversations went further, I needed two things. I needed to follow an engineering trade-off. And I needed a product question that was not naive: who this is for, what they use today, and what would make them switch.</p>
<p>Memorizing terms would not do that. I wanted a map of the questions, and notes I could reread before a conversation.</p>
<p>Three things I could not answer when I started:</p>
<ul>
<li><strong>Where the product sits.</strong> A model API, an inference engine, or a service wrapped around both?</li>
<li><strong>Which limit hurts.</strong> Memory, latency, or cost. I did not know which one that team was actually fighting.</li>
<li><strong>What I could say.</strong> One concrete thing to an engineer, and one concrete thing to a user. Not "AI infrastructure is important."</li>
</ul>
</section>

<section class="section" id="design">
<h2><span class="num">02</span> How I split the reading</h2>
<p>Two tracks, because those are the two conversations.</p>
<p><strong>Track A is the system.</strong> One model computation, then GPU limits, then serving many people at once, then what an inference engine trades off, then post-training. Five modules. Turning an open-source project into a business is not a technology module, so it is not on this track.</p>
<p><strong>Track B is the product.</strong> The first note is already written: <a href="/posts/ai-infra-product-lens">What Makes AI Infrastructure Worth Using?</a>, filed as AI Infra Track Product. It starts from the question I would actually get: if a hosted model API already works, why run any of this?</p>
<p>The rest of Track B is still a list. What developers complain about. How to tell that an optimization helped a user. How a project gets adopted and paid for. What I could contribute myself.</p>
<blockquote><p>Track A is so I can follow the engineering. Track B is so I know whether any of it is worth a user's time.</p></blockquote>
<h3>How I study one module</h3>
<p>I use AI to pull public material together: docs, GitHub, the company site, write-ups, job posts. I look at who is on the team. Then I ask for a tree and I correct it until the modules connect. Only then do I go into one of them.</p>
<p>For each module I want the what, the why, and the how. Then I try to explain it against a concrete setup, usually a small team serving a coding agent. Wrong explanations stay in the note, with the correction.</p>
</section>

<section class="section" id="map">
<h2><span class="num">03</span> Learning map</h2>
<p>Each row is a question I want to answer out loud. Yellow rows are notes. The others are still on the list.</p>

<div class="track">
<div class="track-kicker">Track A</div>
<h3>Technology</h3>
<p>From one computation to a system that serves many people. Five modules.</p>

<div class="phase-name">One computation</div>
<a class="mod" href="/posts/ai-infra-from-zero-01">
<span class="mod-no">01</span>
<span class="mod-copy"><span class="mod-title">What Happens After a Prompt Enters an LLM?</span><span class="mod-q">What is the model actually computing?</span></span>
<span class="mod-go">Read note</span>
</a>
<a class="mod" href="/posts/ai-infra-from-zero-02">
<span class="mod-no">02</span>
<span class="mod-copy"><span class="mod-title">Why Is the GPU Still a Bottleneck?</span><span class="mod-q">The model fits. Why can the service still fall over?</span></span>
<span class="mod-go">Read note</span>
</a>

<div class="phase-name">Serving many users</div>
<a class="mod" href="/posts/ai-infra-from-zero-03">
<span class="mod-no">03</span>
<span class="mod-copy"><span class="mod-title">How Does an LLM Serve Thousands of Requests?</span><span class="mod-q">Scheduling, batching, and what one GPU is shared across.</span></span>
<span class="mod-go">Read note</span>
</a>
<a class="mod" href="/posts/ai-infra-from-zero-04">
<span class="mod-no">04</span>
<span class="mod-copy"><span class="mod-title">What Makes an Inference Engine Actually Useful?</span><span class="mod-q">Which engine trade-off matters for a real workload.</span></span>
<span class="mod-go">Read note</span>
</a>

<div class="phase-name">Improving models</div>
<div class="mod waiting">
<span class="mod-no">05</span>
<span class="mod-copy"><span class="mod-title">Post-training and reinforcement learning</span><span class="mod-q">Why improving an agent takes a training loop, not just a better prompt.</span></span>
<span class="mod-go">Not written</span>
</div>
</div>

<div class="track">
<div class="track-kicker">Track B</div>
<h3>Product</h3>
<p>Who this is for, and when it is worth using. The first row is the product note that is already on the site.</p>

<div class="phase-name">Market and users</div>
<a class="mod" href="/posts/ai-infra-product-lens">
<span class="mod-no">01</span>
<span class="mod-copy"><span class="mod-title">What Makes AI Infrastructure Worth Using?</span><span class="mod-q">AI Infra Track Product. Who needs this if a hosted API already works?</span></span>
<span class="mod-go">Read note</span>
</a>
<div class="mod waiting">
<span class="mod-no">02</span>
<span class="mod-copy"><span class="mod-title">Developer research</span><span class="mod-q">What do developers actually complain about, in issues, docs, and support threads?</span></span>
<span class="mod-go">Not written</span>
</div>

<div class="phase-name">Does the optimization matter</div>
<div class="mod waiting">
<span class="mod-no">03</span>
<span class="mod-copy"><span class="mod-title">From a technical win to a user win</span><span class="mod-q">Who benefits, and what would convince me the benefit is real?</span></span>
<span class="mod-go">Not written</span>
</div>

<div class="phase-name">Drive adoption and build a business</div>
<div class="mod waiting">
<span class="mod-no">04</span>
<span class="mod-copy"><span class="mod-title">Getting it used, and getting paid</span><span class="mod-q">Docs, the first successful run, and how an open-source project charges.</span></span>
<span class="mod-go">Not written</span>
</div>

<div class="phase-name">Work I could do</div>
<div class="mod waiting">
<span class="mod-no">05</span>
<span class="mod-copy"><span class="mod-title">A contribution I can point at</span><span class="mod-q">A doc, an explainer, or a small fix. Something a team could use.</span></span>
<span class="mod-go">Not written</span>
</div>
</div>
<p class="map-note">Yellow means the note is up. Track B's first note is AI Infra Track Product, not a second essay waiting to be written.</p>
</section>

<section class="section" id="insights">
<h2><span class="num">04</span> What I can explain now</h2>
<h3><span class="num">01</span> One user is not the system</h3>
<p>I used to think of AI as: send a request, wait for an answer. That is the product I used.</p>
<p>Once many requests arrive together, the model answering is only part of it. Someone has to choose what runs, what can be reused, and how to spend GPU memory. Latency, throughput, and cost move against each other.</p>
<p>That is the part I would have blanked on in an interview a month ago.</p>
<div class="split">
<div class="panel"><h4>One request</h4><p>A prompt goes in. An answer comes out. The user never sees the GPU.</p></div>
<div class="panel lemon"><h4>Many requests</h4><p>They share one pool of memory and compute. Scheduling and cache reuse are the product, not a detail under it.</p></div>
</div>
<h3><span class="num">02</span> A higher number is not automatically better</h3>
<p>A higher cache hit rate does not mean lower end-to-end latency. It says even less about whether a developer had a better day.</p>
<p>Keeping more KV cache can skip repeated prefill. It can also take memory another request needed. Before I call that a win, I want the workload, and the thing the user actually notices.</p>
<div class="split">
<div class="panel lemon"><h4>Cache reuse up</h4><p>Less repeated prefill when requests share a prefix.</p></div>
<div class="panel"><h4>Memory pressure up</h4><p>The cache occupies GPU memory something else may need.</p></div>
</div>
</section>

<section class="section" id="reflection">
<h2><span class="num">05</span> What I still can't answer</h2>
<p>Most of my earlier work was consumer products. These conversations are with developers, infrastructure teams, and companies running agents. I like the stretch. I also keep hitting questions I would not survive if someone pushed.</p>
<p>The ones I want to work on next:</p>
<ol>
<li>When a developer picks an infrastructure product, what do they weigh besides speed and price?</li>
<li>How do I tell that an optimization changed the user's experience, not just a chart?</li>
<li>What does an open-source project need before people adopt it and pay for it?</li>
</ol>
<p>The map is for those questions. I will add a note when I can answer one without waving my hands.</p>
</section>

</div>
</div>
</div>

<div class="lang-zh">
<div class="article-shell">
<aside class="rail"><nav aria-label="目录"><span class="rail-title">目录</span><a href="#why-zh"><span>01</span> 为什么开始</a><a href="#design-zh"><span>02</span> 怎么拆</a><a href="#map-zh"><span>03</span> 学习地图</a><a href="#insights-zh"><span>04</span> 现在能讲的</a><a href="#reflection-zh"><span>05</span> 还答不好</a></nav></aside>
<div class="article-content">

<section class="section" id="why-zh">
<h2><span class="num">01</span> 为什么开始</h2>
<p>我当时在面一家做 AI infrastructure 的 startup。官网、GitHub、招聘信息都在讲 serving、GPU、推理引擎。模型我用过。我讲不清这些工程师在建什么，也讲不清一个团队为什么要为它付钱。</p>
<p>面试如果继续，我得准备好两件事。一件是听得懂工程师在做什么取舍。另一件是问得出一个不外行的产品问题：这是给谁的，他们现在用什么，什么会让他们换。</p>
<p>背名词没用。我要的是一张问题的地图，和面试前还能翻一遍的笔记。</p>
<p>刚开始我答不上来的三件事：</p>
<ul>
<li><strong>产品站在哪一层。</strong> 模型 API，推理引擎，还是包在两边外面的服务？</li>
<li><strong>真正卡住的是什么。</strong> 显存、延迟，还是成本。我不知道这家团队在扛哪一个。</li>
<li><strong>我能说出什么。</strong> 对工程师一句具体的，对用户一句具体的。不是「AI 基础设施很重要」。</li>
</ul>
</section>

<section class="section" id="design-zh">
<h2><span class="num">02</span> 我怎么拆</h2>
<p>拆成两条，因为面试里就是这两种对话。</p>
<p><strong>Track A 是系统。</strong> 一次计算，然后 GPU 的限制，然后同时服务很多人，然后推理引擎在换什么，然后 post-training。五块。开源项目怎么变成一门生意，不是技术模块，不放在这条线上。</p>
<p><strong>Track B 是产品。</strong> 第一篇已经写了，就是 <a href="/posts/ai-infra-product-lens">AI 基础设施，什么时候值得用？</a>，系列名是 AI Infra Track Product。它从我会被问到的那个问题开始：托管模型 API 已经能用，为什么还要自己跑这套？</p>
<p>后面还没写的是：开发者实际在抱怨什么，怎么判断一次优化帮到了用户，一个项目怎么被用起来、怎么收费，以及我自己能拿出什么。</p>
<blockquote><p>Track A 是为了听得懂工程。Track B 是为了知道这些东西值不值得用户花时间。</p></blockquote>
<h3>一块笔记我怎么学</h3>
<p>我先让 AI 把公开资料收拢：文档、GitHub、官网、技术文章、招聘帖。我再看看团队是什么背景。然后让它出一棵树，我改到模块之间对得上，才往下钻一块。</p>
<p>每一块我要 what、why、how。然后用一个具体场景自己讲一遍，通常是一个小团队在给 coding agent 做推理。讲错的留在笔记里，连同后来改对的地方。</p>
</section>

<section class="section" id="map-zh">
<h2><span class="num">03</span> 学习地图</h2>
<p>每一行是我想能口头答出来的一个问题。黄底的是已经写了的笔记，点进去就能读。其余的还在名单上。</p>

<div class="track">
<div class="track-kicker">Track A</div>
<h3>Technology</h3>
<p>从一次计算，到一套同时服务很多人的系统。五块。</p>

<div class="phase-name">一次计算</div>
<a class="mod" href="/posts/ai-infra-from-zero-01">
<span class="mod-no">01</span>
<span class="mod-copy"><span class="mod-title">提示词进了 LLM 之后，发生了什么？</span><span class="mod-q">模型到底在算什么？</span></span>
<span class="mod-go">读这篇</span>
</a>
<a class="mod" href="/posts/ai-infra-from-zero-02">
<span class="mod-no">02</span>
<span class="mod-copy"><span class="mod-title">为什么 GPU 还是瓶颈？</span><span class="mod-q">模型放得下，服务为什么还会垮？</span></span>
<span class="mod-go">读这篇</span>
</a>

<div class="phase-name">同时服务很多人</div>
<a class="mod" href="/posts/ai-infra-from-zero-03">
<span class="mod-no">03</span>
<span class="mod-copy"><span class="mod-title">LLM 怎么同时服务几千个请求？</span><span class="mod-q">调度、batch，以及一张 GPU 要分给谁。</span></span>
<span class="mod-go">读这篇</span>
</a>
<a class="mod" href="/posts/ai-infra-from-zero-04">
<span class="mod-no">04</span>
<span class="mod-copy"><span class="mod-title">推理引擎怎样才算真正有用？</span><span class="mod-q">引擎里的取舍，哪一个对真实负载有用。</span></span>
<span class="mod-go">读这篇</span>
</a>

<div class="phase-name">把模型变好</div>
<div class="mod waiting">
<span class="mod-no">05</span>
<span class="mod-copy"><span class="mod-title">Post-training 和强化学习</span><span class="mod-q">把 agent 变好，为什么需要训练闭环，而不只是改 prompt。</span></span>
<span class="mod-go">还没写</span>
</div>
</div>

<div class="track">
<div class="track-kicker">Track B</div>
<h3>Product</h3>
<p>这套东西给谁用，什么时候值得用。第一行就是站上已经有的那篇产品笔记。</p>

<div class="phase-name">市场和用户</div>
<a class="mod" href="/posts/ai-infra-product-lens">
<span class="mod-no">01</span>
<span class="mod-copy"><span class="mod-title">AI 基础设施，什么时候值得用？</span><span class="mod-q">AI Infra Track Product。托管 API 已经能用的话，谁还需要这套？</span></span>
<span class="mod-go">读这篇</span>
</a>
<div class="mod waiting">
<span class="mod-no">02</span>
<span class="mod-copy"><span class="mod-title">开发者研究</span><span class="mod-q">issue、文档、支持线程里，开发者实际在抱怨什么？</span></span>
<span class="mod-go">还没写</span>
</div>

<div class="phase-name">优化到底有没有用</div>
<div class="mod waiting">
<span class="mod-no">03</span>
<span class="mod-copy"><span class="mod-title">技术上的赢，到用户的赢</span><span class="mod-q">谁受益，什么证据能让我相信这不是自说自话？</span></span>
<span class="mod-go">还没写</span>
</div>

<div class="phase-name">让人用起来，并做成生意</div>
<div class="mod waiting">
<span class="mod-no">04</span>
<span class="mod-copy"><span class="mod-title">被用起来，以及怎么收费</span><span class="mod-q">文档、第一次跑通，还有开源项目怎么收钱。</span></span>
<span class="mod-go">还没写</span>
</div>

<div class="phase-name">我能做的</div>
<div class="mod waiting">
<span class="mod-no">05</span>
<span class="mod-copy"><span class="mod-title">一份能指给人看的贡献</span><span class="mod-q">一篇文档、一篇解释，或一个小改动。团队用得上的那种。</span></span>
<span class="mod-go">还没写</span>
</div>
</div>
<p class="map-note">黄底就是笔记已经写了。Track B 的第一篇就是 AI Infra Track Product，不是还等着写的另一篇。</p>
</section>

<section class="section" id="insights-zh">
<h2><span class="num">04</span> 我现在能讲清楚的</h2>
<h3><span class="num">01</span> 一个用户，还不是一套系统</h3>
<p>我以前理解 AI，就是发一个请求，等一个答案。那是我作为用户碰到的产品。</p>
<p>很多请求一起进来的时候，模型能答只是其中一块。还得有人决定先跑谁、什么可以复用、显存怎么分。延迟、吞吐和成本是互相挤的。</p>
<p>这是一个月前面试里我一定会空掉的部分。</p>
<div class="split">
<div class="panel"><h4>一个请求</h4><p>提示词进去，答案出来。用户看不见 GPU。</p></div>
<div class="panel lemon"><h4>很多请求</h4><p>它们分同一池显存和算力。调度和缓存复用就是产品本身，不是底下的细节。</p></div>
</div>
<h3><span class="num">02</span> 数字高，不等于更好</h3>
<p>缓存命中率高，不代表端到端延迟就低，更不代表开发者那天用得更顺。</p>
<p>多留一些 KV cache，可以少做重复的 prefill，也可以占掉别的请求需要的显存。我把它叫做赢之前，得先知道负载是什么，以及用户实际察觉到了什么。</p>
<div class="split">
<div class="panel lemon"><h4>缓存复用变多</h4><p>请求有相同前缀时，可以少做一遍 prefill。</p></div>
<div class="panel"><h4>显存更紧</h4><p>缓存占着的显存，可能是别的请求要用的。</p></div>
</div>
</section>

<section class="section" id="reflection-zh">
<h2><span class="num">05</span> 我还答不好的</h2>
<p>我以前做的多半是给普通用户的产品。这边对话的人换成了开发者、基础设施团队，还有在跑 agent 的公司。我喜欢这个跨度。也不断碰到一追问就虚的问题。</p>
<p>接下来想搞清的：</p>
<ol>
<li>开发者选一个基础设施产品时，除了速度和价格，还在看什么？</li>
<li>我怎么判断一次优化改的是用户的体验，而不只是一张图？</li>
<li>一个开源项目要具备什么，别人才会用它，并且为它付钱？</li>
</ol>
<p>这张图是给这些问题用的。哪一块我能不空讲了，再补一篇笔记。</p>
</section>

</div>
</div>
</div>
</div>
