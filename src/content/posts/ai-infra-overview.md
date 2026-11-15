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
<section class="hero">
 <div>
  <div class="kicker">Self-Directed Learning · An Overview</div>
  <h1>Learning AI Infrastructure <em>Through Two Lenses</em><span class="sub-zh">An Overview of My AI Infrastructure Learning</span></h1>
  <p class="deck">From understanding how a technology runs to understanding why it exists, who needs it, and how it creates real value.</p>
  <div class="tagline"><span>TECHNOLOGY</span><span class="separator">×</span><span>PRODUCT</span><span class="separator">×</span><span>BUSINESS</span></div>
 </div>
 <div class="hero-art" aria-label="Two parallel learning paths leading toward product judgment">
  <svg viewBox="0 0 480 340" role="img" aria-label="Technology and product research pathways converge on product judgment">
  <defs><linearGradient id="herogr" x1="0" x2="1"><stop offset="0" stop-color="#d5e6e8"/><stop offset="1" stop-color="#dcebdc"/></linearGradient></defs>
  <circle cx="240" cy="170" r="139" fill="none" stroke="#dce8e1" stroke-dasharray="3 7"/><circle cx="240" cy="170" r="101" fill="none" stroke="#e2e9e0"/>
  <path d="M89 66 C99 95 118 118 160 144 S200 186 239 204" fill="none" stroke="#93b6c9" stroke-width="2.7" stroke-linecap="round"/>
  <path d="M391 66 C381 95 364 118 321 144 S280 186 241 204" fill="none" stroke="#8cb69e" stroke-width="2.7" stroke-linecap="round"/>
  <path d="M239 205 V257" stroke="#94b4a5" stroke-width="2.7" stroke-linecap="round"/>
  <rect x="30" y="24" width="158" height="71" rx="13" fill="#e7f0f8" stroke="#9fbdd2"/><text x="109" y="51" text-anchor="middle" font-size="14" font-weight="700" fill="#345773">TRACK A</text><text x="109" y="73" text-anchor="middle" font-size="12" fill="#52758d">Technology</text>
  <rect x="293" y="24" width="158" height="71" rx="13" fill="#e8f3eb" stroke="#a4cdb7"/><text x="372" y="51" text-anchor="middle" font-size="14" font-weight="700" fill="#386b56">TRACK B</text><text x="372" y="73" text-anchor="middle" font-size="12" fill="#527d6a">Users &amp; Business</text>
  <circle cx="175" cy="155" r="24" fill="#f5f9fc" stroke="#aec8d6"/><text x="175" y="160" text-anchor="middle" fill="#688eaa" font-size="21">⚙</text>
  <circle cx="305" cy="155" r="24" fill="#f4faf5" stroke="#abceb7"/><g stroke="#65977a" stroke-width="2" fill="none"><circle cx="305" cy="148" r="5"/><path d="M292 163 Q305 151 318 163"/></g>
  <circle cx="240" cy="204" r="7" fill="#77a68d" stroke="#fffefa" stroke-width="3"/>
  <rect x="106" y="258" width="268" height="58" rx="14" fill="url(#herogr)" stroke="#a8c9b9"/><text x="240" y="284" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="600" fill="#2f5849">Product Judgment</text><text x="240" y="301" text-anchor="middle" font-size="10.5" fill="#628676">Knowledge → Evidence → Value</text>
  </svg><span class="art-note">FIG. 00 · TWO LENSES, ONE JOURNEY</span>
 </div>
</section>
<div class="divider-wide"></div>
<div class="article-shell">
 <aside class="rail"><nav class="rail-inner" aria-label="Sections"><span class="rail-title">CONTENTS</span><a href="#why">01 · Why I Started</a><a href="#design">02 · How I Designed</a><a href="#map">03 · Learning Map</a><a href="#insights">04 · What I Learned</a><a href="#reflection">05 · Reflections</a></nav></aside>
 <div class="article-content">

 <section class="section" id="why">
  <div class="section-heading"><span class="section-num">01</span><h2>Why I Started</h2></div>
  <p class="intro">The reason was simple at first: I was interviewing with an AI infrastructure startup.</p>
  <p>I read through the company's website, its GitHub, and its public technical material. I also looked at the team's backgrounds and open roles on LinkedIn. It turned out to be a field that sits deep in the technical stack.</p>
  <p>Before anything else, I needed to understand the technical world it operates in. I also wanted to actually learn it: why these technologies exist, what problems they solve, and how they turn into real value.</p>
  <p>So I built my own learning roadmap from scratch.</p>
  <figure class="fig"><div class="fighead"><span>FIG. 01 · THE STARTING POINT</span><span class="fig-topic">An opportunity → A learning system</span></div>
   <div class="diagram">
    <div class="origin-grid">
      <div class="origin-card"><span class="icon-circle"><svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg></span><h3>Interview Opportunity</h3><p>AI Infrastructure Startup</p></div>
      <div class="arw">→</div>
      <div class="origin-card"><span class="icon-circle"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 5 5"/><path d="M8 11h6M11 8v6"/></svg></span><h3>Explore Public Sources</h3><p>Website · GitHub · LinkedIn · JDs</p></div>
      <div class="arw">→</div>
      <div class="origin-card"><span class="icon-circle"><svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v6M5.5 13H18.5M5.5 13v4M18.5 13v4"/></svg></span><h3>Build a Knowledge Tree</h3><p>Structure before details</p></div>
    </div><div class="mini-caption">Before learning the answers, I needed to understand the questions.</div>
   </div>
  </figure>
 </section>

 <section class="section" id="design">
  <div class="section-heading"><span class="section-num">02</span><h2>How I Designed My Learning</h2></div>
  <p class="intro">I split my learning into two tracks that complement each other.</p>
  <p><strong>Track A: Understand the Technology.</strong> The first track closes my most direct knowledge gap. I want to understand what problems engineers are solving and why they make the technical decisions they do.</p>
  <p><strong>Track B: Understand the Users &amp; Business.</strong> I enjoy technology. I also enjoy turning complex knowledge into something simple that other people can use. I've always been interested in user needs, user experience, and how products get adopted.</p>
  <p>But good technology doesn't guarantee a valuable product.</p>
  <p>As a user, I don't buy a product to admire the technology behind it. I buy it because it solves my problem, improves my experience, or creates some kind of value for me.</p>
  <p>How, then, do we close the gap between technical capability and user value? That question is why Track B exists.</p>
  <div class="highlight-line">Track A helps me understand what the technology can do. Track B helps me understand who needs it, why they need it, and how to get it used.</div>
  <figure class="fig"><div class="fighead"><span>FIG. 02 · TWO LENSES, ONE GOAL</span><span class="fig-topic">Technology × User value</span></div>
   <div class="diagram">
    <div class="track-pair">
      <div class="track-card"><div class="track-label">TRACK A · TECHNICAL LENS</div><h3>Understand<br/>How It Works</h3><p>How models, GPUs, and inference systems work, and the constraints and trade-offs behind engineering decisions.</p><ul><li>Model computation</li><li>GPU and systems</li><li>Serving and optimization</li></ul></div>
      <div class="track-card"><div class="track-label">TRACK B · PRODUCT LENS</div><h3>Understand<br/>Why It Matters</h3><p>Developers' real problems, user experience, product choices, and business value.</p><ul><li>User problems &amp; evidence</li><li>Product value &amp; experience</li><li>Adoption and business</li></ul></div>
    </div>
    <div class="bridge"><svg viewBox="0 0 500 60" aria-hidden="true"><path d="M120 0V20H250M380 0V20H250V55" fill="none" stroke="#a3c4b5" stroke-width="1.7"/><path d="m245 49 5 7 5-7" fill="none" stroke="#a3c4b5" stroke-width="1.7"/></svg></div>
    <div class="bridge-answer"><div class="bridge-title">Product Judgment</div><div class="bridge-small">Bridge the gap between technical capability and real user needs</div></div>
   </div><figcaption class="fig-caption">The two tracks aren't two separate course lists. They look at the same question from different angles: how does a technology create real value?</figcaption>
  </figure>
  <h3 style="font-size:20px;margin:41px 0 12px;font-family:'Noto Serif SC',serif;font-weight:600">How I Study</h3>
  <p>I start by using AI to collect and organize public material: project docs, GitHub, company websites, technical write-ups, and job postings. I add what I've seen of the team's backgrounds and use all of it to understand the basic structure of the field.</p>
  <p>Next, I ask the AI to build a knowledge tree. I check how the modules connect and revise the structure until it holds together. Only then do I go deep on each module, one at a time.</p>
  <p>For each topic, I start with the what, the why, and the how. Then I test my understanding against concrete scenarios and questions. I also write my misunderstandings, my corrections, and new ideas into these notes.</p>
  <div class="process-line" aria-label="My study method">
    <div class="process-node"><div class="count">01</div><h4>Explore Sources</h4><p>Public material and product information</p></div>
    <div class="process-node"><div class="count">02</div><h4>Build the Tree</h4><p>Settle the full structure first</p></div>
    <div class="process-node"><div class="count">03</div><h4>What / Why / How</h4><p>Understand each mechanism</p></div>
    <div class="process-node"><div class="count">04</div><h4>Feynman Check</h4><p>Explain it in my own words</p></div>
    <div class="process-node"><div class="count">05</div><h4>Document &amp; Reflect</h4><p>Record corrections and new ideas</p></div>
  </div>
 </section>

 <section class="section" id="map">
  <div class="section-heading"><span class="section-num">03</span><h2>My Learning Map</h2></div>
  <p class="intro">I wanted each module to be a question worth answering, not just a term. The map moves from a single computation to a full system, then from technical capability to user value.</p>
  <div class="map-section-figure"><div class="map-label"><h3>Track A <span style="font-style:italic;color:#7399b2">— Technology</span></h3><span>How systems work</span></div>
   <p>It starts with a single LLM computation, then moves to the resource limits of GPUs. From there it covers LLM serving for many users, inference engines, and post-training. That is the technology line. Turning an open-source project into a business sits in Track B, not here.</p>
   <div class="map-shell"><div class="map-scroll"><svg class="map-svg" role="img" aria-label="TRACK A · Understand the Technology" viewBox="0 0 1570 840" xmlns="http://www.w3.org/2000/svg">
<title>TRACK A · Understand the Technology</title>
<text x="44" y="51" font-size="31" font-weight="700" fill="#263846">TRACK A · Understand the Technology</text>
<text x="44" y="89" font-size="19" font-weight="400" fill="#687E89">One computation → GPUs → serving many users → inference engines → post-training</text>
<path d="M44 109 H1526" fill="none" stroke="#D9E1DB" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M312 562.5 H333 M333 261.0 V730.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 261.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 261.0 H646 M646 194.0 V328.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 194.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 328.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 529.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 529.0 H646 M646 462.0 V596.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 462.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 596.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 730.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 730.0 H646 M646 730.0 V730.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 730.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="42" y="494.5" width="270" height="136" rx="22" fill="#FFFEFB" stroke="#C7D4D1" stroke-width="2"/>
<text x="177.0" y="546.5" font-size="27" font-weight="700" fill="#263846" text-anchor="middle">AI Infrastructure</text>
<text x="177.0" y="576.5" font-size="18" font-weight="400" fill="#687E89" text-anchor="middle">Make models run,</text>
<text x="177.0" y="606.5" font-size="18" font-weight="400" fill="#687E89" text-anchor="middle">scale, and improve</text>
<rect x="354" y="203.0" width="260" height="116" rx="18" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.5"/>
<text x="484.0" y="254.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">One Computation</text>
<text x="484.0" y="285.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Model + hardware</text>
<rect x="354" y="471.0" width="260" height="116" rx="18" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.5"/>
<text x="484.0" y="522.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">Serving Many Users</text>
<text x="484.0" y="553.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Systems + engines</text>
<rect x="354" y="672.0" width="260" height="116" rx="18" fill="#EFEAF6" stroke="#C1B3D6" stroke-width="1.5"/>
<text x="484.0" y="723.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">Improving Models</text>
<text x="484.0" y="754.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Training loop</text>
<a href="/posts/ai-infra-from-zero-01" aria-label="Open note: How Does an LLM Actually Run?" class="svg-note-link">
<rect x="672" y="144" width="854" height="101" rx="17" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.4"/>
<rect x="672" y="144" width="6" height="101" rx="3" fill="#578B76"/>
<text x="695" y="175" font-size="23" font-weight="700" fill="#263846">01 · LLM Fundamentals</text>
<text x="695" y="205" font-size="19" font-weight="400" fill="#263846">What computation happens when a prompt enters an LLM?</text>
<text x="695" y="229" font-size="16" font-weight="400" fill="#687E89">Parameters · Tokens · Forward Pass · Prefill · Decode · KV Cache</text>
<text x="1496" y="177" font-size="26" font-weight="500" fill="#578B76" text-anchor="middle">↗</text>
</a>
<a href="/posts/ai-infra-from-zero-02" aria-label="Open note: Why Does the GPU Become the Bottleneck?" class="svg-note-link">
<rect x="672" y="278" width="854" height="101" rx="17" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.4"/>
<rect x="672" y="278" width="6" height="101" rx="3" fill="#557FA2"/>
<text x="695" y="309" font-size="23" font-weight="700" fill="#263846">02 · GPU &amp; Hardware</text>
<text x="695" y="339" font-size="19" font-weight="400" fill="#263846">Why can powerful GPUs still slow LLM inference down?</text>
<text x="695" y="363" font-size="16" font-weight="400" fill="#687E89">GPU Memory · HBM · Compute · Bandwidth · Latency · Throughput</text>
<text x="1496" y="311" font-size="26" font-weight="500" fill="#557FA2" text-anchor="middle">↗</text>
</a>
<a href="/posts/ai-infra-from-zero-03" class="svg-note-link" aria-label="Open note: How Does an LLM Serving System Work?">
<rect x="672" y="412" width="854" height="101" rx="17" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.4"/>
<rect x="672" y="412" width="6" height="101" rx="3" fill="#578B76"/>
<text x="695" y="443" font-size="23" font-weight="700" fill="#263846">03 · LLM Serving Systems</text>
<text x="695" y="473" font-size="19" font-weight="400" fill="#263846">How does one model serve thousands of users at once?</text>
<text x="695" y="497" font-size="16" font-weight="400" fill="#687E89">Scheduling · Batching · Caching · Concurrency · Engine</text>
<text x="1496" y="445" font-size="26" font-weight="500" fill="#578B76" text-anchor="middle">↗</text>
</a>
<a href="/posts/ai-infra-from-zero-04" class="svg-note-link" aria-label="Open note: What Makes an Inference Engine Actually Useful?">
<rect x="672" y="546" width="854" height="101" rx="17" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.4"/>
<rect x="672" y="546" width="6" height="101" rx="3" fill="#578B76"/>
<text x="695" y="577" font-size="23" font-weight="700" fill="#263846">04 · SGLang &amp; Inference Optimization</text>
<text x="695" y="607" font-size="19" font-weight="400" fill="#263846">What trade-offs do open-source inference engines make?</text>
<text x="695" y="631" font-size="16" font-weight="400" fill="#687E89">Prefix Caching · Continuous Batching · PD Disaggregation · SGLang</text>
<text x="1496" y="579" font-size="26" font-weight="500" fill="#578B76" text-anchor="middle">↗</text>
</a>
<rect x="672" y="680" width="854" height="101" rx="17" fill="#EFEAF6" stroke="#C1B3D6" stroke-width="1.4"/>
<rect x="672" y="680" width="6" height="101" rx="3" fill="#8A73A7"/>
<text x="695" y="711" font-size="23" font-weight="700" fill="#263846">05 · Post-training &amp; Reinforcement Learning</text>
<text x="695" y="741" font-size="19" font-weight="400" fill="#263846">Why does improving AI agents take training infrastructure?</text>
<text x="695" y="765" font-size="16" font-weight="400" fill="#687E89">Post-training · RL · Rollouts · Rewards · Train–Serve Loop</text>
</svg></div></div>
   <p class="map-note">Each question in the tree is that module's learning goal. Modules with a published note link straight to it. The rest show the learning question and key concepts.</p>
  </div>
  <div class="map-section-figure"><div class="map-label"><h3>Track B <span style="font-style:italic;color:#77a58c">— Product &amp; Business</span></h3><span>Why systems matter</span></div>
   <p>It starts with the market and real developer problems, then asks how a technical capability becomes product value. Adoption and building a business are one phase: developer experience, go-to-market, and how an open-source project gets used and paid for. It ends with work you can actually contribute.</p>
   <div class="map-shell"><div class="map-scroll"><svg class="map-svg" role="img" aria-label="TRACK B · Understand Users &amp; Business" viewBox="0 0 1570 890" xmlns="http://www.w3.org/2000/svg">
<title>TRACK B · Understand Users &amp; Business</title>
<text x="44" y="51" font-size="31" font-weight="700" fill="#263846">TRACK B · Understand Users &amp; Business</text>
<text x="44" y="89" font-size="19" font-weight="400" fill="#687E89">Landscape → developer problems → product value → adoption → contribution</text>
<path d="M44 109 H1526" fill="none" stroke="#D9E1DB" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M312 495.5 H333 M333 261.0 V730.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 261.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 261.0 H646 M646 194.0 V328.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 194.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 328.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 462.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 462.0 H646 M646 462.0 V462.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 462.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 596.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 596.0 H646 M646 596.0 V596.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 596.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 730.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 730.0 H646 M646 730.0 V730.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 730.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="42" y="427.5" width="270" height="136" rx="22" fill="#FFFEFB" stroke="#C7D4D1" stroke-width="2"/>
<text x="177.0" y="479.5" font-size="27" font-weight="700" fill="#263846" text-anchor="middle">Product &amp; Business</text>
<text x="177.0" y="509.5" font-size="18" font-weight="400" fill="#687E89" text-anchor="middle">Turn technical capability</text>
<text x="177.0" y="539.5" font-size="18" font-weight="400" fill="#687E89" text-anchor="middle">into real user value</text>
<rect x="354" y="203.0" width="260" height="116" rx="18" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.5"/>
<text x="484.0" y="254.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">Market &amp; Users</text>
<text x="484.0" y="285.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Landscape + evidence</text>
<rect x="354" y="404.0" width="260" height="116" rx="18" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.5"/>
<text x="484.0" y="455.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">Evaluate Value</text>
<text x="484.0" y="486.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Capability → outcome</text>
<rect x="354" y="538.0" width="260" height="116" rx="18" fill="#EFEAF6" stroke="#C1B3D6" stroke-width="1.5"/>
<text x="484.0" y="575.0" font-size="18" font-weight="700" fill="#263846" text-anchor="middle">Drive Adoption</text>
<text x="484.0" y="600.0" font-size="16" font-weight="700" fill="#263846" text-anchor="middle">&amp; Build a Business</text>
<text x="484.0" y="626.0" font-size="14" font-weight="400" fill="#687E89" text-anchor="middle">GTM · open source · revenue</text>
<rect x="354" y="672.0" width="260" height="116" rx="18" fill="#F8EBDD" stroke="#DFC2A3" stroke-width="1.5"/>
<text x="484.0" y="723.0" font-size="21" font-weight="700" fill="#263846" text-anchor="middle">Contribute in Practice</text>
<text x="484.0" y="754.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Evidence + execution</text>
<rect x="672" y="144" width="854" height="101" rx="17" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.4"/>
<rect x="672" y="144" width="6" height="101" rx="3" fill="#557FA2"/>
<text x="695" y="175" font-size="23" font-weight="700" fill="#263846">01 · Mapping the AI Infra Ecosystem</text>
<text x="695" y="205" font-size="19" font-weight="400" fill="#263846">Who builds, uses, and pays for AI infrastructure?</text>
<text x="695" y="229" font-size="16" font-weight="400" fill="#687E89">Value Chain · Model Providers · Managed Inference · Buyers · Business Models</text>
<rect x="672" y="278" width="854" height="101" rx="17" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.4"/>
<rect x="672" y="278" width="6" height="101" rx="3" fill="#557FA2"/>
<text x="695" y="309" font-size="23" font-weight="700" fill="#263846">02 · Developer Research &amp; Customer Discovery</text>
<text x="695" y="339" font-size="19" font-weight="400" fill="#263846">What problems do developers actually encounter?</text>
<text x="695" y="363" font-size="16" font-weight="400" fill="#687E89">GitHub Issues · PRs · Docs · Slack · JTBD · User Evidence</text>
<rect x="672" y="412" width="854" height="101" rx="17" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.4"/>
<rect x="672" y="412" width="6" height="101" rx="3" fill="#578B76"/>
<text x="695" y="443" font-size="23" font-weight="700" fill="#263846">03 · From Technical Capability to Product Value</text>
<text x="695" y="473" font-size="19" font-weight="400" fill="#263846">Who benefits from optimization, and how do we verify its value?</text>
<text x="695" y="497" font-size="16" font-weight="400" fill="#687E89">Real Workloads · Trade-offs · Use Cases · Differentiation · Validation</text>
<rect x="672" y="546" width="854" height="101" rx="17" fill="#EFEAF6" stroke="#C1B3D6" stroke-width="1.4"/>
<rect x="672" y="546" width="6" height="101" rx="3" fill="#8A73A7"/>
<text x="695" y="577" font-size="22" font-weight="700" fill="#263846">04 · Drive Adoption &amp; Build a Business</text>
<text x="695" y="607" font-size="19" font-weight="400" fill="#263846">How does a product get adopted, and how does an open-source project become a business?</text>
<text x="695" y="631" font-size="16" font-weight="400" fill="#687E89">DX · PMM · DevRel · GTM · Open-source business · Monetization</text>
<rect x="672" y="680" width="854" height="101" rx="17" fill="#F8EBDD" stroke="#DFC2A3" stroke-width="1.4"/>
<rect x="672" y="680" width="6" height="101" rx="3" fill="#AF815A"/>
<text x="695" y="711" font-size="23" font-weight="700" fill="#263846">05 · Real-World Contribution &amp; Portfolio</text>
<text x="695" y="741" font-size="19" font-weight="400" fill="#263846">What useful work can I actually contribute?</text>
<text x="695" y="765" font-size="16" font-weight="400" fill="#687E89">Documentation PRs · Technical Explainers · Workshops · Growth Experiments</text>
</svg></div></div>
   <p class="map-note">The tree starts from market and user evidence and moves step by step toward product judgment, developer adoption, and real contribution. Building a business lives in this track, next to adoption, not as a sixth technology module.</p>
  </div>
  <div class="highlight-line">Track A: Understand the technology. Track B: Understand the users, create value, and drive adoption.</div>
 </section>

 <section class="section" id="insights">
  <div class="section-heading"><span class="section-num">04</span><h2>What I've Learned So Far</h2></div>
  <div class="insight-heading"><span class="insight-count">01</span><h3>From One AI User to Inference at Scale</h3></div>
  <p>I used to understand AI mostly as an everyday user: send a request, then wait for the model's answer.</p>
  <p>Now I can see the other side. When many requests hit the system at once, the question isn't just whether the model can produce an answer. It's also how GPU resources get allocated, how requests get scheduled, which computation can be reused, and how to balance cost, latency, and throughput.</p>
  <p>For the first time, I started to understand what infrastructure it takes to run AI applications at scale.</p>
  <figure class="fig"><div class="fighead"><span>FIG. 04A · INFERENCE AT SCALE</span><span class="fig-topic">Same model, a different systems problem</span></div><div class="diagram">
   <div class="scale-grid">
     <div class="scale-card"><h4>One Request</h4><div class="person-row"><span class="person"></span></div><div class="downline"></div><div class="pipeline-box">LLM Inference<span>One input → one response</span></div><div class="gpu-tile">One user sees a <strong>model answer</strong></div></div>
     <div class="scale-card many"><h4>Many Concurrent Requests</h4><div class="person-row"><span class="person"></span><span class="person"></span><span class="person"></span><span class="person"></span><span class="person"></span><span class="person"></span></div><div class="downline"></div><div class="pipeline-box emph">Scheduling · Batching · Caching<span>Requests compete for shared resources</span></div><div class="downline"></div><div class="pipeline-box">GPU / Memory / Compute<span>Manage latency, throughput &amp; cost</span></div></div>
   </div>
  </div><figcaption class="fig-caption">Inference doesn't exist because of many users. What serving at scale changes is how concurrent requests share limited compute.</figcaption></figure>
  <div class="insight-heading"><span class="insight-count">02</span><h3>Higher Metrics Aren't Always Better</h3></div>
  <p>A higher cache hit rate, for example, doesn't necessarily mean lower end-to-end latency. It says even less about developer experience.</p>
  <p>Caching takes up resources, and requests may have to wait. Improving one technical metric doesn't guarantee that the whole system, or the user experience, gets better.</p>
  <p>Before optimizing anything, I should understand the real workload and what users actually care about. Only then can I decide which metrics to optimize and how to measure the result.</p>
  <figure class="fig"><div class="fighead"><span>FIG. 04B · OPTIMIZATION IS A TRADE-OFF</span><span class="fig-topic">One metric ↑ does not mean every outcome ↑</span></div><div class="diagram">
   <div class="metric-head">An Optimization Decision: Keep More Reusable KV Cache</div>
   <div class="metric-branches"><div class="metric-branch"><h4>Cache Reuse ↑</h4><p>May cut repeated prefill computation</p></div><div class="metric-branch warn"><h4>Memory Pressure ↑</h4><p>May take GPU memory that other requests need</p></div></div>
   <div class="metric-join">↓</div>
   <div class="metric-bottom">End-to-End Latency &amp; Developer Experience = ?<span>Depends on the real workload, resource contention, scheduling, and overall system behavior</span></div>
  </div><figcaption class="fig-caption">A conceptual sketch of the trade-off, not experimental results from any specific system. Whether an optimization works has to be checked against real usage.</figcaption></figure>
 </section>

 <section class="section" id="reflection">
  <div class="section-heading"><span class="section-num">05</span><h2>Reflections &amp; Open Questions</h2></div>
  <p>I used to focus on consumer products and the experience of everyday users.</p>
  <p>AI infrastructure introduced me to completely different perspectives: developers, infrastructure teams, enterprises, and people building complex agent systems.</p>
  <p>I've really enjoyed the process. It feels like exploring a map. At first you only know the small area where you live, and it's hard to picture what lies beyond it. Once you start walking outward, you find how many different problems, technologies, and ways of working are out there.</p>
  <p>And the more I learn, the more I see how much I still don't know.</p>
  <figure class="fig"><div class="fighead"><span>FIG. 05 · OPENING UP THE MAP</span><span class="fig-topic">An expanding view of the AI world</span></div><div class="reflection-art"><svg viewBox="0 0 840 350" role="img" aria-label="The familiar consumer AI world opens to a broader network of AI infrastructure, developers, enterprises and agent builders">
   <defs><radialGradient id="mapglow"><stop offset="0" stop-color="#d8e9df"/><stop offset="1" stop-color="#eef4eb"/></radialGradient><pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="1" fill="#b9cec2" opacity=".55"/></pattern></defs>
   <rect x="5" y="5" width="830" height="340" rx="18" fill="url(#dots)" opacity=".76"/>
   <path d="M170 170C258 95 319 94 424 163M170 170C271 247 315 255 427 179M424 163C513 78 618 70 700 104M427 179C532 196 622 234 699 253M424 163C553 139 615 143 717 172" fill="none" stroke="#aec7bd" stroke-width="2" stroke-dasharray="6 6"/>
   <circle cx="158" cy="170" r="98" fill="#eaf1e7" stroke="#b7d2c5" stroke-width="1.6"/><circle cx="158" cy="170" r="74" fill="#fffefa" stroke="#d9e4dc"/><text x="158" y="149" text-anchor="middle" font-size="13" letter-spacing="1" fill="#82a697">THE FAMILIAR</text><text x="158" y="176" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="#385f52">Consumer AI</text><text x="158" y="197" text-anchor="middle" font-size="12" fill="#79938a">individual users</text>
   <circle cx="433" cy="171" r="73" fill="url(#mapglow)" stroke="#b7d2c5" stroke-width="1.8"/><text x="433" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="21" fill="#335849">A Bigger</text><text x="433" y="189" text-anchor="middle" font-family="Georgia,serif" font-size="21" fill="#335849">Map</text>
   <g font-size="12" font-weight="700" fill="#496e62" text-anchor="middle"><rect x="612" y="49" width="172" height="52" rx="12" fill="#e4eff6" stroke="#bfd5df"/><text x="698" y="81">Developers</text><rect x="614" y="138" width="188" height="52" rx="12" fill="#e9f3eb" stroke="#c1d6c8"/><text x="708" y="169">Infrastructure Teams</text><rect x="616" y="228" width="166" height="52" rx="12" fill="#f2ebf7" stroke="#d6c5df"/><text x="699" y="260">Agent Builders</text><rect x="337" y="290" width="192" height="43" rx="11" fill="#faeddf" stroke="#e7d0b5"/><text x="433" y="316">Enterprises</text></g>
   <path d="M433 245V290" stroke="#b9c9be" stroke-width="2" stroke-dasharray="5 6"/><text x="292" y="44" font-family="Georgia,serif" font-size="18" font-style="italic" fill="#7f9d8e">A new world of questions</text>
  </svg></div><figcaption class="fig-caption">The consumer AI I knew is just one region on the map. Learning infrastructure showed me the larger world of technology and users behind it.</figcaption></figure>
  <p>Next, I want to connect what I understand about the technology to real developer research instead of keeping it theoretical.</p>
  <p><strong>The questions I most want to explore next:</strong></p>
  <ol class="questions"><li>When developers choose an AI infrastructure product, what do they weigh besides performance and cost?</li><li>How can we tell whether a technical optimization actually improves the user experience?</li><li>What does a strong open-source project need to become a widely adopted, sustainable product?</li></ol>
  <p>I hope this roadmap helps me understand a new industry. I also hope it helps me find the value I can create where technology, users, and business meet.</p>
  <div class="final-quote">The more I explore, the bigger the map becomes.</div><div class="final-quote-cn">Understand the technology · Get close to users · Create real value</div>
 </section>
 </div>
</div>
</div>
<div class="lang-zh">
<section class="hero">
 <div>
  <div class="kicker">Self-directed learning · An overview</div>
  <h1>Learning AI Infrastructure <em>Through Two Lenses</em><span class="sub-zh">AI Infrastructure 学习总览</span></h1>
  <p class="deck">从理解一项技术如何运行，到理解它为什么存在、谁需要它，以及如何真正创造价值。</p>
  <div class="tagline"><span>TECHNOLOGY</span><span class="separator">×</span><span>PRODUCT</span><span class="separator">×</span><span>BUSINESS</span></div>
 </div>
 <div class="hero-art" aria-label="Two parallel learning paths leading toward product judgment">
  <svg viewBox="0 0 480 340" role="img" aria-label="Technology and product research pathways converge on product judgment">
  <defs><linearGradient id="herogr" x1="0" x2="1"><stop offset="0" stop-color="#d5e6e8"/><stop offset="1" stop-color="#dcebdc"/></linearGradient></defs>
  <circle cx="240" cy="170" r="139" fill="none" stroke="#dce8e1" stroke-dasharray="3 7"/><circle cx="240" cy="170" r="101" fill="none" stroke="#e2e9e0"/>
  <path d="M89 66 C99 95 118 118 160 144 S200 186 239 204" fill="none" stroke="#93b6c9" stroke-width="2.7" stroke-linecap="round"/>
  <path d="M391 66 C381 95 364 118 321 144 S280 186 241 204" fill="none" stroke="#8cb69e" stroke-width="2.7" stroke-linecap="round"/>
  <path d="M239 205 V257" stroke="#94b4a5" stroke-width="2.7" stroke-linecap="round"/>
  <rect x="30" y="24" width="158" height="71" rx="13" fill="#e7f0f8" stroke="#9fbdd2"/><text x="109" y="51" text-anchor="middle" font-size="14" font-weight="700" fill="#345773">TRACK A</text><text x="109" y="73" text-anchor="middle" font-size="12" fill="#52758d">Technology</text>
  <rect x="293" y="24" width="158" height="71" rx="13" fill="#e8f3eb" stroke="#a4cdb7"/><text x="372" y="51" text-anchor="middle" font-size="14" font-weight="700" fill="#386b56">TRACK B</text><text x="372" y="73" text-anchor="middle" font-size="12" fill="#527d6a">Users &amp; Business</text>
  <circle cx="175" cy="155" r="24" fill="#f5f9fc" stroke="#aec8d6"/><text x="175" y="160" text-anchor="middle" fill="#688eaa" font-size="21">⚙</text>
  <circle cx="305" cy="155" r="24" fill="#f4faf5" stroke="#abceb7"/><g stroke="#65977a" stroke-width="2" fill="none"><circle cx="305" cy="148" r="5"/><path d="M292 163 Q305 151 318 163"/></g>
  <circle cx="240" cy="204" r="7" fill="#77a68d" stroke="#fffefa" stroke-width="3"/>
  <rect x="106" y="258" width="268" height="58" rx="14" fill="url(#herogr)" stroke="#a8c9b9"/><text x="240" y="284" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="600" fill="#2f5849">Product Judgment</text><text x="240" y="301" text-anchor="middle" font-size="10.5" fill="#628676">Knowledge → Evidence → Value</text>
  </svg><span class="art-note">FIG. 00 · TWO LENSES, ONE JOURNEY</span>
 </div>
</section>
<div class="divider-wide"></div>
<div class="article-shell">
 <aside class="rail"><nav class="rail-inner" aria-label="Sections"><span class="rail-title">CONTENTS</span><a href="#why">01 · Why I Started</a><a href="#design">02 · How I Designed</a><a href="#map">03 · Learning Map</a><a href="#insights">04 · What I Learned</a><a href="#reflection">05 · Reflections</a></nav></aside>
 <div class="article-content">

 <section class="section" id="why">
  <div class="section-heading"><span class="section-num">01</span><h2>Why I Started</h2></div>
  <p class="intro">最初的原因其实很简单：我在面试一家 AI Infrastructure Startup。</p>
  <p>我开始浏览公司的官网、GitHub、公开技术资料，也去 LinkedIn 看团队的背景和招聘岗位。这个领域其实深入技术底层。</p>
  <p>那么我首先需要理解它所处的技术世界。而且我希望真正可以学习到，能够理解这些技术为什么存在、解决什么问题，以及它们如何转化成实际价值。</p>
  <p>于是，我从零做了一套自己的 Learning Roadmap。</p>
  <figure class="fig"><div class="fighead"><span>FIG. 01 · THE STARTING POINT</span><span class="fig-topic">An opportunity → A learning system</span></div>
   <div class="diagram">
    <div class="origin-grid">
      <div class="origin-card"><span class="icon-circle"><svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg></span><h3>Interview Opportunity</h3><p>AI Infrastructure Startup</p></div>
      <div class="arw">→</div>
      <div class="origin-card"><span class="icon-circle"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 5 5"/><path d="M8 11h6M11 8v6"/></svg></span><h3>Explore Public Sources</h3><p>Website · GitHub · LinkedIn · JDs</p></div>
      <div class="arw">→</div>
      <div class="origin-card"><span class="icon-circle"><svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v6M5.5 13H18.5M5.5 13v4M18.5 13v4"/></svg></span><h3>Build a Knowledge Tree</h3><p>Structure before details</p></div>
    </div><div class="mini-caption">Before learning the answers, I needed to understand the questions.</div>
   </div>
  </figure>
 </section>

 <section class="section" id="design">
  <div class="section-heading"><span class="section-num">02</span><h2>How I Designed My Learning</h2></div>
  <p class="intro">我把整个学习过程分成了两条相互补充的路线。</p>
  <p><strong>Track A — Understand the Technology.</strong> 第一条路线解决的是我最直接的知识缺口。我的目标是希望理解工程师在解决什么问题，以及这些技术决策背后的原因。</p>
  <p><strong>Track B — Understand the Users &amp; Business.</strong> 我喜欢技术，也喜欢把复杂的知识转化成简单易懂、别人能够使用的东西。我一直对用户需求、用户体验和产品如何被采用很感兴趣。</p>
  <p>但技术做得好，不代表产品一定有价值。</p>
  <p>从用户的角度来说，我购买一个产品，不是为了欣赏它背后有多先进的技术，而是因为它能够解决我的问题、改善我的体验，或者为我创造某种价值。</p>
  <p>那么，技术能力和用户价值之间的 Gap，究竟应该如何弥合？这就是 Track B 存在的原因。</p>
  <div class="highlight-line">Track A 帮助我理解技术能做什么；Track B 帮助我理解谁需要它、为什么需要，以及如何让它真正被使用。</div>
  <figure class="fig"><div class="fighead"><span>FIG. 02 · TWO LENSES, ONE GOAL</span><span class="fig-topic">Technology × User value</span></div>
   <div class="diagram">
    <div class="track-pair">
      <div class="track-card"><div class="track-label">TRACK A · TECHNICAL LENS</div><h3>Understand<br/>How It Works</h3><p>理解模型、GPU 与推理系统的运行机制，理解工程决策背后的约束和取舍。</p><ul><li>Model computation</li><li>GPU and systems</li><li>Serving and optimization</li></ul></div>
      <div class="track-card"><div class="track-label">TRACK B · PRODUCT LENS</div><h3>Understand<br/>Why It Matters</h3><p>理解开发者的真实问题、用户体验、产品选择与商业价值。</p><ul><li>User problems &amp; evidence</li><li>Product value &amp; experience</li><li>Adoption and business</li></ul></div>
    </div>
    <div class="bridge"><svg viewBox="0 0 500 60" aria-hidden="true"><path d="M120 0V20H250M380 0V20H250V55" fill="none" stroke="#a3c4b5" stroke-width="1.7"/><path d="m245 49 5 7 5-7" fill="none" stroke="#a3c4b5" stroke-width="1.7"/></svg></div>
    <div class="bridge-answer"><div class="bridge-title">Product Judgment</div><div class="bridge-small">Bridge the gap between technical capability and real user needs</div></div>
   </div><figcaption class="fig-caption">两条路线不是两个独立的课程清单，而是从不同角度理解同一个问题：一项技术怎样才能创造真实价值？</figcaption>
  </figure>
  <h3 style="font-size:20px;margin:41px 0 12px;font-family:'Noto Serif SC',serif;font-weight:600">我是怎么学习的？</h3>
  <p>我先用 AI 帮助收集和组织公开资料，包括项目文档、GitHub、官网、相关技术介绍和招聘信息，再结合自己观察到的团队背景，理解这个领域的基本结构。</p>
  <p>我会先要求它建立一棵 Knowledge Tree，检查各个模块之间的逻辑关系，反复调整，直到我认为整个结构合理，再逐个深入。</p>
  <p>学习过程中，我会先理解 What、Why 和 How，再通过具体场景和提问检验自己的理解。我也会把自己的误解、修正过程和新的思考整理进这些笔记。</p>
  <div class="process-line" aria-label="My study method">
    <div class="process-node"><div class="count">01</div><h4>Explore Sources</h4><p>公开资料与产品信息</p></div>
    <div class="process-node"><div class="count">02</div><h4>Build the Tree</h4><p>先确定完整结构</p></div>
    <div class="process-node"><div class="count">03</div><h4>What / Why / How</h4><p>理解每一个机制</p></div>
    <div class="process-node"><div class="count">04</div><h4>Feynman Check</h4><p>用自己的话解释</p></div>
    <div class="process-node"><div class="count">05</div><h4>Document &amp; Reflect</h4><p>记录修正与思考</p></div>
  </div>
 </section>

 <section class="section" id="map">
  <div class="section-heading"><span class="section-num">03</span><h2>My Learning Map</h2></div>
  <p class="intro">我想让每个 Module 不只是一个术语，而是一个值得回答的问题。从微观计算到完整系统，再从技术能力走向用户价值。</p>
  <div class="map-section-figure"><div class="map-label"><h3>Track A <span style="font-style:italic;color:#7399b2">— Technology</span></h3><span>How systems work</span></div>
   <p>从单次 LLM 计算开始，逐渐理解 GPU 的资源限制，再进入多用户环境下的 LLM Serving、推理引擎和 Post-training。技术线到这里就完整了。开源项目怎么变成一门生意，放在 Track B，不放在这里。</p>
   <div class="map-shell"><div class="map-scroll"><svg class="map-svg" role="img" aria-label="TRACK A · Understand the Technology" viewBox="0 0 1570 840" xmlns="http://www.w3.org/2000/svg">
<title>TRACK A · Understand the Technology</title>
<text x="44" y="51" font-size="31" font-weight="700" fill="#263846">TRACK A · Understand the Technology</text>
<text x="44" y="89" font-size="19" font-weight="400" fill="#687E89">One computation → GPUs → serving many users → inference engines → post-training</text>
<path d="M44 109 H1526" fill="none" stroke="#D9E1DB" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M312 562.5 H333 M333 261.0 V730.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 261.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 261.0 H646 M646 194.0 V328.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 194.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 328.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 529.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 529.0 H646 M646 462.0 V596.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 462.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 596.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 730.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 730.0 H646 M646 730.0 V730.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 730.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="42" y="494.5" width="270" height="136" rx="22" fill="#FFFEFB" stroke="#C7D4D1" stroke-width="2"/>
<text x="177.0" y="546.5" font-size="27" font-weight="700" fill="#263846" text-anchor="middle">AI Infrastructure</text>
<text x="177.0" y="576.5" font-size="18" font-weight="400" fill="#687E89" text-anchor="middle">Make models run,</text>
<text x="177.0" y="606.5" font-size="18" font-weight="400" fill="#687E89" text-anchor="middle">scale, and improve</text>
<rect x="354" y="203.0" width="260" height="116" rx="18" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.5"/>
<text x="484.0" y="254.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">One Computation</text>
<text x="484.0" y="285.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Model + hardware</text>
<rect x="354" y="471.0" width="260" height="116" rx="18" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.5"/>
<text x="484.0" y="522.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">Serving Many Users</text>
<text x="484.0" y="553.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Systems + engines</text>
<rect x="354" y="672.0" width="260" height="116" rx="18" fill="#EFEAF6" stroke="#C1B3D6" stroke-width="1.5"/>
<text x="484.0" y="723.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">Improving Models</text>
<text x="484.0" y="754.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Training loop</text>
<a href="/posts/ai-infra-from-zero-01" aria-label="Open note: How Does an LLM Actually Run?" class="svg-note-link">
<rect x="672" y="144" width="854" height="101" rx="17" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.4"/>
<rect x="672" y="144" width="6" height="101" rx="3" fill="#578B76"/>
<text x="695" y="175" font-size="23" font-weight="700" fill="#263846">01 · LLM Fundamentals</text>
<text x="695" y="205" font-size="19" font-weight="400" fill="#263846">What computation happens when a prompt enters an LLM?</text>
<text x="695" y="229" font-size="16" font-weight="400" fill="#687E89">Parameters · Tokens · Forward Pass · Prefill · Decode · KV Cache</text>
<text x="1496" y="177" font-size="26" font-weight="500" fill="#578B76" text-anchor="middle">↗</text>
</a>
<a href="/posts/ai-infra-from-zero-02" aria-label="Open note: Why Does the GPU Become the Bottleneck?" class="svg-note-link">
<rect x="672" y="278" width="854" height="101" rx="17" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.4"/>
<rect x="672" y="278" width="6" height="101" rx="3" fill="#557FA2"/>
<text x="695" y="309" font-size="23" font-weight="700" fill="#263846">02 · GPU &amp; Hardware</text>
<text x="695" y="339" font-size="19" font-weight="400" fill="#263846">Why can powerful GPUs still slow LLM inference down?</text>
<text x="695" y="363" font-size="16" font-weight="400" fill="#687E89">GPU Memory · HBM · Compute · Bandwidth · Latency · Throughput</text>
<text x="1496" y="311" font-size="26" font-weight="500" fill="#557FA2" text-anchor="middle">↗</text>
</a>
<a href="/posts/ai-infra-from-zero-03" class="svg-note-link" aria-label="Open note: How Does an LLM Serving System Work?">
<rect x="672" y="412" width="854" height="101" rx="17" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.4"/>
<rect x="672" y="412" width="6" height="101" rx="3" fill="#578B76"/>
<text x="695" y="443" font-size="23" font-weight="700" fill="#263846">03 · LLM Serving Systems</text>
<text x="695" y="473" font-size="19" font-weight="400" fill="#263846">How does one model serve thousands of users at once?</text>
<text x="695" y="497" font-size="16" font-weight="400" fill="#687E89">Scheduling · Batching · Caching · Concurrency · Engine</text>
<text x="1496" y="445" font-size="26" font-weight="500" fill="#578B76" text-anchor="middle">↗</text>
</a>
<a href="/posts/ai-infra-from-zero-04" class="svg-note-link" aria-label="Open note: What Makes an Inference Engine Actually Useful?">
<rect x="672" y="546" width="854" height="101" rx="17" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.4"/>
<rect x="672" y="546" width="6" height="101" rx="3" fill="#578B76"/>
<text x="695" y="577" font-size="23" font-weight="700" fill="#263846">04 · SGLang &amp; Inference Optimization</text>
<text x="695" y="607" font-size="19" font-weight="400" fill="#263846">What trade-offs do open-source inference engines make?</text>
<text x="695" y="631" font-size="16" font-weight="400" fill="#687E89">Prefix Caching · Continuous Batching · PD Disaggregation · SGLang</text>
<text x="1496" y="579" font-size="26" font-weight="500" fill="#578B76" text-anchor="middle">↗</text>
</a>
<rect x="672" y="680" width="854" height="101" rx="17" fill="#EFEAF6" stroke="#C1B3D6" stroke-width="1.4"/>
<rect x="672" y="680" width="6" height="101" rx="3" fill="#8A73A7"/>
<text x="695" y="711" font-size="23" font-weight="700" fill="#263846">05 · Post-training &amp; Reinforcement Learning</text>
<text x="695" y="741" font-size="19" font-weight="400" fill="#263846">Why does improving AI agents take training infrastructure?</text>
<text x="695" y="765" font-size="16" font-weight="400" fill="#687E89">Post-training · RL · Rollouts · Rewards · Train–Serve Loop</text>
</svg></div></div>
   <p class="map-note">树中的问题是每个模块的学习目标。已提供原文地址的模块标题可直接打开对应笔记；其他模块保留学习问题与知识点。</p>
  </div>
  <div class="map-section-figure"><div class="map-label"><h3>Track B <span style="font-style:italic;color:#77a58c">— Product &amp; Business</span></h3><span>Why systems matter</span></div>
   <p>从市场和真实的开发者问题开始，再看一项技术能力怎么变成产品价值。采用和做成一门生意是同一个阶段：开发者体验、GTM，以及开源项目怎么被用起来、怎么收费。最后落到你真正能做出来的贡献。</p>
   <div class="map-shell"><div class="map-scroll"><svg class="map-svg" role="img" aria-label="TRACK B · Understand Users &amp; Business" viewBox="0 0 1570 890" xmlns="http://www.w3.org/2000/svg">
<title>TRACK B · Understand Users &amp; Business</title>
<text x="44" y="51" font-size="31" font-weight="700" fill="#263846">TRACK B · Understand Users &amp; Business</text>
<text x="44" y="89" font-size="19" font-weight="400" fill="#687E89">Landscape → developer problems → product value → adoption → contribution</text>
<path d="M44 109 H1526" fill="none" stroke="#D9E1DB" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M312 495.5 H333 M333 261.0 V730.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 261.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 261.0 H646 M646 194.0 V328.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 194.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 328.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 462.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 462.0 H646 M646 462.0 V462.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 462.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 596.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 596.0 H646 M646 596.0 V596.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 596.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M333 730.0 H354" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M614 730.0 H646 M646 730.0 V730.0" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M646 730.0 H672" fill="none" stroke="#AAB9BD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="42" y="427.5" width="270" height="136" rx="22" fill="#FFFEFB" stroke="#C7D4D1" stroke-width="2"/>
<text x="177.0" y="479.5" font-size="27" font-weight="700" fill="#263846" text-anchor="middle">Product &amp; Business</text>
<text x="177.0" y="509.5" font-size="18" font-weight="400" fill="#687E89" text-anchor="middle">Turn technical capability</text>
<text x="177.0" y="539.5" font-size="18" font-weight="400" fill="#687E89" text-anchor="middle">into real user value</text>
<rect x="354" y="203.0" width="260" height="116" rx="18" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.5"/>
<text x="484.0" y="254.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">Market &amp; Users</text>
<text x="484.0" y="285.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Landscape + evidence</text>
<rect x="354" y="404.0" width="260" height="116" rx="18" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.5"/>
<text x="484.0" y="455.0" font-size="23" font-weight="700" fill="#263846" text-anchor="middle">Evaluate Value</text>
<text x="484.0" y="486.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Capability → outcome</text>
<rect x="354" y="538.0" width="260" height="116" rx="18" fill="#EFEAF6" stroke="#C1B3D6" stroke-width="1.5"/>
<text x="484.0" y="575.0" font-size="18" font-weight="700" fill="#263846" text-anchor="middle">Drive Adoption</text>
<text x="484.0" y="600.0" font-size="16" font-weight="700" fill="#263846" text-anchor="middle">&amp; Build a Business</text>
<text x="484.0" y="626.0" font-size="14" font-weight="400" fill="#687E89" text-anchor="middle">GTM · open source · revenue</text>
<rect x="354" y="672.0" width="260" height="116" rx="18" fill="#F8EBDD" stroke="#DFC2A3" stroke-width="1.5"/>
<text x="484.0" y="723.0" font-size="21" font-weight="700" fill="#263846" text-anchor="middle">Contribute in Practice</text>
<text x="484.0" y="754.0" font-size="17" font-weight="400" fill="#687E89" text-anchor="middle">Evidence + execution</text>
<rect x="672" y="144" width="854" height="101" rx="17" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.4"/>
<rect x="672" y="144" width="6" height="101" rx="3" fill="#557FA2"/>
<text x="695" y="175" font-size="23" font-weight="700" fill="#263846">01 · Mapping the AI Infra Ecosystem</text>
<text x="695" y="205" font-size="19" font-weight="400" fill="#263846">Who builds, uses, and pays for AI infrastructure?</text>
<text x="695" y="229" font-size="16" font-weight="400" fill="#687E89">Value Chain · Model Providers · Managed Inference · Buyers · Business Models</text>
<rect x="672" y="278" width="854" height="101" rx="17" fill="#E8F0F7" stroke="#9AB8CE" stroke-width="1.4"/>
<rect x="672" y="278" width="6" height="101" rx="3" fill="#557FA2"/>
<text x="695" y="309" font-size="23" font-weight="700" fill="#263846">02 · Developer Research &amp; Customer Discovery</text>
<text x="695" y="339" font-size="19" font-weight="400" fill="#263846">What problems do developers actually encounter?</text>
<text x="695" y="363" font-size="16" font-weight="400" fill="#687E89">GitHub Issues · PRs · Docs · Slack · JTBD · User Evidence</text>
<rect x="672" y="412" width="854" height="101" rx="17" fill="#E5F2EB" stroke="#9AC7B3" stroke-width="1.4"/>
<rect x="672" y="412" width="6" height="101" rx="3" fill="#578B76"/>
<text x="695" y="443" font-size="23" font-weight="700" fill="#263846">03 · From Technical Capability to Product Value</text>
<text x="695" y="473" font-size="19" font-weight="400" fill="#263846">Who benefits from optimization, and how do we verify its value?</text>
<text x="695" y="497" font-size="16" font-weight="400" fill="#687E89">Real Workloads · Trade-offs · Use Cases · Differentiation · Validation</text>
<rect x="672" y="546" width="854" height="101" rx="17" fill="#EFEAF6" stroke="#C1B3D6" stroke-width="1.4"/>
<rect x="672" y="546" width="6" height="101" rx="3" fill="#8A73A7"/>
<text x="695" y="577" font-size="22" font-weight="700" fill="#263846">04 · Drive Adoption &amp; Build a Business</text>
<text x="695" y="607" font-size="19" font-weight="400" fill="#263846">How does a product get adopted, and how does an open-source project become a business?</text>
<text x="695" y="631" font-size="16" font-weight="400" fill="#687E89">DX · PMM · DevRel · GTM · Open-source business · Monetization</text>
<rect x="672" y="680" width="854" height="101" rx="17" fill="#F8EBDD" stroke="#DFC2A3" stroke-width="1.4"/>
<rect x="672" y="680" width="6" height="101" rx="3" fill="#AF815A"/>
<text x="695" y="711" font-size="23" font-weight="700" fill="#263846">05 · Real-World Contribution &amp; Portfolio</text>
<text x="695" y="741" font-size="19" font-weight="400" fill="#263846">What useful work can I actually contribute?</text>
<text x="695" y="765" font-size="16" font-weight="400" fill="#687E89">Documentation PRs · Technical Explainers · Workshops · Growth Experiments</text>
</svg></div></div>
   <p class="map-note">从市场与用户证据出发，逐层走向产品判断、开发者采用和实际贡献。做成一门生意放在这条线里，跟采用放在一起，不再单列成技术线的第六块。</p>
  </div>
  <div class="highlight-line">Track A：把技术搞懂。Track B：理解用户，做出价值，并让人真正用起来。</div>
 </section>

 <section class="section" id="insights">
  <div class="section-heading"><span class="section-num">04</span><h2>What I've Learned So Far</h2></div>
  <div class="insight-heading"><span class="insight-count">01</span><h3>从单个 AI 用户到大规模推理系统</h3></div>
  <p>过去，我更多是从普通使用者的角度理解 AI：输入请求，然后等待模型返回结果。</p>
  <p>现在，我可以看到另一面。当大量请求同时进入系统时，问题就不只是模型能不能生成答案，还包括 GPU 资源如何分配、请求怎样调度、哪些计算可以复用，以及如何在成本、延迟和吞吐量之间取舍。</p>
  <p>这让我第一次去理解支撑 AI 应用规模化运行需要怎样的基础设施。</p>
  <figure class="fig"><div class="fighead"><span>FIG. 04A · INFERENCE AT SCALE</span><span class="fig-topic">Same model, a different systems problem</span></div><div class="diagram">
   <div class="scale-grid">
     <div class="scale-card"><h4>One Request</h4><div class="person-row"><span class="person"></span></div><div class="downline"></div><div class="pipeline-box">LLM Inference<span>One input → one response</span></div><div class="gpu-tile">One user sees a <strong>model answer</strong></div></div>
     <div class="scale-card many"><h4>Many Concurrent Requests</h4><div class="person-row"><span class="person"></span><span class="person"></span><span class="person"></span><span class="person"></span><span class="person"></span><span class="person"></span></div><div class="downline"></div><div class="pipeline-box emph">Scheduling · Batching · Caching<span>Requests compete for shared resources</span></div><div class="downline"></div><div class="pipeline-box">GPU / Memory / Compute<span>Manage latency, throughput &amp; cost</span></div></div>
   </div>
  </div><figcaption class="fig-caption">Inference 本身不是因多用户而出现；大规模服务改变的是如何协调并发请求与有限计算资源。</figcaption></figure>
  <div class="insight-heading"><span class="insight-count">02</span><h3>技术指标不是越高越好</h3></div>
  <p>比如，更高的 Cache Hit Rate 并不一定意味着更低的 End-to-End Latency，更不一定意味着更好的 Developer Experience。</p>
  <p>因为缓存需要占据资源，请求也可能需要等待。某一项技术指标改善，并不保证整个系统或用户体验都会改善。</p>
  <p>所以，在优化之前，应该先理解真实的 Workload，明确用户真正关心什么，再决定要优化哪些指标，以及如何衡量结果。</p>
  <figure class="fig"><div class="fighead"><span>FIG. 04B · OPTIMIZATION IS A TRADE-OFF</span><span class="fig-topic">One metric ↑ does not mean every outcome ↑</span></div><div class="diagram">
   <div class="metric-head">An Optimization Decision: Keep More Reusable KV Cache</div>
   <div class="metric-branches"><div class="metric-branch"><h4>Cache Reuse ↑</h4><p>可能减少重复 Prefill 的计算</p></div><div class="metric-branch warn"><h4>Memory Pressure ↑</h4><p>可能挤占其他请求所需的显存</p></div></div>
   <div class="metric-join">↓</div>
   <div class="metric-bottom">End-to-End Latency &amp; Developer Experience = ?<span>取决于真实 Workload、资源竞争、调度以及整体系统行为</span></div>
  </div><figcaption class="fig-caption">这是概念性取舍示意，不是某个系统的实验结果；要判断优化是否成功，需要结合真实使用场景验证。</figcaption></figure>
 </section>

 <section class="section" id="reflection">
  <div class="section-heading"><span class="section-num">05</span><h2>Reflections &amp; Open Questions</h2></div>
  <p>过去，我更关注消费级产品和普通用户的体验。</p>
  <p>AI Infrastructure 让我开始接触完全不同的视角：Developers、Infrastructure Teams、Enterprises，以及正在构建复杂 Agent 系统的人。</p>
  <p>我很喜欢这个过程。它有点像探索一张地图。原本你只知道自己生活的那一小块区域，甚至很难想象地图之外还有什么。直到你开始往外走，才发现原来存在这么多不同的问题、技术和工作方式。</p>
  <p>而且很有意思的是，学得越多，我越能意识到自己还有多少不了解。</p>
  <figure class="fig"><div class="fighead"><span>FIG. 05 · OPENING UP THE MAP</span><span class="fig-topic">An expanding view of the AI world</span></div><div class="reflection-art"><svg viewBox="0 0 840 350" role="img" aria-label="The familiar consumer AI world opens to a broader network of AI infrastructure, developers, enterprises and agent builders">
   <defs><radialGradient id="mapglow"><stop offset="0" stop-color="#d8e9df"/><stop offset="1" stop-color="#eef4eb"/></radialGradient><pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="1" fill="#b9cec2" opacity=".55"/></pattern></defs>
   <rect x="5" y="5" width="830" height="340" rx="18" fill="url(#dots)" opacity=".76"/>
   <path d="M170 170C258 95 319 94 424 163M170 170C271 247 315 255 427 179M424 163C513 78 618 70 700 104M427 179C532 196 622 234 699 253M424 163C553 139 615 143 717 172" fill="none" stroke="#aec7bd" stroke-width="2" stroke-dasharray="6 6"/>
   <circle cx="158" cy="170" r="98" fill="#eaf1e7" stroke="#b7d2c5" stroke-width="1.6"/><circle cx="158" cy="170" r="74" fill="#fffefa" stroke="#d9e4dc"/><text x="158" y="149" text-anchor="middle" font-size="13" letter-spacing="1" fill="#82a697">THE FAMILIAR</text><text x="158" y="176" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="#385f52">Consumer AI</text><text x="158" y="197" text-anchor="middle" font-size="12" fill="#79938a">individual users</text>
   <circle cx="433" cy="171" r="73" fill="url(#mapglow)" stroke="#b7d2c5" stroke-width="1.8"/><text x="433" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="21" fill="#335849">A Bigger</text><text x="433" y="189" text-anchor="middle" font-family="Georgia,serif" font-size="21" fill="#335849">Map</text>
   <g font-size="12" font-weight="700" fill="#496e62" text-anchor="middle"><rect x="612" y="49" width="172" height="52" rx="12" fill="#e4eff6" stroke="#bfd5df"/><text x="698" y="81">Developers</text><rect x="614" y="138" width="188" height="52" rx="12" fill="#e9f3eb" stroke="#c1d6c8"/><text x="708" y="169">Infrastructure Teams</text><rect x="616" y="228" width="166" height="52" rx="12" fill="#f2ebf7" stroke="#d6c5df"/><text x="699" y="260">Agent Builders</text><rect x="337" y="290" width="192" height="43" rx="11" fill="#faeddf" stroke="#e7d0b5"/><text x="433" y="316">Enterprises</text></g>
   <path d="M433 245V290" stroke="#b9c9be" stroke-width="2" stroke-dasharray="5 6"/><text x="292" y="44" font-family="Georgia,serif" font-size="18" font-style="italic" fill="#7f9d8e">A new world of questions</text>
  </svg></div><figcaption class="fig-caption">原来熟悉的 Consumer AI 只是地图上的一片区域；学习 Infrastructure，让我看见背后更大的技术与用户世界。</figcaption></figure>
  <p>现在，我希望把技术理解和真实的 Developer Research 连接起来，而不是停留在理论层面。</p>
  <p><strong>接下来我最想探索的问题包括：</strong></p>
  <ol class="questions"><li>开发者实际选择 AI Infrastructure 产品时，除了性能和成本，还会考虑什么？</li><li>我们如何判断某一项技术优化，是否真正改善了用户体验？</li><li>一个优秀的开源技术项目，需要什么才能发展成被广泛采用、可持续发展的产品？</li></ol>
  <p>我希望这条学习路线不仅帮助我理解一个新行业，也帮助我进一步探索自己能够在技术、用户和商业的交汇处创造什么价值。</p>
  <div class="final-quote">The more I explore, the bigger the map becomes.</div><div class="final-quote-cn">理解技术 · 走近用户 · 创造真实价值</div>
 </section>
 </div>
</div>
</div>
</div>
