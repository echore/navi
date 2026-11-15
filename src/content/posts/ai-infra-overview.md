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
---

<link rel="stylesheet" href="/styles/infra-overview.css">

<div class="infra-overview">
<div class="lang-en">
<div class="io-shell">
<aside class="rail"><nav aria-label="Contents"><span class="rail-title">Contents</span><a href="#why"><span class="n">01</span>Why I Started</a><a href="#design"><span class="n">02</span>How I Designed It</a><a href="#map"><span class="n">03</span>Learning Map</a><a href="#insights"><span class="n">04</span>What I've Learned</a><a href="#reflection"><span class="n">05</span>Reflections</a></nav></aside>
<div class="io-main">
<header class="io-hero">
<div class="series"><span></span>AI Infra Learning Notes · Overview</div>
<h1>Learning AI Infrastructure Through Two Lenses</h1>
<p class="meta">How models run, and why teams choose to run them.</p>
<p class="note">Five notes so far: four on how LLM inference works, one on why teams adopt it. This page is the map that connects them. Jump straight to the <a href="#map">Learning Map</a> to open any note.</p>
<nav class="io-toc" aria-label="Contents"><a href="#why">01 Why I Started</a><a href="#design">02 How I Designed It</a><a href="#map">03 Learning Map</a><a href="#insights">04 What I've Learned</a><a href="#reflection">05 Reflections</a></nav>
</header>

<section id="why">
<h2><span class="num">01</span>Why I Started</h2>
<p>The reason was simple at first: I was interviewing with an AI infrastructure startup.</p>
<p>I read through the company's website, its GitHub, and its public technical material. I also looked at the team's backgrounds and open roles on LinkedIn. The work sits deep in the technical stack, far from the consumer products I knew.</p>
<p>Before anything else, I needed to understand the technical world it operates in. And I wanted to actually learn it: <strong>why these technologies exist, what problems they solve, and how they turn into value for the people who use them.</strong></p>
<p>So I built my own learning roadmap from scratch.</p>
<div class="chain"><b>Interview</b> → <b>Public sources</b> <span>website · GitHub · LinkedIn · job posts</span> → <b>Knowledge tree</b> → <b>One note per module</b></div>
</section>

<section id="design">
<h2><span class="num">02</span>How I Designed My Learning</h2>
<p>I split the learning into two tracks that check each other.</p>
<p><strong>Track A: understand the technology.</strong> This closes my most direct gap: what problems engineers are solving, and why they make the trade-offs they do.</p>
<p><strong>Track B: understand the users and the business.</strong> I've always cared about user needs and how products get adopted, and I enjoy turning complex ideas into something other people can use. But good technology doesn't guarantee a valuable product. Track B asks who needs it, why, and what would make them adopt it.</p>
<blockquote><p>Track A tells me what the technology can do. Track B tells me whether that matters to anyone.</p></blockquote>
<h3>How I Study</h3>
<p>I start by using AI to collect and organize public material: project docs, GitHub, company websites, technical write-ups, and job postings. Then I ask it to build a knowledge tree, check how the modules connect, and revise the structure until it holds together. Only then do I go deep on one module at a time.</p>
<p>For each topic I start with the what, the why, and the how, then test my understanding against concrete scenarios. My misunderstandings and corrections go into the notes too.</p>
<div class="steps">
<div class="step"><div class="n">01</div><h4>Explore Sources</h4><p>Public material and product information</p></div>
<div class="step"><div class="n">02</div><h4>Build the Tree</h4><p>Settle the full structure first</p></div>
<div class="step"><div class="n">03</div><h4>What / Why / How</h4><p>Understand each mechanism</p></div>
<div class="step"><div class="n">04</div><h4>Feynman Check</h4><p>Explain it in my own words</p></div>
<div class="step"><div class="n">05</div><h4>Document</h4><p>Record corrections and new ideas</p></div>
</div>
</section>

<section id="map">
<h2><span class="num">03</span>My Learning Map</h2>
<p>Each module is a question worth answering, not just a term. Published modules open the full note.</p>
<div class="track">
<div class="track-head"><h3>Track A · Technology</h3><span>One computation → GPUs → serving many users → inference engines → post-training</span></div>
<ol class="modules">
<li><a class="module is-live" href="/posts/ai-infra-from-zero-01"><span class="m-num">01</span><span class="m-body"><span class="m-title">LLM Fundamentals</span><span class="m-q">What computation happens when a prompt enters an LLM?</span><span class="m-tags">Parameters · Tokens · Forward Pass · Prefill · Decode · KV Cache</span></span><span class="m-cta">Read note →</span></a></li>
<li><a class="module is-live" href="/posts/ai-infra-from-zero-02"><span class="m-num">02</span><span class="m-body"><span class="m-title">GPU &amp; Hardware</span><span class="m-q">Why can powerful GPUs still slow LLM inference down?</span><span class="m-tags">GPU Memory · HBM · Compute · Bandwidth · Latency · Throughput</span></span><span class="m-cta">Read note →</span></a></li>
<li><a class="module is-live" href="/posts/ai-infra-from-zero-03"><span class="m-num">03</span><span class="m-body"><span class="m-title">LLM Serving Systems</span><span class="m-q">How does one model serve thousands of users at once?</span><span class="m-tags">Scheduling · Batching · Caching · Concurrency</span></span><span class="m-cta">Read note →</span></a></li>
<li><a class="module is-live" href="/posts/ai-infra-from-zero-04"><span class="m-num">04</span><span class="m-body"><span class="m-title">SGLang &amp; Inference Optimization</span><span class="m-q">What trade-offs do open-source inference engines make?</span><span class="m-tags">Prefix Caching · Continuous Batching · PD Disaggregation</span></span><span class="m-cta">Read note →</span></a></li>
<li><div class="module is-next"><span class="m-num">05</span><span class="m-body"><span class="m-title">Post-training &amp; Reinforcement Learning</span><span class="m-q">Why does improving AI agents take training infrastructure?</span><span class="m-tags">Post-training · RL · Rollouts · Rewards · Train–Serve Loop</span></span><span class="m-status">Coming next</span></div></li>
</ol>
</div>
<div class="track">
<div class="track-head"><h3>Track B · Product &amp; Business</h3><span>Users and value → developer problems → product value → adoption → contribution</span></div>
<ol class="modules">
<li><a class="module is-live" href="/posts/ai-infra-product-lens"><span class="m-num">01</span><span class="m-body"><span class="m-title">What Makes AI Infrastructure Worth Using?</span><span class="m-q">Who needs AI infrastructure, and why would a team adopt it?</span><span class="m-tags">Users · Product Map · Value · Discovery · Adoption</span></span><span class="m-cta">Read note →</span></a></li>
<li><div class="module is-next"><span class="m-num">02</span><span class="m-body"><span class="m-title">Developer Research &amp; Customer Discovery</span><span class="m-q">What problems do developers actually run into?</span><span class="m-tags">GitHub Issues · PRs · Docs · Slack · JTBD · User Evidence</span></span><span class="m-status">Coming next</span></div></li>
<li><div class="module is-next"><span class="m-num">03</span><span class="m-body"><span class="m-title">From Technical Capability to Product Value</span><span class="m-q">Who benefits from an optimization, and how do we verify it?</span><span class="m-tags">Real Workloads · Trade-offs · Use Cases · Differentiation · Validation</span></span><span class="m-status">Planned</span></div></li>
<li><div class="module is-next"><span class="m-num">04</span><span class="m-body"><span class="m-title">Drive Adoption &amp; Build a Business</span><span class="m-q">How does a product get adopted, and how does an open-source project become a business?</span><span class="m-tags">DX · PMM · DevRel · GTM · Open-source Business · Monetization</span></span><span class="m-status">Planned</span></div></li>
<li><div class="module is-next"><span class="m-num">05</span><span class="m-body"><span class="m-title">Real-World Contribution</span><span class="m-q">What useful work can I actually contribute?</span><span class="m-tags">Documentation PRs · Technical Explainers · Workshops · Growth Experiments</span></span><span class="m-status">Planned</span></div></li>
</ol>
</div>
</section>

<section id="insights">
<h2><span class="num">04</span>What I've Learned So Far</h2>
<h3><span class="num">01</span>From One AI User to Inference at Scale</h3>
<p>I used to understand AI mostly as an everyday user: send a request, then wait for the model's answer.</p>
<p>Now I can see the other side. When many requests hit the system at once, the question isn't just whether the model can produce an answer. It's <strong>how GPU memory gets shared, how requests get scheduled, which computation can be reused, and how to balance cost, latency, and throughput.</strong></p>
<figure class="fig"><div class="fighead"><span>Fig. 04A · Inference at scale</span><span>Same model, a different systems problem</span></div>
<div class="scale-grid">
<div class="scale-card"><h4>One Request</h4><div class="people"><i></i></div><div class="down"></div><div class="box">LLM Inference<span>One input → one response</span></div></div>
<div class="scale-card"><h4>Many Concurrent Requests</h4><div class="people"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="down"></div><div class="box emph">Scheduling · Batching · Caching<span>Requests compete for shared resources</span></div><div class="down"></div><div class="box">GPU Memory &amp; Compute<span>Balance latency, throughput &amp; cost</span></div></div>
</div>
<figcaption>The model is the same in both cases. What changes at scale is that many requests compete for the same GPU memory and compute.</figcaption></figure>
<p class="more">Go deeper: <a href="/posts/ai-infra-from-zero-03">Note 03 · How Does an LLM Serve Thousands of Requests?</a></p>
<h3><span class="num">02</span>Higher Metrics Aren't Always Better</h3>
<p>A higher cache hit rate, for example, doesn't necessarily mean lower end-to-end latency. It says even less about developer experience.</p>
<p>Caching takes up GPU memory, and requests may have to wait. <strong>Improving one technical metric doesn't guarantee that the whole system, or the user experience, gets better.</strong></p>
<p>So before optimizing anything, I want to know the real workload and what users actually care about. That decides which metric is worth moving and how to measure the result.</p>
<figure class="fig"><div class="fighead"><span>Fig. 04B · Optimization is a trade-off</span><span>One metric up ≠ every outcome up</span></div>
<div class="metric-head">Decision: keep more reusable KV cache</div>
<div class="metric-branches"><div class="metric-branch"><h4>Cache Reuse ↑</h4><p>May cut repeated prefill computation</p></div><div class="metric-branch warn"><h4>Memory Pressure ↑</h4><p>May take GPU memory other requests need</p></div></div>
<div class="metric-join">↓</div>
<div class="metric-bottom">End-to-end latency &amp; developer experience = ?<span>Depends on the real workload, resource contention, and scheduling</span></div>
<figcaption>A conceptual sketch, not experimental results from any specific system. Whether an optimization works has to be checked against real usage.</figcaption></figure>
<p class="more">Go deeper: <a href="/posts/ai-infra-from-zero-04">Note 04 · What Makes an Inference Engine Actually Useful?</a></p>
</section>

<section id="reflection">
<h2><span class="num">05</span>Reflections &amp; Open Questions</h2>
<p>I used to focus on consumer products and the experience of everyday users.</p>
<p>AI infrastructure introduced me to completely different users: developers, infrastructure teams, enterprises, and people building complex agent systems.</p>
<p>I've really enjoyed the process. It feels like exploring a map. At first you only know the small area where you live, and it's hard to picture what lies beyond it. Once you start walking outward, you find how many different problems, technologies, and ways of working are out there.</p>
<p>And the more I learn, the more I see how much I still don't know.</p>
<p>Next, I want to connect what I understand about the technology to real developer research, instead of keeping it theoretical. These are the questions I most want to explore:</p>
<ol class="questions"><li>When developers choose an AI infrastructure product, what do they weigh besides performance and cost?</li><li>How can we tell whether a technical optimization actually improves the user experience?</li><li>What does a strong open-source project need to become a widely adopted, sustainable product?</li></ol>
<blockquote class="closing"><p>The more I explore, the bigger the map becomes.</p></blockquote>
</section>
</div>
</div>
</div>

<div class="lang-zh">
<div class="io-shell">
<aside class="rail"><nav aria-label="目录"><span class="rail-title">目录</span><a href="#zh-why"><span class="n">01</span>为什么开始</a><a href="#zh-design"><span class="n">02</span>怎么设计学习</a><a href="#zh-map"><span class="n">03</span>学习地图</a><a href="#zh-insights"><span class="n">04</span>学到了什么</a><a href="#zh-reflection"><span class="n">05</span>反思与问题</a></nav></aside>
<div class="io-main">
<header class="io-hero">
<div class="series"><span></span>AI Infra 学习笔记 · 总览</div>
<h1>AI Infrastructure 学习总览</h1>
<p class="meta">模型怎么跑起来，以及团队为什么愿意用它。</p>
<p class="note">目前写了五篇：四篇讲 LLM 推理怎么运作，一篇讲团队为什么会采用它。这一页是把它们串起来的地图。想直接读某一篇，可以跳到<a href="#zh-map">学习地图</a>。</p>
<nav class="io-toc" aria-label="目录"><a href="#zh-why">01 为什么开始</a><a href="#zh-design">02 怎么设计学习</a><a href="#zh-map">03 学习地图</a><a href="#zh-insights">04 学到了什么</a><a href="#zh-reflection">05 反思与问题</a></nav>
</header>

<section id="zh-why">
<h2><span class="num">01</span>为什么开始</h2>
<p>最初的原因其实很简单：我在面试一家 AI Infrastructure Startup。</p>
<p>我浏览了公司的官网、GitHub 和公开技术资料，也去 LinkedIn 看了团队背景和招聘岗位。这个领域在技术栈很深的位置，离我熟悉的消费级产品很远。</p>
<p>所以我首先需要理解它所处的技术世界。而且我希望真正学进去：<strong>这些技术为什么存在、解决什么问题，以及它们怎样变成用户能感受到的价值。</strong></p>
<p>于是，我从零做了一套自己的学习路线。</p>
<div class="chain"><b>面试机会</b> → <b>公开资料</b> <span>官网 · GitHub · LinkedIn · 招聘信息</span> → <b>Knowledge Tree</b> → <b>每个模块一篇笔记</b></div>
</section>

<section id="zh-design">
<h2><span class="num">02</span>我怎么设计这次学习</h2>
<p>我把学习分成两条互相校验的路线。</p>
<p><strong>Track A：理解技术。</strong>这是我最直接的知识缺口：工程师在解决什么问题，为什么做出这些取舍。</p>
<p><strong>Track B：理解用户和商业。</strong>我一直关心用户需求和产品怎么被采用，也喜欢把复杂的知识变成别人能用的东西。但技术做得好，不代表产品一定有价值。Track B 要回答：谁需要它，为什么需要，什么能让他们真正用起来。</p>
<blockquote><p>Track A 告诉我技术能做什么；Track B 告诉我这件事对谁重要。</p></blockquote>
<h3>我是怎么学习的</h3>
<p>我先用 AI 收集和整理公开资料，包括项目文档、GitHub、官网、技术文章和招聘信息。然后让它建一棵 Knowledge Tree，检查模块之间的逻辑关系，反复调整到结构合理，再一个模块一个模块地深入。</p>
<p>每个主题我先理解 What、Why 和 How，再用具体场景检验自己的理解。我的误解和修正过程也会写进笔记。</p>
<div class="steps">
<div class="step"><div class="n">01</div><h4>Explore Sources</h4><p>公开资料与产品信息</p></div>
<div class="step"><div class="n">02</div><h4>Build the Tree</h4><p>先确定完整结构</p></div>
<div class="step"><div class="n">03</div><h4>What / Why / How</h4><p>理解每一个机制</p></div>
<div class="step"><div class="n">04</div><h4>Feynman Check</h4><p>用自己的话解释</p></div>
<div class="step"><div class="n">05</div><h4>Document</h4><p>记录修正与思考</p></div>
</div>
</section>

<section id="zh-map">
<h2><span class="num">03</span>我的学习地图</h2>
<p>每个模块不只是一个术语，而是一个值得回答的问题。已发布的模块可以直接打开全文。</p>
<div class="track">
<div class="track-head"><h3>Track A · Technology</h3><span>单次计算 → GPU → 服务大量用户 → 推理引擎 → Post-training</span></div>
<ol class="modules">
<li><a class="module is-live" href="/posts/ai-infra-from-zero-01"><span class="m-num">01</span><span class="m-body"><span class="m-title">LLM Fundamentals</span><span class="m-q">提示词进了 LLM 之后，发生了什么计算？</span><span class="m-tags">Parameters · Tokens · Forward Pass · Prefill · Decode · KV Cache</span></span><span class="m-cta">阅读 →</span></a></li>
<li><a class="module is-live" href="/posts/ai-infra-from-zero-02"><span class="m-num">02</span><span class="m-body"><span class="m-title">GPU &amp; Hardware</span><span class="m-q">GPU 这么强，为什么还会拖慢 LLM 推理？</span><span class="m-tags">GPU Memory · HBM · Compute · Bandwidth · Latency · Throughput</span></span><span class="m-cta">阅读 →</span></a></li>
<li><a class="module is-live" href="/posts/ai-infra-from-zero-03"><span class="m-num">03</span><span class="m-body"><span class="m-title">LLM Serving Systems</span><span class="m-q">一个模型怎么同时服务几千个用户？</span><span class="m-tags">Scheduling · Batching · Caching · Concurrency</span></span><span class="m-cta">阅读 →</span></a></li>
<li><a class="module is-live" href="/posts/ai-infra-from-zero-04"><span class="m-num">04</span><span class="m-body"><span class="m-title">SGLang &amp; Inference Optimization</span><span class="m-q">开源推理引擎在做哪些取舍？</span><span class="m-tags">Prefix Caching · Continuous Batching · PD Disaggregation</span></span><span class="m-cta">阅读 →</span></a></li>
<li><div class="module is-next"><span class="m-num">05</span><span class="m-body"><span class="m-title">Post-training &amp; Reinforcement Learning</span><span class="m-q">为什么改进 AI Agent 需要训练基础设施？</span><span class="m-tags">Post-training · RL · Rollouts · Rewards · Train–Serve Loop</span></span><span class="m-status">下一篇</span></div></li>
</ol>
</div>
<div class="track">
<div class="track-head"><h3>Track B · Product &amp; Business</h3><span>用户与价值 → 开发者问题 → 产品价值 → 采用 → 实际贡献</span></div>
<ol class="modules">
<li><a class="module is-live" href="/posts/ai-infra-product-lens"><span class="m-num">01</span><span class="m-body"><span class="m-title">AI 基础设施，什么时候值得用？</span><span class="m-q">谁需要 AI Infrastructure？一个团队为什么会采用它？</span><span class="m-tags">Users · Product Map · Value · Discovery · Adoption</span></span><span class="m-cta">阅读 →</span></a></li>
<li><div class="module is-next"><span class="m-num">02</span><span class="m-body"><span class="m-title">Developer Research &amp; Customer Discovery</span><span class="m-q">开发者实际会遇到哪些问题？</span><span class="m-tags">GitHub Issues · PRs · Docs · Slack · JTBD · User Evidence</span></span><span class="m-status">下一篇</span></div></li>
<li><div class="module is-next"><span class="m-num">03</span><span class="m-body"><span class="m-title">From Technical Capability to Product Value</span><span class="m-q">一项优化让谁受益？怎么验证它的价值？</span><span class="m-tags">Real Workloads · Trade-offs · Use Cases · Differentiation · Validation</span></span><span class="m-status">计划中</span></div></li>
<li><div class="module is-next"><span class="m-num">04</span><span class="m-body"><span class="m-title">Drive Adoption &amp; Build a Business</span><span class="m-q">产品怎么被采用？开源项目怎么变成一门生意？</span><span class="m-tags">DX · PMM · DevRel · GTM · Open-source Business · Monetization</span></span><span class="m-status">计划中</span></div></li>
<li><div class="module is-next"><span class="m-num">05</span><span class="m-body"><span class="m-title">Real-World Contribution</span><span class="m-q">我实际能做出什么有用的贡献？</span><span class="m-tags">Documentation PRs · Technical Explainers · Workshops · Growth Experiments</span></span><span class="m-status">计划中</span></div></li>
</ol>
</div>
</section>

<section id="zh-insights">
<h2><span class="num">04</span>目前学到了什么</h2>
<h3><span class="num">01</span>从单个 AI 用户到大规模推理系统</h3>
<p>过去，我更多是从普通使用者的角度理解 AI：输入请求，然后等待模型返回结果。</p>
<p>现在，我可以看到另一面。当大量请求同时进入系统时，问题就不只是模型能不能生成答案，还包括 <strong>GPU 显存如何共享、请求怎样调度、哪些计算可以复用，以及如何在成本、延迟和吞吐量之间取舍。</strong></p>
<figure class="fig"><div class="fighead"><span>Fig. 04A · Inference at scale</span><span>同一个模型，不同的系统问题</span></div>
<div class="scale-grid">
<div class="scale-card"><h4>一个请求</h4><div class="people"><i></i></div><div class="down"></div><div class="box">LLM Inference<span>一个输入 → 一个回答</span></div></div>
<div class="scale-card"><h4>大量并发请求</h4><div class="people"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="down"></div><div class="box emph">Scheduling · Batching · Caching<span>请求争抢共享资源</span></div><div class="down"></div><div class="box">GPU 显存与算力<span>平衡延迟、吞吐与成本</span></div></div>
</div>
<figcaption>两种情况下模型是同一个。规模变大之后，变化的是大量请求在争抢同一块 GPU 的显存和算力。</figcaption></figure>
<p class="more">继续读：<a href="/posts/ai-infra-from-zero-03">Note 03 · LLM 怎么同时服务几千个请求？</a></p>
<h3><span class="num">02</span>技术指标不是越高越好</h3>
<p>比如，更高的 Cache Hit Rate 并不一定意味着更低的 End-to-End Latency，更不一定意味着更好的 Developer Experience。</p>
<p>因为缓存要占用显存，请求也可能需要等待。<strong>某一项技术指标改善，并不保证整个系统或用户体验都会改善。</strong></p>
<p>所以在优化之前，我想先弄清楚真实的 Workload 和用户真正关心什么，再决定哪个指标值得优化，以及怎么衡量结果。</p>
<figure class="fig"><div class="fighead"><span>Fig. 04B · Optimization is a trade-off</span><span>一个指标上升 ≠ 所有结果变好</span></div>
<div class="metric-head">决策：保留更多可复用的 KV Cache</div>
<div class="metric-branches"><div class="metric-branch"><h4>Cache Reuse ↑</h4><p>可能减少重复 Prefill 的计算</p></div><div class="metric-branch warn"><h4>Memory Pressure ↑</h4><p>可能挤占其他请求所需的显存</p></div></div>
<div class="metric-join">↓</div>
<div class="metric-bottom">端到端延迟与开发者体验 = ?<span>取决于真实 Workload、资源争抢和调度方式</span></div>
<figcaption>这是概念性取舍示意，不是某个系统的实验结果；要判断优化是否成功，需要结合真实使用场景验证。</figcaption></figure>
<p class="more">继续读：<a href="/posts/ai-infra-from-zero-04">Note 04 · 推理引擎怎样才算真正有用？</a></p>
</section>

<section id="zh-reflection">
<h2><span class="num">05</span>反思与开放问题</h2>
<p>过去，我更关注消费级产品和普通用户的体验。</p>
<p>AI Infrastructure 让我接触到完全不同的用户：Developers、Infrastructure Teams、Enterprises，以及正在构建复杂 Agent 系统的人。</p>
<p>我很喜欢这个过程。它有点像探索一张地图。原本你只知道自己生活的那一小块区域，甚至很难想象地图之外还有什么。直到你开始往外走，才发现原来存在这么多不同的问题、技术和工作方式。</p>
<p>而且很有意思的是，学得越多，我越能意识到自己还有多少不了解。</p>
<p>接下来，我希望把技术理解和真实的 Developer Research 连接起来，而不是停留在理论层面。我最想探索的问题是：</p>
<ol class="questions"><li>开发者实际选择 AI Infrastructure 产品时，除了性能和成本，还会考虑什么？</li><li>我们如何判断某一项技术优化，是否真正改善了用户体验？</li><li>一个优秀的开源技术项目，需要什么才能发展成被广泛采用、可持续发展的产品？</li></ol>
<blockquote class="closing"><p>探索得越多，地图就越大。</p></blockquote>
</section>
</div>
</div>
</div>
</div>
