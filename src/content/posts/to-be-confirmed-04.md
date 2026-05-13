---
titleEn: "To be confirmed 04"
titleCn: "AI 协作编程 SOP"
tags: ["AI"]
date: 2026-05-13
readTime: 1
slug: to-be-confirmed-04
draft: false
notionId: "35f942e6-a592-81b3-b1b5-c3bad8ef7621"
---

<div class="lang-en">
<p>To be confirmed </p>
<p>&nbsp;</p>
<hr>
<p>&nbsp;</p>

</div>

<div class="lang-zh">
<blockquote>
</blockquote>
<pre><code>适用范围：所有与 AI 协作的编程项目。两层结构：固定规则（每次都遵守）+ 项目启动模板（每次填空）。
</code></pre>
<hr>
<h2>每次新项目必做：建 CLAUDE.md</h2>
<p><strong>在项目根目录建一个 <strong><strong><code>CLAUDE.md</code></strong></strong> 文件</strong>，把本 SOP 的核心规则和项目专属信息写进去。Claude Code 每次新开 Session 会自动读取它，规则自动生效，不需要你每次手动提醒。</p>
<p>建好后，每次 Session 开始说：<strong>&quot;读一下上次的 Session 交接，我们继续。&quot;</strong></p>
<p>CLAUDE.md 模板参考本文第二节的项目启动模板。</p>
<hr>
<h2>核心原则（三条，先读）</h2>
<p><strong>1. 执行可以外包，理解不能外包</strong><br>你可以让 AI 写代码，但不能让 AI 替你理解问题。设计方向、品味判断、优先级——这些必须由你来定，AI 负责填空。</p>
<p><strong>2. 可以验证的事 AI 很强，模糊的事 AI 容易跑偏</strong><br>代码对不对、测试通过没有——AI 很可靠。审美、用户体验、&quot;感觉不对&quot;——必须你来把关。</p>
<p><strong>3. 动手之前，先把&quot;不要什么&quot;说清楚</strong><br>只说&quot;要什么&quot;不够。明确说出不要什么、什么可以妥协、什么绝对不能碰，AI 跑偏的空间才会真正变小。</p>
<hr>
<h2>目录</h2>
<ol>
<li><p>固定规则（每次都遵守）</p>
</li>
<li><p>项目启动模板（每次填空）</p>
</li>
<li><p>Session 交接模板</p>
</li>
<li><p>完成定义（DoD）参考清单</p>
</li>
</ol>
<hr>
<h2>一、固定规则（每次都遵守）</h2>
<blockquote>
</blockquote>
<pre><code>这些是死规定。不需要每次思考，直接执行。
</code></pre>
<h3>规则 1：先对齐理解，再写计划，再动手</h3>
<p><strong>第一步：对齐设计概念（动手前最容易跳过、也最值得做的一步）</strong></p>
<p>写计划之前，先确认你和 AI 对&quot;要做什么&quot;的理解一致。方法：让 AI 持续追问你，直到它能用自己的话复述出你想要的东西。</p>
<p>触发方式：告诉 AI &quot;先别动手，把你理解的需求用自己的话说一遍，有不清楚的地方问我&quot;。</p>
<p>这一步能拦截掉大部分&quot;做出来了但不是我要的&quot;的情况。</p>
<p><strong>第二步：写计划</strong></p>
<p>AI 输出：</p>
<ul>
<li><p>项目架构（用什么技术、各部分怎么配合）</p>
</li>
<li><p>分阶段步骤（每个阶段做什么、产出是什么）</p>
</li>
<li><p>每个阶段明确说：不做什么、什么可以妥协、什么不能碰</p>
</li>
</ul>
<p>计划确认后再写代码。计划变了，先更新计划，再继续。</p>
<h3>规则 2：每步必须有可验证的完成标准（DoD）</h3>
<p>&quot;做好了&quot;不算完成。完成的标志必须是黑白分明、能验证的。</p>
<p>每步开始前，先定好这步完成的标准是什么。参考第四节的 DoD 清单。</p>
<h3>规则 3：小步推进，一次只改一件事</h3>
<p>每次只做一个改动，做完验证，再做下一个。</p>
<p>不要把多个改动攒在一起。改动积累多了出了问题，无法定位是哪步导致的。</p>
<h3>规则 4：每步完成一个 Git Commit</h3>
<p>每完成一个小步骤，立刻 commit，commit message 说清楚做了什么、为什么。</p>
<p>不要攒着一起提交。Commit 是你的回滚机制——commit 越细，出问题越好还原。</p>
<h3>规则 5：要测试结果，不要完成汇报</h3>
<p>每步完成后，AI 必须主动汇报：</p>
<ul>
<li><p>测试通过情况（命令 + 结果）</p>
</li>
<li><p>编译 / 类型检查是否有报错（具体命令见项目专属 DoD）</p>
</li>
<li><p>本地验证是否正常（具体方式见项目专属 DoD）</p>
</li>
<li><p>潜在风险或遗留问题</p>
</li>
</ul>
<p>不接受&quot;已完成&quot;这样的汇报。没有测试结果就不算交差。</p>
<h3>规则 6：大改动前确认回滚方案</h3>
<p>在做可能影响大、难以撤销的改动之前，先确认：</p>
<ul>
<li><p>当前状态已经 commit（可以还原）</p>
</li>
<li><p>知道出问题时怎么回到上一个状态</p>
</li>
</ul>
<h3>规则 7：开发环境和生产环境严格分开</h3>
<ul>
<li><p>本地（localhost）= 开发环境，用来测试</p>
</li>
<li><p>上线（Netlify / Vercel 等）= 生产环境，给用户看的</p>
</li>
</ul>
<p>不在生产环境上调试。每次上线前，本地先跑通。</p>
<h3>规则 8：密钥和敏感数据保护清单</h3>
<p>每个项目开始时确认以下几点：</p>
<ul>
<li><p><input disabled="" type="checkbox"> <code>.env</code> 文件已创建，密钥存在里面</p>
</li>
<li><p><input disabled="" type="checkbox"> <code>.env</code> 已加入 <code>.gitignore</code></p>
</li>
<li><p><input disabled="" type="checkbox"> 运行 <code>git status</code> 确认 <code>.env</code> 不在待提交列表里</p>
</li>
<li><p><input disabled="" type="checkbox"> API 密钥已存入 GitHub Secrets（如果用 GitHub Actions）</p>
</li>
<li><p><input disabled="" type="checkbox"> 代码里没有任何明文密钥</p>
</li>
</ul>
<h3>规则 9：更新文档是完成的一部分</h3>
<p>每次改动代码，对应的 Obsidian 笔记也要更新（Build Log 至少要记录）。</p>
<p>文档不是事后补，是&quot;完成&quot;定义的一部分。改了代码但没更新文档，不算真正完成。</p>
<p>每次新建或更新 Obsidian 笔记，必须主动检查相关笔记并加双向链接——不等用户提醒。</p>
<h3>规则 11：Bug 修复必须按顺序来</h3>
<p>发现 bug，不要直接让 AI 改代码。必须按以下顺序：</p>
<ol>
<li><p><strong>先复现</strong>：能稳定复现才算真正找到了问题（说清楚：什么操作 → 出现什么现象）</p>
</li>
<li><p><strong>再修复</strong>：找到原因，针对原因改，不要猜着改</p>
</li>
<li><p><strong>验证无误伤</strong>：改完之后，确认原来能用的功能没有被破坏</p>
</li>
</ol>
<p>跳过第一步直接改，很容易改了一个问题又带出新问题。</p>
<h3>规则 10：每次 Session 结束必须写交接</h3>
<p>Session 结束前，AI 输出一份交接，存入 Obsidian Build Log。格式见第三节。</p>
<p>下次新开 Session，第一句话：<strong>&quot;读一下上次的交接，我们继续。&quot;</strong></p>
<hr>
<h2>二、项目启动模板（每次填空）</h2>
<blockquote>
</blockquote>
<pre><code>新项目开始时，复制这个模板，填完再开始。填完的内容就是这个项目的协作契约。
</code></pre>
<pre><code class="language-plain">## 项目名称
[填写]

## 一句话目标
[这个项目要解决什么问题，交付什么]

## 技术栈
- 框架：
- 语言：
- 部署平台：
- 其他工具：

## 敏感数据情况
- 是否有 API 密钥：是 / 否
- 是否有数据库：是 / 否
- 其他敏感信息：

## 阶段划分

### 阶段一：[名称]
目标：
步骤：
- [ ] 步骤 1
- [ ] 步骤 2
完成标准（DoD）：

### 阶段二：[名称]
目标：
步骤：
- [ ] 步骤 1
- [ ] 步骤 2
完成标准（DoD）：

（按需增加阶段）

## 沟通约定
- 每步完成后 AI 汇报：测试结果 + 潜在风险
- 出问题时：先问原因，再问解法，最后才动手
- 遇到不确定的方案：搜一下行业标准做法

## 回滚机制
- 版本控制工具：Git
- 每步完成后 commit，message 格式：[做了什么]: [简短描述]

## 本项目专属 DoD 补充
- 类型检查命令：[填写，如 astro check / tsc / mypy / 无]
- 测试命令：[填写，如 npx vitest run / jest / pytest / 无]
- 本地预览方式：[填写，如 localhost:4321 / 运行脚本 / 无界面]
- 验收方式：[填写，如 浏览器操作 / 录视频 / API 返回值检查]
</code></pre>
<hr>
<h2>三、Session 交接模板</h2>
<blockquote>
</blockquote>
<pre><code>每次 Session 结束前，AI 按这个格式输出，存入 Build Log。
</code></pre>
<pre><code class="language-plain">## Session 交接（[日期]）

### 这次做了什么
- [完成的内容1]
- [完成的内容2]

### 下一步是什么
- [待完成的步骤1]
- [待完成的步骤2]

### 遗留问题 / 风险
- [已知但未处理的问题]
- [可能需要注意的风险]

### 当前状态
- 最新 commit：[commit message]
- 本地测试：通过 / 未通过
- 生产环境：已部署 / 未部署
</code></pre>
<hr>
<h2>四、完成定义（DoD）参考清单</h2>
<h3>通用部分（所有项目适用）</h3>
<blockquote>
</blockquote>
<pre><code>每步完成前对照这个清单。不是每条都必须，根据改动类型选择适用的。
</code></pre>
<p><strong>代码层面</strong></p>
<ul>
<li><p><input disabled="" type="checkbox"> 本地运行无报错</p>
</li>
<li><p><input disabled="" type="checkbox"> 相关测试通过</p>
</li>
</ul>
<p><strong>功能层面</strong></p>
<ul>
<li><p><input disabled="" type="checkbox"> 测试了正常路径（主要功能）</p>
</li>
<li><p><input disabled="" type="checkbox"> 测试了边缘情况（空数据、极端输入等）</p>
</li>
</ul>
<p><strong>安全层面</strong></p>
<ul>
<li><p><input disabled="" type="checkbox"> 代码里没有明文密钥</p>
</li>
<li><p><input disabled="" type="checkbox"> 有 <code>.env</code> 的项目：确认它未被 git 追踪</p>
</li>
</ul>
<p><strong>版本控制</strong></p>
<ul>
<li><p><input disabled="" type="checkbox"> 已 commit，message 清晰描述了做了什么</p>
</li>
<li><p><input disabled="" type="checkbox"> 如果上线，已 push 并确认部署成功</p>
</li>
</ul>
<p><strong>文档</strong></p>
<ul>
<li><input disabled="" type="checkbox"> Obsidian Build Log 已更新</li>
</ul>
<hr>
<h3>项目专属部分（在启动模板里填，每个项目不同）</h3>
<p>以下内容不写死在这里，而是在每次项目启动时，填入项目启动模板的&quot;专属 DoD&quot;一栏：</p>
<table header-row="true" header-column="false"><tr><td>类型</td><td>填写什么</td><td>举例</td></tr><tr><td>类型检查命令</td><td>这个项目用什么命令检查类型</td><td>`astro check`、`tsc`、`mypy`、无</td></tr><tr><td>测试命令</td><td>这个项目用什么测试框架</td><td>`npx vitest run`、`jest`、`pytest`、无</td></tr><tr><td>本地预览方式</td><td>怎么在本地看到效果</td><td>浏览器打开 localhost、运行脚本看输出、调用 API 看返回</td></tr><tr><td>验收方式</td><td>怎么确认功能符合预期</td><td>浏览器操作、录视频、截图对比、API 返回值检查</td></tr></table><h2>项目最后的复盘学习工作流：</h2>
<p>[[一个值得复用的 AI 学习工作流（2026-05-02）]]<br>并且要读取确定下来复盘标准：<br>[[项目复盘标准：怎么复盘才能真正积累]]</p>
<hr>
<hr>
<h2>参考来源</h2>
<p>本 SOP 综合了以下笔记的核心洞察：</p>
<ul>
<li><p>[[AI编程时代，还需要学习编程吗]]</p>
</li>
<li><p>[[写了十八年代码的老码农使用 Codex Vibe Coding 后总结了哪些重要经验？]]</p>
</li>
<li><p>[[(1) Opus 4.7 一天烧 18 亿 Token：我的 Vibe Coding 四环飞轮（BuildSaleTestFix）]]</p>
</li>
<li><p>[[(1) &quot;Software Fundamentals Matter More Than Ever&quot; — Matt Pocock]]</p>
</li>
<li><p>[[(6) Andrej Karpathy From Vibe Coding to Agentic Engineering]]</p>
</li>
<li><p>[[Navi Site  学习笔记]]</p>
</li>
<li><p>[[一个值得复用的 AI 学习工作流（2026-05-02）]] — 本 SOP 的方法论背景和六阶段工作流</p>
</li>
</ul>
<hr>
<p><em>创建日期：2026-05-02</em><br><em>基于 Navi Site 项目复盘 + 行业最佳实践 + Addy Osmani / Matt Pocock / Andrej Karpathy / Codex Cookbook 整理</em></p>
<p>&nbsp;</p>
<hr>

</div>
