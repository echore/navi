---
title: "当我们在说 A/B 测试的时候，我们到底在说什么"
titleEn: "What Are We Actually Talking About When We Say A/B Testing?"
lang: zh
tags: ["Thinking"]
date: 2026-08-11
readTime: 7
slug: what-we-mean-by-ab-testing
draft: false
featured: true
---

<div class="lang-en">

<h2>1. How this started</h2>
<p>I read Zhang Yiming's book, or really ByteDance's book, and it landed hard: ByteDance was a very data-driven company from the beginning. Zhang himself cares a lot about results in the data, and about iterating fast.</p>
<p>So I wanted to know how this A/B test thing, this "data-driven" thing, is actually done. Everyone knows the phrase. Why did they manage to do it?</p>
<p>To find out how to actually work that way, I kept asking an AI. I used Matt Pocock's Teach Skill plugin. It turned the questions into a few lessons. What I wanted out of them was:</p>
<ol>
<li>When: when can you run a test and let the data drive the decision?</li>
<li>How: how do you actually run a test?</li>
<li>Evaluation: how do you read the result? And when should you not believe the data?</li>
</ol>
<p>After that I thought: data and probability are just so interesting.</p>

<h2>2. When can you use a data-driven test?</h2>
<p>The main conclusion I came away with: the thing has to happen again and again.</p>
<p>A few typical examples:</p>
<ol>
<li>Thumbnail A/B tests. This is the one everyone knows. On some video sites, log in with a different account and the same creator's thumbnails look completely different. They're running an A/B test.</li>
<li>Naming a brand. When Zhang Yiming named the company and the products, he supposedly A/B tested the names. I have to hand it to him.</li>
<li>The UK tax office collecting unpaid tax. They ran a test. One group got the normal reminder letter. The other group got the same letter plus one line, roughly "most of the people around you have already paid on time." That one sentence, and the response rate went up by a lot.</li>
</ol>
<p>Obama's campaign did this with photos. There were a few options. One was a family photo. The others were different shots. The family photo brought in an extra $57 million.</p>
<p>So it isn't only the internet, or business, that can run an A/B test. You can use it in a lot of places.</p>
<p>Some things you cannot test, because you have no way to split them into two groups and compare. Should I move to another city? There is no second me, living in that other city, whose result I can look at.</p>
<p>A decision that large can still be broken into pieces you can test, or you can do an observational study.</p>
<p>Take moving. You only get one life, but ten thousand people who are a lot like you have already moved. When you can't run a randomized experiment, do the observational study from the textbook: find five people with a similar background who have been there for at least two years, and have a real conversation with them.</p>
<p>There's still survivorship bias. The people who stayed, and who are willing to talk to you, are mostly the ones who adapted. The people who moved back are holding the most useful information. It's worth going out of your way to find one or two of them.</p>

<h2>3. How do you run the test?</h2>
<p>First, the test needs one specific question and a metric. One question. Two metrics at most, and once you set them you don't get to change them. Too many metrics and you never get a concrete result. Stare at ten numbers and one of them will go up on its own. Picking that one afterwards and reporting it is lying to yourself.</p>
<p>Second, how do you split people? It has to be random. In school we learned to hold the other variables still. In life you can't, and you don't know which other variables are mixed in. Random assignment spreads all of that noise across both sides, so it cancels out.</p>
<p>Take a restaurant menu. If you want to test it in a data-driven way, run an A/B test:</p>
<ol>
<li>Keep it inside two weeks. It doesn't have to be two weeks. That's just the example.</li>
<li>Run both at the same time. Randomly show some guests the old menu and some the new one. Don't change the menu and then compare with earlier sales. Comparing in the same period means the other stuff hitting both groups is the same. Otherwise you can't tell whether it was the menu, or a holiday, or something else.</li>
</ol>
<p>How to actually carry it out:</p>
<ol>
<li>Decide the question you need answered. ByteDance, at one point, was stuck on whether to ask users for permission to read their browsing history. With permission, recommendations get more accurate. It might also scare people off.</li>
<li>Assign at random. Say 100,000 new customers a day: 50,000 get the permission ask, 50,000 don't.</li>
<li>Pick what you'll measure. Two numbers at most. For example, activation rate of new customers, and next-day retention.</li>
<li>Lock the end date before you start. Two weeks, or a month. Whoever is ahead in the middle has not won. You run the whole period, then you look.</li>
</ol>
<p>Last, how do you pick the answer? Whichever did better. If the two metrics show no difference, follow the default rule you wrote down beforehand. A tie goes to whichever is cheaper or safer. An A/B test that finds no difference is still a result. You have to accept that one too.</p>

<hr>

<h2>4. How do you read a number?</h2>
<p>I walk through it in three steps.</p>
<p><strong>1. Get the baseline straight</strong></p>
<p>A rise or a drop is compared with what? If someone mentions a discount, you ask for the original price. They say 50% off, and the thing costs one yuan. Does that matter at all? A percentage goes from what number to what number? The baseline matters. What you're comparing against matters.</p>
<p><strong>2. Who is the denominator: which pool were these people pulled from</strong></p>
<p>A disease hits 1 person in 1,000. A test is 99% accurate. You take it, and it's positive. What's the chance you actually have it? Intuition says 99%. It's about 9%. That's conditional probability, Bayes. I have definitely done this problem. The denominator, the healthy majority, is so large that a small false-alarm rate drowns the real signal.</p>
<p>Customers who bother to write a review, and users who volunteer for a test, are never ordinary people. That's a denominator problem too.</p>
<p>So any percentage is really two different questions. <strong>How many people was this measured on?</strong> That tells you whether the number is stable. <strong>Which pool were they pulled from?</strong> That tells you who the number is about.</p>
<p><strong>3. The average, the median, and the shape of the data</strong></p>
<p>When you see an average, ask where the median is. Say you want to build an app, and the average time spent is 34 minutes. Does that mean everyone uses it for about half an hour, or do most people use it for under 10 minutes, while a small group of heavy users pulls the average up? You look at the average, and you also look at the spread and the median.</p>
<p>Two more things.</p>
<p><strong>Sample size, and how much you can trust the number</strong></p>
<p>Different sample sizes are not the same kind of trust. 30% of 10 people and 30% of 100,000 people are not the same thing. A result from 20 test samples, and a result from 2,000 or 20,000, are not equally believable.</p>
<p>Once the sample is large enough, a tiny gap is also significant on a p-value. Significant does not mean it's worth changing the product for. "With a big sample, everything is significant" is not a flaw of big samples. It's the wrong test. "Significant" means "the gap is not zero." With a large enough sample, 0.01 points is not zero either. So a bigger sample is better. The cost is money, time, and more people seeing the version that might be worse. But once the sample is large, you have to change the question. Don't ask whether it's significant. Ask how big the gap is.</p>
<p>The practical version: before you start, write down one sentence. How big a difference do I need before it's worth changing something? "The reply rate has to be at least 5 points higher before I'll switch the template." Then look at where the gap lands. The whole range above 5 points: change it. The range crosses 5: you haven't measured enough. The whole range under 5: don't change it, even if it's significant.</p>
<p><strong>Probability and payoff are separate</strong></p>
<p>You may also need to weigh the payoff. Taleb's point in <em>Fooled by Randomness</em>: whether the market is heading for a bull or a bear is not the important part. If it's a bull, how much do you stand to make? If it's a bear, how much do you stand to lose? Even if a bear market is the likely one, the loss might be small, while the less likely bull market pays a lot. Then you should take the bet. That's expected value.</p>
<p>If one outcome wipes you out, you lose everything or go bankrupt, then a nice expected value is still not a reason to bet. Someone who is out of the game doesn't get another round. <strong>That's what Taleb later spells out in <em>Antifragile</em>.</strong></p>
<p>Taleb's books are really interesting too.</p>

<hr>

<h2>5. When should you not trust the data?</h2>
<p><strong>1. When the metric has been gamed</strong></p>
<p>This is the incentive problem Warren Buffett and Charlie Munger talk about. If a company sets a bad metric or KPI, people will push that number up so they can say they hit it. That does not mean the company is better, or the business is healthier.</p>
<p>Example: a support team is scored on average call length, shorter is better, and it feeds the quarterly bonus. In that setup they won't make the customer happier. They'll find ways to hang up on the difficult calls. The metric goes up. Satisfaction doesn't.</p>
<p><strong>2. A "win" that has something fake mixed in</strong></p>
<p>Fake wins come from two places. Different causes, different fixes. Keep them apart.</p>
<p>(1) False positive: the effect was never there. Luck fooled you. Even if everyone runs the experiment exactly by the rules, the results can still contain a false alarm. If, in the industry, only about 10 to 20 percent of ideas actually work, then among a pile of results that "tested as working," about one in four is fake, and the report will not tell you which. So if you're about to bet heavily on a result, the simplest fix is to run it again. A false positive has luck in it. It's hard for it to "win" twice in a row. Running it twice doesn't wipe false positives out. It makes them much less likely.</p>
<p>(2) Novelty: the effect was real at the time, and then it fades. You add a feature, the numbers look great, and it may only be that people saw something new and wanted to try it. Engagement goes up. That doesn't mean the feature itself is good. The only fix is time. (a) Run the test longer than the novelty wears off. (b) Look only at people coming back a second time.</p>
<p>Anyway, after learning this I just wanted to keep going, and I wanted to test things for real.</p>
<p>I wrote this by talking, then speech-to-text. After that I had an AI check whether I'd understood it right. I was afraid I'd got it wrong. So the AI changed some parts, and it may still read a bit like AI. I tried to clean it up.</p>

</div>

<div class="lang-zh">

<h2>一、缘起</h2>
<p>我看了张一鸣的书，或者说字节跳动的书，深深感受到了字节跳动从一开始就是一个非常数据驱动的公司。张一鸣本人也非常重视数据结果和快速迭代。</p>
<p>我就想知道，这个 A/B Test、这个数据驱动到底是怎么做的？"数据驱动"这个词人人都知道，但为什么就他们做成了呢？</p>
<p>因为想知道如何真正做到数据驱动，我就深入问了 AI（我用了 Matt pocock 的那个 Teach Skill 插件）。AI 给我用那个 skill 做了几节课，我想学的核心就是：</p>
<ol>
<li>When：什么时候可以做测试来数据驱动？</li>
<li>How：怎么去做一场测试？</li>
<li>Evaluation：怎么去读测试的结果？以及什么时候不要相信数据？</li>
</ol>
<p>学完觉得数据，概率这些都太太太有意思了🤔</p>

<h2>二、什么情况下可以应用数据驱动测试？</h2>
<p>我得到的一个核心结论是：这个事情必须是反反复复发生的。</p>
<p>几个典型的例子：</p>
<ol>
<li>封面 A/B 测试：这是大家最熟悉的。现在看一些视频网站，你如果换一个账号登录，会发现有些博主的视频封面是完全不一样的，其实他们就是在做 A/B Test。</li>
<li>品牌命名：张一鸣当时给公司和产品取名字，据说都用了 A/B Test，我是真服了。</li>
<li>英国税务局催缴税款：当时他们做了一个测试，一组用正常的催缴信写法，另一组则在信里加了一句话，大意是"你周围的绝大多数人已经按时缴税了"。就这一句话，转化率已经显著上升了。</li>
</ol>
<p>奥巴马竞选的时候，他们要选照片，也做了 A/B 测试。当时有几种方案，一种是全家福，其余几组是别的照片，结果全家福那一组多募集了 5700 万美元。</p>
<p>所以其实不仅是互联网或者商业可以做 A/B 测试，它其实可以应用到很多地方。</p>
<p>但是，有些地方肯定也是不能测的，因为你没有办法把它分为两组去对比。比如说，我要不要决定搬到另一个城市？并没有另一个我去测试在另一个城市生活的结果。</p>
<p>但是，像这种非常大的决定，其实可以把它拆成能够测试的碎片或者做观察研究。</p>
<p>拿搬家来举例：你只有一次人生，但世界上有一万个"和你像的人"已经搬过去了。你做不了随机实验的时候，就做你课本里的观察研究：找五个背景相似、搬过去两年以上的人深聊。</p>
<p>当然这里还有幸存者偏差，留在那边、愿意跟你聊的，多半是适应了的；搬回来的那些人才藏着最值钱的信息，值得专门去找一两个。</p>

<h2>三、怎么做这个测试？</h2>
<p>首先，这个测试你一定要定一个具体的问题和指标。问题只许一个；指标最多两个，而且定了之后不许换。指标太多是没办法得到具体结果的。盯着十个数看，总有一个自己会涨，事后挑那个涨的来汇报，等于自己骗自己。</p>
<p>其次，怎么分组？你必须要随机分组。我们在学校学的是控制变量法，但在生活中，我们无法控制其他变量不变，也不知道还有哪些混杂的变量。随机分组能把所有的干扰因素平摊给两边，让它们互相抵消。</p>
<p>以测试餐厅菜单为例，如果你想用数据驱动的方式来测，就做 A/B test：</p>
<ol>
<li>时间限定在两周内。不一定真的两周哈，只是举例。</li>
<li>同期进行：随机给一部分客人看旧菜单，另一部分看新菜单，而不是先换菜单再和之前的销量做对比。同期对比干扰项才是一样多的，否则你无法判断是菜单的影响，还是节假日等其他因素。</li>
</ol>
<p>关于如何执行：</p>
<ol>
<li>确定我们要回答的问题。比如字节当时在纠结是否要问用户要浏览记录的权限，要权限推荐会更准，但可能会吓跑用户。</li>
<li>设置随机数。比如每天新增 10 万客户，5 万要权限，5 万不要。</li>
<li>选定衡量指标。最多看两个数字，比如新客户激活率和次日留存率。</li>
<li>期限要提前定死。比如两周或一个月，中途无论谁领先都不算赢，一定要跑完期限再分析结果。</li>
</ol>
<p>最后，怎么选答案？看哪个效果更好。如果两个指标都没有差别，就按事先写好的默认规则走，比如打平选更便宜、更安全的那边。A/B test 的结果就是没差别，这个你也得认，对吧？</p>

<hr>

<h2>四、怎么去读一个数字？</h2>
<p>我们可以按三步来走：</p>
<p><strong>1. 弄清对比的基线（Baseline）</strong></p>
<p>高低涨幅是和什么比的？比如谈到折扣，你肯定要问原价。如果对方说降价 50%，但那其实是个 1 块钱的东西，这有任何必要吗？高低涨幅的百分比到底是从多少到多少？所以基线很重要，和什么比很重要。</p>
<p><strong>2. 明确分母是谁：这些人是从哪个池子里捞的</strong></p>
<p>某种病 1000 人里只有 1 人得，检测器 99% 准。你去测，结果阳性，你真得病的概率是多少？直觉说 99%，实际只有 9% 左右（这就是贝叶斯定理里的条件概率，我绝对做过这题。。。）分母（没病的大多数）太大，一点点误报率就把真信号淹没了。</p>
<p>会主动写点评的顾客、愿意报名测试的用户，从来都不是普通人，这也是分母问题。</p>
<p>所以看到任何百分比，其实要问两个不同的问题：<strong>这是多少人测出来的？</strong>（管准不准）<strong>这些人是从哪个池子里捞的？</strong>（管这个数算谁的）。</p>
<p><strong>3. 关注平均数、中位数与数据分布</strong></p>
<p>看到平均数，先问中位数在哪。比如你想做一个 App，得到的用户平均使用时长是 34 分钟。这个平均 34 分钟，到底是指人人都用半个小时左右，还是多数人只用了不到 10 分钟，而另外少部分的重度用户把平均值拉上去了？你不仅要看平均数，也要看数据的分布和中位数。</p>
<p>此外，还要注意以下两点：</p>
<p><strong>• 样本量的大小与可信程度</strong></p>
<p>样本量不同，可信程度完全不一样。10 个人里的 30% 和 10 万人里的 30%，完全不是一回事；拿 20 个测试样本得到的结果，和你做 2,000 个、甚至 20,000 个测试，可信程度肯定完全不一样。</p>
<p>当然，当样本足够大时，一点点的差距在 P 值上也是显著的，但显著并不代表一定值得为此去修改产品。这里要说清楚："样本大了什么都显著"并不是大样本的缺点，是判据用错了。"显著"的定义就是"差距不等于 0"，样本够大，0.01 个点也不等于 0。所以样本量其实越大越好，代价只有钱、时间、以及让更多人用到那个可能更差的版本。但样本一大，就必须换判据：别问显不显著，问差距有多大。</p>
<p>具体做法是在开测之前就写下一句话：至少要差多少，我才值得为它改东西。比如"回复率至少要高 5 个点，我才愿意换模板"。然后测完看差距落在哪：整个都在 5 个点以上才改；横跨 5 个点，说明还没测够；整个在 5 以下，就算显著也不改。</p>
<p><strong>• 概率与赔付要分开看</strong></p>
<p>我们可能还要拿赔付去计算。正如 Taleb 在《Fooled by Randomness》（随机漫步的傻瓜）中提到的一个观点：股市未来的走向是熊市还是牛市并不重要，重要的是，如果是牛市，预期的收益能有多大？如果是熊市，预期的赔付（损失）能有多大？即使未来大概率是熊市，但亏损的部分很少；而小概率的牛市能带来极大的赢钱空间，那这个时候你就应该大胆去下注。这就是期望值。</p>
<p>当然，当某种结局会让你彻底出局（亏光、破产）时，期望值再漂亮也不能下注，因为出局的人没有下一把。<strong>这正是 Taleb 后来在《反脆弱》里展开讲的事。</strong></p>
<p>Taleb的书也非常有意思。</p>

<hr>

<h2>五、什么时候别信数据？</h2>
<p><strong>1. 当指标被玩坏的时候</strong></p>
<p>其实这也是沃伦·巴菲特和查理·芒格讲的激励机制问题。如果公司定了一个不合理的指标或 KPI，员工为了交差，一定会人为地去拉高那个指标。但这并不代表公司更好了，或者业务更健康了。</p>
<p>例如：客服团队如果用"平均通话时长"来考核，且越短越好，直接挂钩季度奖金。这种情况下，客服并不会让客户更满意，而是会想尽办法挂断难缠的电话。指标上去了，用户满意度却并没有提高。</p>
<p><strong>2. 测出来的"胜利"里混着假的</strong></p>
<p>假的胜利有两个来源，病因不同，解药也不同，要分开：</p>
<p>（1）假阳性（false positive）：效应从头到尾就不存在，纯粹是运气骗了你。即使所有人都严格按照流程规定做实验，测试结果里依然可能混入假警报。按业内一两成的点子真有效率来算，一堆"测出来有效"的结果里，大约四个就有一个是假的，而且报表不会告诉你是哪个。所以如果你要根据测试结果下重注，最简单的解法就是再测一遍。因为假阳性带有运气和随机（random）成分，很难连续"赢两次"。连测两遍不能彻底消灭假阳性，但能让它的概率远远降低。</p>
<p>（2）新鲜感效应：效应当时是真的，但会退潮。你加了一个新功能，数据表现很好，但这可能只是因为用户看到新东西产生新鲜感、想去尝试，所以 engage 率（参与率）上去了，并不代表新功能本身有多好。它的解药只有时间：(a) 拉长测试时间段，让测试时长超过新鲜感时期；(b) 只看第二次来的用户（回访用户）的数据。</p>
<p>反正学完就是一整个 太有意思 想继续学 和 想狠狠在真实世界测试了！</p>
<p>本文由我自己语音转文字所写，之后由AI验证我讲的对不对（我害怕我理解有误）所以有些地方AI有修改，读起来可能有AI味。我已经尽力修改了。。。</p>

</div>
