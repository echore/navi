---
titleEn: "To be confirmed 02"
titleCn: "Toggl → Obsidian → Notion 时间记录自动化 SOP"
tags: []
date: 2026-05-13
readTime: 1
slug: to-be-confirmed-02
draft: false
featured: false
notionId: "35f942e6-a592-81e5-842d-dd67da67661d"
---

<div class="lang-en">
<p>TO be confirmed</p>
<p>&nbsp;</p>
<hr>
<p>&nbsp;</p>

</div>

<div class="lang-zh">
<h2>Why：为什么要做这个？</h2>
<p>写日记时手动记录&quot;几点到几点做了什么&quot;非常繁琐，而 Toggl 里已经有完整的计时数据。目标是让时间记录自动流入日记和周记，写日记时只需专注于内容本身，时间维度由系统自动填充。</p>
<p>同时，日记数据需要：</p>
<ul>
<li><p><strong>本地优先</strong>（不经过 GitHub，保护隐私）</p>
</li>
<li><p><strong>云端备份</strong>（同步到 Notion，随时可查）</p>
</li>
<li><p><strong>统计可视化</strong>（周报按项目汇总，看清楚时间都花在哪里了）</p>
</li>
</ul>
<hr>
<h2>What：这是什么？</h2>
<p>一个由四个定时任务驱动的自动化管道：</p>
<pre><code class="language-plain">Toggl 手动计时
    ↓ 每天晚上 9pm / 每周日晚上 9pm
Python 脚本调用 Toggl API v9
    ↓ 生成时间记录 + matplotlib 图表 PNG
写入 Obsidian Journal 文件（本地，不上 GitHub）
    ↑ 同一个文件
Claude Code 会话日志
    ↓ 每天晚上 10pm / 每周日晚上 8pm
daily-claude-recap / weekly-claude-recap 定时任务
    ↓ 文件修改后 5 秒自动触发
Share to NotionNext 插件同步
    ↓
Notion 数据库&quot;fall&quot;
</code></pre>
<p><strong>每日日记</strong>：<code>Journal/YYYY-MM/YYYY-MM-DD.md</code></p>
<ul>
<li><p><code>## ⏱ 时间记录</code>：逐条列出当天计时，附 matplotlib 横向 bar 图（Navi 暖色系）</p>
</li>
<li><p><code>## 🤖 Claude 复盘</code>：当天 Claude Code 会话摘要 + 今日沉淀</p>
</li>
<li><p>手写内容写在两个 section 之前，任务不覆盖</p>
</li>
</ul>
<p><strong>每周周记</strong>：<code>Journal/YYYY-MM/YYYY-WNN.md</code></p>
<ul>
<li><p><code>## ⏱ 本周时间分布</code>：按项目分组表格 + 三图（项目横条 + 每日堆叠 + 趋势折线）</p>
</li>
<li><p><code>## 🤖 本周 Claude 汇总</code>：本周会话统计 + 聚合学到 + 本周沉淀列表</p>
</li>
</ul>
<hr>
<h2>How：我们是怎么做到的？</h2>
<h3>关键决策过程（back and forth）</h3>
<p><strong>调度器选择</strong>：试过 launchd 和 cron，均不可用。最终选 Claude Code scheduled tasks，稳定可靠。</p>
<p><strong>同步目标选择</strong>：</p>
<ul>
<li><p>日记原在 Notion（纯文字流水账），考虑迁到 Obsidian</p>
</li>
<li><p>担心 GitHub 同步隐私问题 → 查证：私有仓库静态内容不用于训练，但仍用 <code>.gitignore</code> 彻底隔离 <code>Journal/</code></p>
</li>
<li><p>用 Share to NotionNext 插件的 Auto Sync（文件修改后5秒自动推送）替代 GitHub 作为云端备份</p>
</li>
</ul>
<p><strong>可视化格式选择（三轮迭代）</strong>：</p>
<ol>
<li><p>第一版：Unicode 条形图（<code>█░</code>）→ 在 Obsidian 渲染模式下极丑，字符变成大黑块</p>
</li>
<li><p>第二版：emoji 彩色方块 + 条形图 → 仍然丑，比例字体无法对齐</p>
</li>
<li><p>第三版：<strong>Markdown 表格</strong> → 渲染正常，项目粗体 + 子任务明细，采用</p>
</li>
</ol>
<p><strong>Toggl Reports API 探索</strong>：</p>
<ul>
<li><p>调了 Summary / Detailed / Weekly 三个端点</p>
</li>
<li><p>Summary 和我们手动聚合的数据一样，无额外价值</p>
</li>
<li><p>Weekly 提供按星期几分布，但用户认为不如现有表格实用，放弃</p>
</li>
<li><p>结论：继续用 <code>/me/time_entries</code> + 自己聚合，简单够用</p>
</li>
</ul>
<h3>最终系统架构</h3>
<p><strong>脚本</strong>：<code>Not commonly used/scripts/toggl_to_journal.py</code></p>
<table header-row="true" header-column="false"><tr><td>函数</td><td>作用</td></tr><tr><td>`get_toggl_entries`</td><td>调 Toggl API v9 拉当天条目</td></tr><tr><td>`get_toggl_projects`</td><td>拉项目名称映射（id → name）</td></tr><tr><td>`format_entries`</td><td>格式化每日时间列表</td></tr><tr><td>`format_weekly_section`</td><td>生成周报 Markdown 表格，emoji 彩色项目</td></tr><tr><td>`generate_daily_chart`</td><td>生成每日横向 bar 图 PNG（Navi 色板）</td></tr><tr><td>`generate_weekly_chart`</td><td>生成周报三图 PNG（横条 + 堆叠 + 折线）</td></tr><tr><td>`upsert_time_section`</td><td>写入/更新文件中的时间 section，保留后续内容</td></tr><tr><td>`generate_weekly_summary`</td><td>周报全流程，若已有 Claude 汇总则插入其前</td></tr></table><p><strong>运行方式</strong>：</p>
<ul>
<li><p>每日：<code>python3 toggl_to_journal.py</code></p>
</li>
<li><p>周报：<code>python3 toggl_to_journal.py --weekly</code></p>
</li>
</ul>
<p><strong>定时任务</strong>：</p>
<table header-row="true" header-column="false"><tr><td>任务</td><td>时间</td><td>作用</td></tr><tr><td>`toggl-journal-sync`</td><td>每天 21:00</td><td>拉取当日 Toggl 数据 + 生成日图表</td></tr><tr><td>`toggl-weekly-sync`</td><td>每周日 21:00</td><td>生成周 Toggl 数据 + 三图</td></tr><tr><td>`daily-claude-recap`</td><td>每天 22:00</td><td>Claude Code 会话复盘写入日记</td></tr><tr><td>`weekly-claude-recap`</td><td>每周日 20:00</td><td>聚合本周 Mon–Sat 复盘写入周记</td></tr></table><p><strong>隐私保护</strong>：</p>
<ul>
<li><p><code>Journal/</code> 和 <code>Not commonly used/scripts/.env</code> 均在 <code>.gitignore</code> 中，永不上 GitHub</p>
</li>
<li><p>Toggl API token 只存在本地 <code>Not commonly used/scripts/.env</code>，绝不出现在对话或代码里</p>
</li>
</ul>
<p><strong>Notion 自动同步</strong>：</p>
<ul>
<li><p>每个新建的 Journal 文件顶部自动写入 frontmatter：</p>
<pre><code class="language-yaml">
</code></pre>
</li>
</ul>
<hr>
<p>autosync-database: journal</p>
<p>Select: Daily Journal   # 或 Weekly Journal</p>
<hr>
<pre><code>```
</code></pre>
<ul>
<li>Share to NotionNext 插件检测到 frontmatter → 文件改动后5秒自动推送到 Notion 数据库&quot;fall&quot;</li>
</ul>
<p><strong>Obsidian 插件</strong>：</p>
<ul>
<li><p><code>obsidian-toggl-integration</code>（mcndt）：<strong>已决定跳过</strong>。插件已停止维护（3年无更新），&quot;API unreachable&quot; 为已知未修复 bug（#184）。核心需求已由 Python 脚本覆盖。</p>
</li>
<li><p><code>Share to NotionNext</code>：Auto Sync 已开启，delay 5秒，图片同步已验证可用（2026-05-05）</p>
</li>
</ul>
<hr>
<h2>待验证</h2>
<h3>Share to NotionNext 图表同步</h3>
<p>手动同步含本地图片的笔记已验证成功（2026-05-05）。尚未验证：</p>
<ul>
<li><p>Auto Sync 是否稳定可靠（曾见&quot;Skip Auto Sync&quot;提示，原因不明）</p>
</li>
<li><p>新增的 Toggl 图表 PNG 是否随日记正常同步到 Notion</p>
</li>
</ul>
<p><strong>验证步骤</strong>：</p>
<ol>
<li><p>手动运行 <code>python3 toggl_to_journal.py</code>，确认日记含 <code>![[YYYY-MM-DD-toggl.png]]</code></p>
</li>
<li><p>在 Obsidian 手动触发 Share to NotionNext 同步</p>
</li>
<li><p>检查 Notion <code>fall</code> 数据库该条目是否包含图表图片</p>
</li>
</ol>
<hr>
<h2>相关文件路径</h2>
<table header-row="true" header-column="false"><tr><td>文件</td><td>用途</td></tr><tr><td>`Not commonly used/scripts/toggl_to_journal.py`</td><td>主脚本</td></tr><tr><td>`Not commonly used/scripts/.env`</td><td>Toggl API token（本地，gitignored）</td></tr><tr><td>`Not commonly used/scripts/tests/test_toggl_to_journal.py`</td><td>单元测试（14项）</td></tr><tr><td>`docs/superpowers/plans/2026-05-06-toggl-journal-integration.md`</td><td>实现计划原文</td></tr><tr><td>`Journal/`</td><td>日记 + 周记输出目录（gitignored）</td></tr></table><p>&nbsp;</p>
<hr>

</div>
