---
titleEn: "To be confirmed 06"
titleCn: "每日 Claude Code 复盘系统"
tags: []
date: 2026-05-13
readTime: 1
slug: to-be-confirmed-06
draft: false
notionId: "35f942e6-a592-814f-869f-cb25e66462c7"
---

<div class="lang-en">
<p>To be confirmed</p>
<p>&nbsp;</p>
<hr>
<p>&nbsp;</p>

</div>

<div class="lang-zh">
<p>每晚 22:00 自动读取当天所有 Claude Code 会话记录，生成结构化复盘，<strong>直接写入当天 Daily Note</strong>（<code>Journal/YYYY-MM/YYYY-MM-DD.md</code>）的 <code>## 🤖 Claude 复盘</code> 区块。</p>
<h2>输出位置</h2>
<p>不再单独建 <code>复盘/</code> 目录。复盘是 Daily Note 的一个区块，与 Toggl 时间记录共存于同一份日记。</p>
<pre><code class="language-plain">Journal/2026-05/2026-05-12.md
├── frontmatter（Toggl 脚本管理，复盘不动）
├── ## 🕐 Toggl 时间
└── ## 🤖 Claude 复盘   ← 复盘脚本写入/替换此区块
</code></pre>
<p>写入逻辑：若区块已存在则替换（不重复追加）；若 Daily Note 不存在则新建。</p>
<h2>输出结构</h2>
<p>每份复盘最多两块——<strong>Claude 复盘</strong>（认知）+ <strong>今日沉淀</strong>（产物）。两块互斥：同一会话不同时出现在两处。</p>
<h3>Claude 复盘（认知维度）</h3>
<p>按会话组织，每个会话给出：</p>
<pre><code class="language-plain">## 会话 | HH:MM–HH:MM（X分钟）｜项目名

<strong>主题</strong>：1-2 句

<strong>学到</strong>：
- `[标签 · 类型]` 内容

<strong>引用/来源</strong>：vault 内 [[wikilink]]，vault 外完整路径
</code></pre>
<h3>今日沉淀（产物维度）</h3>
<p>按资产组织，每个资产一段过程叙述：</p>
<pre><code class="language-plain">### 资产名称
<strong>时长</strong>：约X分钟 | <strong>完成时间</strong>：HH:MM
<strong>为什么建它</strong>：驱动这件事的真实问题（一句话，问题驱动）
<strong>过程</strong>：
1. 起点 / 需求
2. 卡在哪
3. 怎么过的
4. 产出
<strong>文件</strong>：[[wikilink]]
</code></pre>
<h2>收录标准</h2>
<h3>核心入选问题（先问这个）</h3>
<blockquote>
</blockquote>
<pre><code>&quot;这个会话之后，我对某类问题的判断方式变了吗？&quot;
</code></pre>
<p><strong>是</strong> → 考虑保留。</p>
<p><strong>否，只是今天做了件事</strong> → 丢弃。</p>
<h3>学到（5 选 1 才收录，否则省略整块）</h3>
<ul>
<li><p>可迁移方法论</p>
</li>
<li><p>更新了原有认知（以为 X，结果是 Y）</p>
</li>
<li><p>成长与方向（导师建议一句话即可）</p>
</li>
<li><p>决策依据（可迁移的权衡逻辑）</p>
</li>
<li><p>可复用错误模式</p>
</li>
</ul>
<p>每条加标签：<code>[AI · 错误模式]</code>、<code>[AI · 更新认知]</code>、<code>[写作 · 决策依据]</code> 等。</p>
<h3>今日沉淀（今天新建/完善/确立的可复用资产）</h3>
<p>文件、SOP、框架、系统、结构决定。</p>
<p><strong>SOP 强制收录</strong>：今天产出任何 SOP 文件，不论时长一律入沉淀。SOP = 用户认为流程重要到值得固化，漏记等于漏最重要的产物。</p>
<h2>互斥规则（重要）</h2>
<p><strong>学到 ≠ 沉淀，两者不能复述同一内容。</strong></p>
<ul>
<li><p><strong>学到</strong> = 抽象的可迁移原则（&quot;audit 脚本带 stem-fallback 会掩盖真坏链&quot;）</p>
</li>
<li><p><strong>沉淀</strong> = 具体建出的资产（文件名、为什么建、过程）</p>
</li>
<li><p>沉淀的&quot;过程&quot;部分<strong>不复述学到里的原则</strong>，只写做了什么、卡在哪、怎么过的，不总结教训</p>
</li>
<li><p>同一会话：学到看认知/方法论，沉淀看产物，必须从不同维度切入</p>
</li>
<li><p>只有产物没有原则 → 只写沉淀</p>
</li>
<li><p>只有原则没有产物 → 只写学到</p>
</li>
<li><p><strong>进了沉淀的会话，不再在复盘里写对应会话条目</strong></p>
</li>
</ul>
<h2>排除规则（整条会话丢弃，先过滤后判断）</h2>
<ul>
<li><p><strong>科研/临床项目内容</strong> —— EMS、LASSO、stability selection、给导师写 slide / outline、feature reduction、论文章节、统计方法学。有专项笔记。</p>
</li>
<li><p><strong>一次性实现细节修复</strong> —— &quot;改字体&quot;、&quot;修 frontmatter 路径&quot;。单点 tactical fix 不是方法论。</p>
</li>
<li><p><strong>只讨论没产出的会话</strong> —— 架构审计/gap inventory/推荐清单。建议型无落地，不写。</p>
</li>
<li><p><strong>wiki ingest 流程内的小错误</strong> —— 已被 AI_OS failure memory 覆盖。</p>
</li>
<li><p><strong>社交媒体草稿</strong> —— 小红书、LinkedIn 等一次性写作，不更新判断框架。</p>
</li>
<li><p><strong>Feynman 测试 / wiki ingest 会话</strong> —— 知识已在 wiki 文章里，不重复。</p>
</li>
<li><p><strong>复盘脚本自身运行的会话</strong> —— 套娃，自动化任务不记录自己。</p>
</li>
<li><p><strong>任何&quot;已有对应 wiki 页面&quot;的会话</strong> —— wiki 是知识库，复盘不是镜像。</p>
</li>
<li><p><strong>会话时长 ≤ 2 分钟</strong></p>
</li>
<li><p><strong><code>observer-sessions</code></strong><strong> 路径</strong> —— claude-mem 自动化，非用户交互。</p>
</li>
</ul>
<p><strong>保留的会话应当属于</strong>：</p>
<ul>
<li><p>真正建出可复用资产的系统建设（AI_OS、自动化脚本、统一架构）</p>
</li>
<li><p>关于 Claude Code / AI 工具本身的方法论或决策依据</p>
</li>
<li><p>跨项目可迁移的过程知识（marker-based upsert、三层 context 模型等）</p>
</li>
</ul>
<blockquote>
</blockquote>
<pre><code>宁愿留 2-3 个有内容的会话，也不要凑 7 个。
</code></pre>
<h2>技术实现</h2>
<ul>
<li><p><strong>任务定义</strong>：<code>~/.claude/scheduled-tasks/daily-claude-recap/SKILL.md</code></p>
</li>
<li><p><strong>会话数据</strong>：<code>~/.claude/projects/**/*.jsonl</code>（解析脚本 <code>/tmp/parse_sessions.py</code>，按需写入）</p>
</li>
<li><p><strong>当日 vault 变动</strong>：<code>git -C vault log --since today --name-only</code> → 用于识别&quot;今日沉淀&quot;</p>
</li>
<li><p><strong>触发时间</strong>：每晚 22:00（Claude Code scheduled tasks，不是 launchd/cron）</p>
</li>
<li><p><strong>写入方式</strong>：Python，替换或新建 <code>## 🤖 Claude 复盘</code> 区块；frontmatter 不动（由 Toggl 脚本管理）</p>
</li>
<li><p><strong>依赖前提</strong>：Claude Code 桌面 app 在运行；首次需手动执行预授权工具权限</p>
</li>
</ul>
<h2>设计演进</h2>
<p><strong>2026-05-05 起点</strong> — 想知道每天和 Claude 做了什么、学了什么。初版把所有内容塞进&quot;学到&quot;，噪音过多。</p>
<p><strong>第一轮迭代</strong> — 定义 5 条收录标准 → 排除临床/操作 → 加&quot;沉淀&quot;块 → 沉淀要有过程叙述。两块并列结构区分&quot;知识点&quot;和&quot;打了哪块地基&quot;。</p>
<p><strong>第二轮迭代（落到 Daily Note）</strong> — 复盘从独立 <code>复盘/</code> 目录迁入 <code>Journal/YYYY-MM/YYYY-MM-DD.md</code>，与 Toggl 时间记录共存。Daily Note 成为单一事实源，不再分散。</p>
<p><strong>第三轮迭代（互斥 + 入选问题）</strong> — 学到与沉淀互斥，避免同一会话两边复述。引入核心入选问题&quot;判断方式变了吗&quot;作为最高门槛，过滤掉&quot;今天做了件事但认知没动&quot;的会话。明确科研、社媒草稿、Feynman、wiki ingest、复盘自身等多类整条丢弃。</p>
<p>→ 见 [[2026-05-05]] 第一份复盘</p>
<p>&nbsp;</p>
<hr>

</div>
