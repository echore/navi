---
titleEn: "Real Lessons from Claude Code, Codex, and AI Agent Tools"
titleCn: "长文干货｜关于Claude Code Codex等Agent工具的一切"
tags: ["AI","Social Media"]
date: 2026-05-21
readTime: 10
slug: real-lessons-from-claude-code-codex-and-ai-agent-tools
draft: false
featured: false
notionId: "366942e6-a592-80c0-8efc-d57e9e2f5ef6"
---

<div class="lang-en">
<p>This is a summary of nearly two months of intensive use of Claude Code and Codex. I&#39;m pretty sure something in here will be useful to you, whatever your background.</p>
<p>Even if you have zero technical training and have never touched AI beyond a chat interface, I think this will give you something new. I was exactly that person not long ago.</p>
<p>One thing to be upfront about: Claude Code has done a lot of things for me, but it didn&#39;t write this article. Though it did offer edits and suggestions along the way.</p>
<hr>
<h2>How It Started</h2>
<p>It all started because I genuinely couldn&#39;t stand the mindless searching and boring organizing anymore.</p>
<p>I got interested in startups and started cold-emailing CEOs in March to pitch myself. The process was exactly as tedious as it sounds: go to a VC&#39;s website, click through their portfolio one by one, search the CEO&#39;s email, write the message, copy everything into a Notion database, paste it into my email client, send. The constant context switching was exhausting. </p>
<p>One day I just couldn&#39;t take it anymore. I asked chatgpt for help automating some of it. It suggested n8n. I got a Reddit scraper working, but the full cold-email workflow refused to cooperate no matter what I tried. I was venting to a friend when he said, almost as an aside, &quot;Codex and Claude Code are really powerful now.&quot; I tried it out of pure mind(just give it a try anyway): I described my exact workflow to Codex in detail. Six minutes later, it had built something that worked better than what I&#39;d been doing manually.</p>
<p>The feeling was hard to describe. I imagine it&#39;s something like what a textile worker felt seeing a spinning jenny for the first time: shock, a little fear, and then one immediate thought: &quot;I really need to understand this.&quot; It felt like a watershed moment.</p>
<p>I started hunting for tutorials. Claude Code had far more documentation than Codex since it launched earlier, so that became my entry point into what turned into months of intense exploration.</p>
<hr>
<h2>Exploration</h2>
<p>I started throwing everything tedious at these tools to see what stuck.</p>
<p>My meeting notes with my supervisor were never complete enough. I wanted a specific format: direct quotes, highlighted key points, clear next steps. So I had Claude Code lock in an SOP format. Now every meeting produces a perfectly structured note automatically.</p>
<p>Presentation slides were always a headache for me. Using good-looking HTML templates and content I provided, I worked with Claude Code step by step to turn ideas into HTML and then PDF. Claude Code wrote all the code. After many rounds of back and forth, I also locked in an HTML Slide SOP. Now slides can generate automatically.</p>
<p>I had ideas I wanted to track in a database, but opening Notion and clicking through to the right database always took too many steps. So I set up a Telegram bot hosted on Railway: now any idea I have lands in the right Notion database with a single tap. Claude Code wrote all the code.</p>
<p>Before, when I found good content online (say, a YouTube video), I&#39;d copy the transcript, hand it to an AI for a summary, specify the format every time, and paste the result into Obsidian. Now the Obsidian Web Clipper plugin pulls it in automatically. An LLM formats it as a wiki-style note. When I want to go deeper on something, I ask the AI on the spot and update the note based on the answer. Then I use the Feynman method (which I&#39;ve locked in as a reusable skill) to test whether I actually understood it.</p>
<p>There are so many more examples. The pattern is always the same: have an idea, act on it fast, learn from what breaks.</p>
<hr>
<h2>Lessons Learned</h2>
<p>When you experiment enough, you see these tools clearly. They&#39;re powerful, but they have real flaws. You won&#39;t always get what you want. You have to manage them.</p>
<h3>It Only Cares About Right Now</h3>
<p>AI solutions have one obvious default: make it work now, worry about nothing else. Long term maintenance isn&#39;t on its agenda. It prioritizes the immediate problem over architectural durability every time.</p>
<p>My fix: after getting any proposal for a long-lived project, I now add one follow up: &quot;Is this maintainable long-term? Is there a simpler way to do this?&quot;</p>
<h3>Backups Come First</h3>
<p>I once read a Reddit thread where someone asked Claude to help with a task, and Claude deleted their entire database. Just gone. You can&#39;t watch every action it takes, but you also can&#39;t afford to babysit it constantly.</p>
<p>The answer is Git. My Obsidian vault syncs to a private GitHub repo via the official Obsidian Git plugin. Code projects follow the same pattern. If you don&#39;t have a development background, you don&#39;t need to learn much. One afternoon to understand commit and push is enough. Claude Code wrote my auto-backup scripts.</p>
<h3>Never Hand Over Credentials</h3>
<p>One thing that genuinely frustrated me: it&#39;ll ask for your API key directly in the chat.</p>
<p>Large models aren&#39;t well-trained on security, so you have to protect yourself. API tokens, passwords, credentials: none of these belong in a conversation window. Create a <code>.env</code> file yourself and keep sensitive information there.</p>
<h3>CLAUDE.md Needs Regular Pruning</h3>
<p>The more you use the tool, the more rules and preferences you pile into CLAUDE.md. But once it gets long enough, Claude stops following all of it. There&#39;s an effective ceiling on how many instructions it actually processes, and rules you added quickly sometimes contradict the overall logic.</p>
<p>Review it regularly: delete what&#39;s outdated, merge what&#39;s duplicated, keep it lean. For any configuration file, less is more.</p>
<h3>Treat It Like a Junior You Have to Manage</h3>
<p>This is the most accurate framing I&#39;ve found. You have to actively manage it, not just dump a requirement and wait.</p>
<p>My current workflow:</p>
<p><strong>Set a clear goal first.</strong> Not &quot;help me do X,&quot; but &quot;the goal is Y, it needs to reach Z, and here&#39;s what done looks like.&quot; A fuzzy goal makes everything downstream useless.</p>
<p><strong>Make it research before building.</strong> Most things you want already exist on GitHub or in some community. Search first, reuse if you can, don&#39;t start from scratch.</p>
<p><strong>Require a plan before execution.</strong> If something genuinely needs to be built, ask for a plan before any code gets written. This looks slow and actually saves time.</p>
<p><strong>Keep progress visible.</strong> I have Claude maintain a <code>LOG.md</code>. Each completed step gets a checkmark; errors get logged. I don&#39;t need to watch constantly. A quick glance tells me where things stand and whether it&#39;s stuck.</p>
<p><strong>Dig into the root cause when it loops.</strong> If the same problem comes back three times, stop. Don&#39;t ask for another proposed fix. Make it understand the actual problem first. Throwing more solutions at a bug it doesn&#39;t understand will not unstick it.</p>
<p><strong>Require verification, not just &quot;done.&quot;</strong> &quot;Done&quot; doesn&#39;t mean done. I now explicitly ask for tests and verification. The result counts only when I see it actually run.</p>
<p><strong>Lock working patterns into SOPs.</strong> Every time I solve a new type of problem, I run a quick retrospective with Claude and write the outcome into an SOP in Obsidian. Next time a similar situation comes up, I hand it the SOP. No re-explaining from scratch.</p>
<hr>
<h2>Resource Recommendations</h2>
<p>If you don&#39;t want to hunt these down yourself, I&#39;ve organized everything into a categorized database. Claude Code organized it, naturally.</p>
<p><a href="https://www.notion.so/fifree/be80b0ba0e5d433cb076333468474cd7?v=83cfbad9d26e434cac9fb528ad6d5292"><strong>Tool Resource Library (Categorized)</strong></a></p>
<p>A few worth calling out:</p>
<p><strong>Superpowers Skills</strong>: a skill pack for Claude Code with built-in workflows for brainstorming, task decomposition, and execution planning. Having a structured approach beats having none.</p>
<p><strong>Claude Mem</strong>: cross session memory. By default Claude starts fresh in every conversation. This changes that.</p>
<p><strong>Context Mode</strong>: automatically manages context, extracts relevant information, saves it locally, reduces token usage, and keeps Claude better oriented to the current task.</p>
<p><strong>Agent Style</strong>: an English writing ruleset that strips passive voice and AI-register patterns from Claude&#39;s default output.</p>
<p><a href="https://www.typeless.com/refer?code=ALQEAY1">Typeless</a> and <a href="https://wisprflow.ai/r?YACHEN2">Wispr Flow</a> are both my referral links. Not sponsored. Both give a free month to new users. Neither is a simple transcription tool. Both strip filler words, restructure content on the fly, and handle mixed-language input well.</p>
<p>Wispr Flow runs globally on Mac with a lighter footprint. Typeless does more active work: it takes scattered speech and organizes it into coherent, structured text. The tradeoff is price. I currently prefer Typeless, though Wispr Flow is a solid alternative. I&#39;ve tried other tools too, and once you&#39;ve used the better ones, the gap is immediately obvious. Voice input alone can meaningfully lift your output.</p>
<hr>
<h2>On Cost</h2>
<p>I started on the Pro plan ($20/month). I found myself constantly checking the usage dashboard, watching the remaining quota, occasionally hitting the 5-hour cap. Eventually I upgraded to Max. I haven&#39;t looked at those numbers since.</p>
<p>That said, you don&#39;t need Max from the start. Codex&#39;s free tier is generous. The exploratory phase is totally manageable on free tiers. If Claude Code later becomes your primary tool, Max starts making sense on its own: your quota directly limits your output, and the ROI is high.</p>
<hr>
<h2>What I&#39;d Leave You With</h2>
<p>AI hasn&#39;t reduced my screen time. If anything I spend more time at my computer now.</p>
<p>What it changed is how learning feels. Before, it had real friction: no immediate feedback, no way to know if I&#39;d actually understood something, constant page-switching and copy-pasting. Now I ask anything I don&#39;t understand on the spot, update my notes after understanding it, and test with the Feynman method. The whole chain connects without ever leaving the current page.</p>
<p>The other shift: ideas move from thought to action much faster. Before, getting from &quot;I want to do this&quot; to actually doing it meant crossing a lot of terrain. Now I just talk to Claude: can this be built, has someone already done it, what are the steps? Then I start. That loop is genuinely addictive.</p>
<p>One thing that used to stress me out: this space moves fast. For a while I felt perpetually behind, finishing one tutorial only to see the creator post an update. I&#39;ve made peace with that. Anxiety helps nothing, and most of the latest features are still being iterated on anyway. What actually compounds over time is more fundamental: engineering thinking, management thinking, and making your workflows repeatable.</p>
<p>The principle I hold onto most is that <strong>workflows should be portable</strong>. Claude Code is excellent, but all your data and configuration lives on Claude&#39;s platform. If Claude stops being the dominant tool someday, you need to be able to move your whole workflow somewhere else. That&#39;s why I keep every preference, SOP, and writing style documented in my own Obsidian vault. When I eventually switch tools, I give the new AI these files to read. It learns who I am and what I want. The tools will change. What you&#39;ve built for yourself stays yours.</p>
<p>This is the best of times. I still believe that. Keep exploring as always.</p>
<hr>
<p>&nbsp;</p>

</div>

<div class="lang-zh">
<p>这篇我会当作一个总结性的大合集文章，讲述我这不到两个月高强度使用Claude Code和Codex工具的体验和经验，我相信这其中一定有内容能对大家有所帮助。</p>
<p>哪怕你不是技术背景，也对AI 除了聊天界面之外一无所知，我也相信这会给予你新的启发，因为我曾经就是这样。</p>
<p>虽然我讲了很多事情都是Claude Code帮我做的，但这篇文章不是。不过它有给一些修改和建议。</p>
<h2>缘起</h2>
<p>这一切来源于我真的受够了毫无意义的搜索和整理工作。</p>
<p>我对startup很感兴趣，于是在今年3月开始cold email 给CEO pitch我自己。具体就是去VC官网一个一个去看它们投资的公司，再去找CEO邮件，再写邮件整理到notion数据库，复制粘贴到邮件里发送，这整个过程其实是非常耗费时间的，尤其要切换很多页面，整个过程又很枯燥没有任何成长性可言。</p>
<p>有一天我实在受不了想要自动化一部分，于是问了AI网页版，它推荐了n8n（另一个自动化的工具），我尝试了一下搭建了一个自动抓取reddit帖子的流程，但整个cold email的过程没能搭建成功，和朋友吐槽时他说了一句“codex 和 claude code现在很强大“，我抱着死马当活马医的心态，详细向codex描述了我如何操作的流程，它6分钟做出来了甚至比我手动做得好多了。</p>
<p>当时就是一整个仿佛纺织工人看见珍妮机的感受一样，震撼害怕，下一个念头就是这个工具我一定要会了。这真的会是划时代的事件。</p>
<p>接着我就开始搜索教程，发现claude code的教程比codex多多了（推出时间更早），于是我就开始了疯狂的探索期。</p>
<h2>探索</h2>
<p>于是我就开始尝试把生活中一切我觉得无聊耗时间的事情可以优化的全部优化了，有什么想法完全就是和AI聊然后试验。</p>
<p>比如和导师会议来不及把所有笔记记住，于是用AI总结，虽然这个也有会议自带总结但我希望是我想要的特定格式，比如有导师原话；有高亮；有下一步的指导等等，所以我会让Claude Code固定SOP格式，每次都是自动的完美的笔记。</p>
<p>比如做Pre Slide一直是我的头疼事情，于是用AI借助好看的HTML模版，借助其源码和我提供的内容，一步一步做成HTML再转成PDF,其中代码改写都是Claude Code写的，在这个过程有很多来回的修改，于是我又固定了HTML Slide的SOP模版。下次就是自动的Slide生成了。</p>
<p>比如我有很多想法想要数据库的形式总结整理，但是每次都要打开notion点击好几次才能转到相应的数据库，于是我设置了telegram bot托管到railway,这样我每次有什么想法只需要点进telegram输出，只用点击一次，就会自动出现在对应的notion数据库中。其中所有的代码同样也是claude code写的。</p>
<p>比如网上看见好的知识（例如youtube视频）之前我需要复制脚本，交给AI总结，每次还要告诉我想要的格式，再复制粘贴到obsidian，现在我只需要用obsidian web clipper插件自动出现在obsidian，再利用LLM wiki格式总结笔记，如果我想要学习，就直接问AI问题，基于回答再更新笔记。之后再用费曼学习法(我固定成了skill)，来检验我的学习。</p>
<p>有太多太多了，所有的都是一个想法然后迅速实践，之后总结经验教训。</p>
<p>以上所有都有相应的SOP笔记记录在我的个人网站（目前还在完善中）：<a href="https://navi-liart-nine.vercel.app/">https://navi-liart-nine.vercel.app/</a></p>
<h2>经验教训</h2>
<p>当你尝试足够多时，你就发现工具虽然强大，也有很多缺点。不是每一次都能提到想要的结果，你需要去管理它。</p>
<h3><strong>它</strong>只关心现在</h3>
<p>AI给方案有一个很明显的特点：它只关心&quot;现在能跑&quot;，不关心&quot;半年后你还能不能维护&quot;，一定也不长期主义。</p>
<p>它的设计逻辑就是这样，它优先解决眼前的问题，而不是帮你规划长期的架构。所以我现在如果是长期任务每次让它给方案之后，都会加一句：<strong>&quot;这个方案长期可以维护吗？有没有更简洁的实现方式？&quot;</strong> </p>
<h3><strong>备份NO.1</strong></h3>
<p>我在Reddit上看过一个帖子，有人让Claude帮他干活，Claude直接把他的数据库清空了。删了就是真的删了，找不回来。但你又不可能实时盯着它的每一步操作，那还不如自己干了。所以备份很重要。</p>
<p>我现在的做法是用Git做版本控制。Obsidian用官方的Git插件自动同步到私有GitHub仓库，代码项目也是同理。如果你不是开发背景，也不需要学很多，一个下午弄懂基本的commit和push就够了，自动备份脚本是Claude Code帮写的。</p>
<h3><strong>隐私绝对不给权限</strong></h3>
<p>它有一个让我非常无语的毛病：它会直接在对话里问你要API key。</p>
<p>大模型在安全方面的训练是不足的，所以你只能自己保护自己。任何API token、密码、凭证，绝对不能出现在对话框里。正确的做法是自己创建一个<code>.env</code>文件，把所有敏感信息存在里面。这是一条我觉得无论如何都要守住的原则。</p>
<h3><strong>CLAUDE.md 要定期清理</strong></h3>
<p>随着你用得越来越多，你会不断把新的规则和偏好加进CLAUDE.md。但它太长了之后，Claude并不会完全遵守，它实际能有效处理的行数是有上限的，而且你临时加进去的规则有时候和整体逻辑是矛盾的。</p>
<p>所以要定期去review，删掉过时的，合并重复的，让它保持精简。对任何配置来说，less is more。</p>
<h3><strong>把它当成需要管理的 junior</strong></h3>
<p>这是我目前觉得最准确的一个比喻。你需要主动去管理它，而不是丢一个需求进去等结果。</p>
<p>我现在的工作流大概是这样的：</p>
<p><strong>先设定清晰目标</strong> — 不是&quot;帮我做X&quot;，而是&quot;目标是Y，希望它能达到Z，验收标准是这样的&quot;。目标模糊的话，后面所有步骤都没什么用。</p>
<p><strong>让它先调研</strong> — 很多你想要的东西，GitHub或者社区里已经有人做了。先搜，能复用就复用，不要从零开始。</p>
<p><strong>做一个计划</strong> — 如果确实需要从头做，让它先出一个计划，而不是直接动手。这步看起来慢，实际上省时间。</p>
<p><strong>进度要可见</strong> — 我会让Claude维护一个<code>LOG.md</code>，每完成一步就打勾，遇到报错也记录进去。这样我不用一直盯着，随时瞥一眼就知道它在哪个阶段、有没有卡住。</p>
<p><strong>追问根因</strong> — 如果同一个问题来来回回三次还解决不了，停下来。不要继续让它给方案，先让它把问题本身搞清楚，再找解决方法。一直让它试方案，它死活也改不了那个bug。</p>
<p><strong>要求验证</strong> — 它说&quot;做好了&quot;不代表真的好了。我现在会明确要求它写测试、跑验证，看到实际跑通的结果才算数。</p>
<p><strong>复盘固化成SOP</strong> — 每次解决了一个新类型的问题，我都会和它一起复盘，总结成SOP存进Obsidian。下次遇到类似场景，直接把SOP丢给它读，不用再从头沟通一遍。</p>
<p>SOP示例结构如下：</p>
<p><img src="/assets/posts/real-lessons-from-claude-code-codex-and-ai-agent-tools/image.png" alt=""></p>
<h2>资源推荐</h2>
<p>懒得一个一个找的话，我把常用的工具和资源都整理进了一个分类数据库，直接点进去按类型找（当然这也是Claude code帮我整理的）：</p>
<p><strong>→ </strong><a href="https://navi-liart-nine.vercel.app/posts/toolkit"><strong>工具资源库（分类整理）</strong></a></p>
<p>以下是几个我觉得值得单独说的：</p>
<p><strong>Superpowers Skills</strong> — Claude Code的skill包，内置头脑风暴、任务拆解、执行计划等workflow。我会觉得很有帮助，有系统性的计划比没有好得多。</p>
<p><strong>Claude Mem</strong> — 跨会话记忆系统。默认情况下Claude每次对话都是全新的，有了这个它才能真正记住你。</p>
<p><strong>Context Mode</strong> — 自动管理context，提取有效信息存进本地，节省token，让它更好地理解当前任务。</p>
<p><strong>Agent Style</strong> — 英文写作规则集，去掉Claude默认输出的被动语态和AI味。</p>
<p><a href="https://www.typeless.com/refer?code=ALQEAY1">Typeless</a> 和 <a href="https://wisprflow.ai/r?YACHEN2">Wispr Flow</a>（两个都是我的referral链接，非广告，双方都可以免费一个月）。两者都不只是简单转录，会自动去掉语气词、整理结构，中英混说也能识别。</p>
<p>Wispr Flow 在 Mac 上全局可用，嵌入感更轻；Typeless 的整理能力更强，会主动帮你把一段散话归纳成结构化文字，缺点是贵。目前我还是更喜欢 Typeless，但 Wispr Flow 作为平替也可以。我也试过国产平替，效果真的不OK，用过好的就知道什么是做的不够好了。语音转录真的能让生产力同样提升一大截。</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<h2><strong>关于费用</strong></h2>
<p>我最开始用的是Pro（20美元/月），然后就会发现自己经常去看usage界面，算还剩多少额度，有时候会把5小时的限制用完。后来实在受不了，升级到了Max，现在完全不用再看这些数字了。</p>
<p>但这并不是说你一开始就需要Max。Codex的免费额度比Claude多很多，国产模型的额度也更充裕，探索期完全够用。如果你后来把Claude Code作为主力工具，我会觉得上Max是迟早的事，因为额度直接和你的生产效率挂钩，ROI非常高。</p>
<p>&nbsp;</p>
<h2><strong>最后想说的</strong></h2>
<p>AI没有帮我减少电脑使用时间。反而我用电脑的时间反而越来越长了。</p>
<p>它让学习这件事对我来说变得有意思了。以前学东西对我来说摩擦力很大，没有及时反馈，理解了也不知道理解对不对，还要来回切换页面复制粘贴。现在是有任何不懂的当场就能问，理解之后直接更新笔记，再用费曼学习法验证一遍，整个链路是打通的，完全不用离开当前页面。</p>
<p>还有一件事：想法落地的周期变得非常快了。以前有一个想法，从&quot;想做&quot;到&quot;真的去做&quot;中间要翻很多山。现在是有想法就直接和Claude聊，能不能实现、有没有人已经做了、需要什么步骤，然后就开始了。这种完全上瘾。</p>
<p>当然也有我头疼的，这个领域更新速度太快了。我曾经有一段时间非常焦虑，感觉自己永远学不完，刚看完一个教程，博主又更新了。后来慢慢想明白了：焦虑没有任何用，而且大部分最新功能其实还在迭代，未必是你马上需要的东西。更基础的工程思维、管理思维、以及把工作流SOP化，这些反而是真正能沉淀下来的东西。</p>
<p>还有一点，也是我现在越来越在意的：<strong>工作流要可迁移</strong>。Claude Code很好用，但它所有的数据和配置都绑在Claude的平台上。如果有一天Claude不再是主流，你需要能把整套工作流迁移到别的工具上。这也是为什么我会把所有的偏好、SOP、写作风格等等所有都记录在自己的Obsidian里，有一天换了工具，让新的AI读一遍这些文件，它就能完全get到我是什么样的人、想要什么样的输出。</p>
<p>工具会换，但自己的积累永远都是自己的。</p>
<p>&nbsp;</p>
<p>如果有任何人对 AI 协作、AI Agent 工具，或者任何你感兴趣的内容想和我聊聊，我非常愿意也非常欢迎。哪怕这些内容和 AI 没有任何关系也没关系，因为我本身也不是技术背景，也不是专门做 AI 协作的。<br>我蛮喜欢和不同背景的人产生一些连接，也很享受这个过程。所以 if you want，直接问我就可以了。</p>
<p>&nbsp;</p>
<p>这是最好的时代也是最坏的时代，但我还是觉得这是最好的时代。希望可以不断探索，不断进步。</p>
<p>&nbsp;</p>
<hr>

</div>
