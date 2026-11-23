---
title: "Why Can One Model Handle So Many Tasks?"
titleZh: "为什么一个模型能做这么多任务？"
lang: en
tags: ["AI"]
date: 2026-11-23
readTime: 12
slug: mit-6s087-foundation-models
series: "MIT AI Course Notes"
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">

<div class="lang-en">
<div class="infra-note infra-note--gpu">

<p class="authorship-note">This article was summarized and organized by AI based on my original learning notes.</p>
<h2><span class="num">01</span> Why Foundation Models Are Useful</h2>
<p>Traditional machine learning often starts from one clear task. We prepare examples and labels, then train a model to solve that task. For example, the model reads an email and predicts “spam” or “not spam.”</p>
<p>A <strong>foundation model</strong> takes another route. It first learns transferable patterns from large and broad data, then applies what it learned to many downstream tasks.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-01.svg" alt="Figure 1 · Task-specific models each need their own labeled data. A foundation model starts from one broad pretraining run." loading="lazy" decoding="async" width="840" height="450"></div><figcaption>Figure 1 · Task-specific models each need their own labeled data. A foundation model starts from one broad pretraining run.</figcaption></figure>
<p>“General” here does not mean the model can do anything. It means <strong>the same pretrained parameters can become the starting point for many tasks.</strong> Actual performance still depends on the training data, the objective, later adaptation, and how the model is used.</p>
<h3>Supervised Versus Self-Supervised</h3>
<p>In <strong>supervised learning</strong>, people usually provide the labels: this picture is a “cat,” that one is a “dog.”</p>
<p><strong>Self-supervised learning</strong> builds the learning target from the data itself. Take the sentence “The cat sat on the ___.” The next word, or token, in the original text already serves as the target. Nobody has to label each example by hand.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-02.svg" alt="Figure 2 · Supervised labels come from people. Self-supervised targets, such as the next token, come from the data." loading="lazy" decoding="async" width="840" height="420"></div><figcaption>Figure 2 · Supervised labels come from people. Self-supervised targets, such as the next token, come from the data.</figcaption></figure>
<p>A typical training loop looks like this:</p>
<div class="steps"><div class="step"><div class="n">1</div><h4>Build Input and Target</h4><p>Cut raw data into an input and the target that follows from it.</p></div><div class="step"><div class="n">2</div><h4>Predict</h4><p>The model makes a prediction from the input.</p></div><div class="step"><div class="n">3</div><h4>Compute Loss and Update</h4><p>Compare the prediction with the target, backpropagate, and update the parameters.</p></div><div class="step"><div class="n">4</div><h4>Repeat at Scale</h4><p>Run the same loop over an enormous number of examples.</p></div></div>
<p>The key point: <strong>self-supervised does not mean “no labels and no target.” It means the supervision signal comes from the data itself.</strong></p>
<h3>Pretraining and Post-Training</h3>
<div class="table-wrap"><table><tbody><tr><th>Stage</th><th>What It Does</th></tr><tr><td>Pretraining</td><td>Learns statistical structure and transferable representations from large data in language, images, or other modalities.</td></tr><tr><td>Fine-tuning / instruction tuning</td><td>Fits the model to specific tasks or to an instruction format.</td></tr><tr><td>Preference optimization / RL-based post-training</td><td>Further adjusts behavior, such as answer style, instruction following, or performance on certain tasks.</td></tr></tbody></table></div>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-03.svg" alt="Figure 3 · Pretraining, fine-tuning, and preference optimization change the model for different reasons." loading="lazy" decoding="async" width="840" height="358"></div><figcaption>Figure 3 · Pretraining, fine-tuning, and preference optimization change the model for different reasons.</figcaption></figure>
<p>These stages do different jobs. A model that has learned many general patterns does not automatically answer the way users want.</p>
<h2><span class="num">02</span> Why Different Tasks Can Become Text-to-Text</h2>
<p>Text tasks look different on the surface. Classification outputs a label, translation outputs another language, and summarization outputs a shorter text. All of them can be written as <strong>text in, text out</strong>.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-04.svg" alt="Figure 4 · Sentiment, translation, and summarization written as text in and text out." loading="lazy" decoding="async" width="840" height="410"></div><figcaption>Figure 4 · Sentiment, translation, and summarization written as text in and text out.</figcaption></figure>
<p>Many tasks can then share a similar input and output format. We no longer need to design a separate prediction interface for every task.</p>
<h3>An Important Difference Between T5 and GPT</h3>
<div class="table-wrap"><table><tbody><tr><th></th><th>T5</th><th>GPT</th></tr><tr><td>Typical structure</td><td>Encoder-decoder Transformer</td><td>Decoder-only Transformer</td></tr><tr><td>How it reads input</td><td>The encoder encodes the input; the decoder generates conditioned on it.</td><td>The decoder reads the existing context under a causal attention mask and generates step by step.</td></tr><tr><td>Typical pretraining objective</td><td>Restore corrupted or masked spans of text</td><td>Predict the next token</td></tr><tr><td>Can it generate text?</td><td>Yes</td><td>Yes</td></tr></tbody></table></div>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-05.svg" alt="Figure 5 · T5 encodes the input with a separate encoder. GPT reads earlier tokens through a causal mask." loading="lazy" decoding="async" width="840" height="470"></div><figcaption>Figure 5 · T5 encodes the input with a separate encoder. GPT reads earlier tokens through a causal mask.</figcaption></figure>
<p>A misreading to avoid: the name <em>decoder-only</em> does not mean GPT cannot understand a prompt. It still processes the context across many layers. It simply <strong>has no separate encoder module like T5.</strong></p>
<p>“Every task can be written as text” also does not mean “every architecture is the same.” What is shared is the task interface, not the internal computation.</p>
<h2><span class="num">03</span> Embeddings: Putting Information Where We Can Compute With It</h2>
<p>An <strong>embedding</strong> turns a word, a sentence, an image, or another object into a vector of numbers. Vectors let the model work with relationships between objects in a mathematical space.</p>
<div class="table-wrap"><table><tbody><tr><th>Object</th><th class="r">Illustrative Vector</th></tr><tr><td>“猫的照片” (Chinese: a photo of a cat)</td><td class="r">[0.2, 0.8, …]</td></tr><tr><td>“a photo of a cat”</td><td class="r">[0.3, 0.7, …]</td></tr><tr><td>“火箭发射” (Chinese: a rocket launch)</td><td class="r">[−0.6, 0.1, …]</td></tr></tbody></table></div>
<p>These numbers are made up, not real training results. After suitable training, descriptions of similar content in different languages can end up close together, while unrelated content ends up farther away.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-06.svg" alt="Figure 6 · An illustrative embedding space. Related images and sentences cluster together, even across languages." loading="lazy" decoding="async" width="840" height="450"></div><figcaption>Figure 6 · An illustrative embedding space. Related images and sentences cluster together, even across languages.</figcaption></figure>
<p>One caution: <strong>being close in vector space does not inherently mean “same meaning.”</strong> What distance or direction means is learned gradually from the training objective and the data.</p>
<h3>Contrastive Learning: Learning What Belongs Together</h3>
<p><strong>Contrastive learning</strong> trains the representation space with pairs. A <strong>positive pair</strong> is two samples that should be related, such as a cat photo and the caption describing it. A <strong>negative pair</strong> is a relatively mismatched pair, such as the cat photo and a caption about a rocket launch.</p>
<p>The training objective gives matching pairs a higher similarity and mismatched pairs a lower one.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-07.svg" alt="Figure 7 · Illustrative similarity scores between images and captions. Matching pairs on the diagonal are pushed up." loading="lazy" decoding="async" width="840" height="462"></div><figcaption>Figure 7 · Illustrative similarity scores between images and captions. Matching pairs on the diagonal are pushed up.</figcaption></figure>
<p>This idea underpins cross-modal retrieval. A sentence can find a picture because both are mapped into a space where they can be compared.</p>
<p>A limit: the “similarity” that contrastive learning finds depends on the training data, how the positive and negative pairs were built, and the loss function. It does not equal everything people mean by similar.</p>
<h2><span class="num">04</span> Diffusion: Why Generating an Image Means Denoising Again and Again</h2>
<p>One core idea of a <strong>diffusion model</strong> is to first learn how to recover structure from noisy data, then use that skill to turn noise, step by step, into a new sample.</p>
<p>During training, we take a real image, add a chosen amount of noise, and ask the model to predict the noise or the clean signal. We compute the loss and update the parameters.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-08.svg" alt="Figure 8 · Diffusion training adds known noise to a real image and learns to predict it." loading="lazy" decoding="async" width="840" height="416"></div><figcaption>Figure 8 · Diffusion training adds known noise to a real image and learns to predict it.</figcaption></figure>
<p>During generation, we start from random noise and denoise one step, then another, until an image appears.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-09.svg" alt="Figure 9 · Generation starts from fresh noise and denoises it in steps. Training covers every noise level along the way." loading="lazy" decoding="async" width="840" height="442"></div><figcaption>Figure 9 · Generation starts from fresh noise and denoises it in steps. Training covers every noise level along the way.</figcaption></figure>
<h3>Why Training Needs Many Noise Levels</h3>
<p>If the model has only seen nearly clean images with a little noise, it may learn to fix details but not know what to do with an image that is almost pure noise.</p>
<p>Generation usually starts from heavy noise and passes through many intermediate states as it becomes clear. Training must therefore cover <strong>many noise levels</strong>, so the model learns a sensible denoising direction at every difficulty.</p>
<p>This does not mean each generation “recovers a picture that already existed.” The starting point is newly sampled noise. The model uses the structure of the data distribution it learned to turn that noise into a sample.</p>
<h3>What Diffusion and Language Models Share</h3>
<p>Both build training signals from raw data without needing a person to label each example. A <strong>language model</strong> predicts the next tokens of existing text. A <strong>diffusion model</strong> adds known noise to data and learns to remove it.</p>
<p>Their <strong>training objectives and generation methods differ</strong>. A language model usually generates autoregressively, one token at a time. A diffusion model usually generates through many denoising steps.</p>
<h2><span class="num">05</span> Why “Similar” Has More Than One Measure</h2>
<p>Suppose a face image shifts three pixels to the right. A person may see two almost identical pictures. Compared pixel by pixel, many positions have changed.</p>
<p>So <strong>pixel values being close is not the same as looking close to a person.</strong></p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-10.svg" alt="Figure 10 · A small shift looks almost identical to a person but changes the pixels along every edge." loading="lazy" decoding="async" width="840" height="374"></div><figcaption>Figure 10 · A small shift looks almost identical to a person but changes the pixels along every edge.</figcaption></figure>
<h3>Pixel Loss</h3>
<p>Pixel loss compares the generated image with the target pixel by pixel, for example with mean squared error (MSE). It is simple to define and easy to optimize. It can also be sensitive to small shifts or changes in position, and a low numerical error does not guarantee a good-looking result.</p>
<h3>Perceptual Loss</h3>
<p>Perceptual loss compares the two images in the feature space of some feature-extraction network instead of only comparing pixels. It pays more attention to closeness in textures and shapes. It is still not “human taste.” The result depends on which feature network is used.</p>
<h3>Adversarial Loss</h3>
<p>In a GAN, the generator learns to fool a discriminator. This pushes generated samples to look like samples from the real data distribution.</p>
<p>Keep the three questions apart:</p>
<div class="table-wrap"><table><tbody><tr><th>Measure</th><th>The Main Question</th></tr><tr><td>Pixel loss</td><td>How far apart are the values of matching pixels?</td></tr><tr><td>Perceptual loss</td><td>How far apart are the learned visual features?</td></tr><tr><td>Adversarial loss</td><td>Does the whole result look like it came from the real data distribution?</td></tr></tbody></table></div>
<p>A result that looks “real” and a result that “faithfully keeps the original content” are two different goals.</p>
<h2><span class="num">06</span> The Core Difference Between Autoencoders, GANs, and Diffusion</h2>
<div class="table-wrap"><table><tbody><tr><th>Method</th><th>Core Idea</th><th>Learning Focus</th></tr><tr><td>Autoencoder</td><td>Encode the input into a latent representation, then rebuild it</td><td>Representation learning and reconstruction</td></tr><tr><td>VAE</td><td>Model the latent variable as a probability distribution and constrain it</td><td>A latent structure we can sample, plus reconstruction</td></tr><tr><td>GAN</td><td>A generator and a discriminator compete</td><td>Approaching the distribution of real samples</td></tr><tr><td>Diffusion</td><td>Learn to denoise at different noise levels</td><td>Generating samples through step-by-step denoising</td></tr></tbody></table></div>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-11.svg" alt="Figure 11 · Four generative approaches, each with its own training objective." loading="lazy" decoding="async" width="840" height="376"></div><figcaption>Figure 11 · Four generative approaches, each with its own training objective.</figcaption></figure>
<p>These are different modeling approaches, not a pipeline to run in order. Some systems combine several of these ideas. To understand them, I first separate their training objectives.</p>
<h2><span class="num">07</span> Putting the Ideas Together</h2>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-12.svg" alt="Figure 12 · Three things a model can learn from raw data: transferable abilities, comparable embeddings, and a data distribution." loading="lazy" decoding="async" width="840" height="468"></div><figcaption>Figure 12 · Three things a model can learn from raw data: transferable abilities, comparable embeddings, and a data distribution.</figcaption></figure>
<div class="chain"><b>Raw data supplies its own targets</b> → self-supervised pretraining learns transferable patterns → one foundation model serves many tasks through a text-to-text interface → post-training adjusts its behavior → embeddings and contrastive learning make different modalities comparable → VAEs, GANs, and diffusion learn data distributions and generate new samples.</div>
<p>Foundation models are useful because pretraining learns abilities that transfer. Generative models can create new samples because their training objectives teach them the structure or distribution of the data. <strong>The two are related, but they are not the same concept.</strong></p>
<p>When I read about a new model now, I ask three questions. Where does its training signal come from? What does its objective reward? Is the output meant to be faithful, or only realistic?</p>
<p class="note">The figures, vectors, and similarity scores explain mechanisms. They are not outputs of a specific model. Real systems differ in data, architecture, training objectives, and post-training.</p>
<h2>Further Reading and References</h2>
<ol class="refs"><li><a href="https://ocw.mit.edu/courses/6-s087-foundation-models-and-generative-ai-january-iap-2024/" target="_blank" rel="noopener">MIT 6.S087: Foundation Models and Generative AI (OCW)</a>: The course these notes follow.</li><li><a href="https://arxiv.org/abs/2108.07258" target="_blank" rel="noopener">Bommasani et al. (2021): On the Opportunities and Risks of Foundation Models</a>: Where the term “foundation model” comes from.</li><li><a href="https://arxiv.org/abs/1910.10683" target="_blank" rel="noopener">Raffel et al. (2019): Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer</a>: The T5 paper.</li><li><a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noopener">Ouyang et al. (2022): Training Language Models to Follow Instructions with Human Feedback</a>: Instruction tuning and preference-based post-training.</li><li><a href="https://arxiv.org/abs/2103.00020" target="_blank" rel="noopener">Radford et al. (2021): Learning Transferable Visual Models from Natural Language Supervision</a>: CLIP and contrastive image-text learning.</li><li><a href="https://arxiv.org/abs/2006.11239" target="_blank" rel="noopener">Ho et al. (2020): Denoising Diffusion Probabilistic Models</a>: Training and sampling in diffusion models.</li><li><a href="https://arxiv.org/abs/1603.08155" target="_blank" rel="noopener">Johnson et al. (2016): Perceptual Losses for Real-Time Style Transfer and Super-Resolution</a>: Comparing images in feature space.</li></ol>
<div class="next"><a href="/posts/mit-6s191-deep-learning">← Previous · 01: What Does a Neural Network Actually Learn?</a></div>
</div>
</div>

<div class="lang-zh">
<div class="infra-note infra-note--gpu">

<p class="authorship-note">文章是AI 根据我的原始学习笔记总结、整理而成。</p>
<h2><span class="num">01</span> Foundation Model 为什么有用？</h2>
<p>传统机器学习经常从一个明确任务出发：准备训练样本与标签，训练一个模型解决它。例如输入邮件，预测“垃圾邮件 / 正常邮件”。</p>
<p><strong>Foundation Model（基础模型）</strong>走的是另一条路：先在大量、广泛的数据上学习可迁移的模式，再把获得的能力用于多个下游任务。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-01.svg" alt="图 1 · 专用模型各自需要自己的标注数据；基础模型从一次广泛的预训练出发。" loading="lazy" decoding="async" width="840" height="450"></div><figcaption>图 1 · 专用模型各自需要自己的标注数据；基础模型从一次广泛的预训练出发。</figcaption></figure>
<p>这里的“通用”不是说无所不能，而是说<strong>同一套预训练参数可以成为多种任务的起点</strong>。实际表现仍取决于训练数据、目标、后续适配和使用场景。</p>
<h3>Supervised 与 Self-supervised 的差别</h3>
<p><strong>监督学习（supervised learning）</strong>常由人提供标签：这张图片是“猫”，那张是“狗”。</p>
<p><strong>自监督学习（self-supervised learning）</strong>则从数据本身构造学习目标。比如一句话“The cat sat on the ___”，原始文本中的下一个词（或 token）本身就可以作为训练目标，不需要人工逐条标注“正确答案”。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-02.svg" alt="图 2 · 监督学习的标签来自人；自监督的目标（比如下一个 token）来自数据本身。" loading="lazy" decoding="async" width="840" height="420"></div><figcaption>图 2 · 监督学习的标签来自人；自监督的目标（比如下一个 token）来自数据本身。</figcaption></figure>
<p>一个典型的训练循环是：</p>
<div class="steps"><div class="step"><div class="n">1</div><h4>构造输入和目标</h4><p>从原始数据中切出输入，以及紧随其后的目标。</p></div><div class="step"><div class="n">2</div><h4>预测</h4><p>模型根据输入做出预测。</p></div><div class="step"><div class="n">3</div><h4>算 loss 并更新</h4><p>用预测与目标计算 loss，反向传播并更新参数。</p></div><div class="step"><div class="n">4</div><h4>大规模重复</h4><p>在海量样本上重复这个循环。</p></div></div>
<p>重点：<strong>Self-supervised 不是“完全没有标签、也没有目标”，而是监督信号来自数据本身。</strong></p>
<h3>预训练与后训练</h3>
<div class="table-wrap"><table><tbody><tr><th>阶段</th><th>它在做什么</th></tr><tr><td>Pretraining</td><td>通过大规模数据学习语言、图像或其他模态中的统计结构和可迁移表示。</td></tr><tr><td>Fine-tuning / Instruction tuning</td><td>让模型更适应特定任务或指令格式。</td></tr><tr><td>Preference optimization / RL-based post-training</td><td>进一步调整模型的行为偏好，例如回答风格、遵循指令或某些任务表现。</td></tr></tbody></table></div>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-03.svg" alt="图 3 · 预训练、微调和偏好优化，出于不同的原因改变模型。" loading="lazy" decoding="async" width="840" height="358"></div><figcaption>图 3 · 预训练、微调和偏好优化，出于不同的原因改变模型。</figcaption></figure>
<p>这几个阶段做的事不同：学会大量通用模式，不等于天然就会按用户希望的方式回答。</p>
<h2><span class="num">02</span> 为什么不同任务都能变成 Text-to-Text？</h2>
<p>文本任务表面不同：分类输出一个标签，翻译输出另一种语言，摘要输出更短的文本。但它们都可以统一写成<strong>输入文本 → 输出文本</strong>。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-04.svg" alt="图 4 · 情感分类、翻译和摘要，都写成输入文本、输出文本。" loading="lazy" decoding="async" width="840" height="410"></div><figcaption>图 4 · 情感分类、翻译和摘要，都写成输入文本、输出文本。</figcaption></figure>
<p>这样，多个任务可以共用相似的输入输出形式，而不需要每个任务都重新设计一套专门的预测接口。</p>
<h3>T5 和 GPT 的重要区别</h3>
<div class="table-wrap"><table><tbody><tr><th></th><th>T5</th><th>GPT</th></tr><tr><td>典型结构</td><td>Encoder–decoder Transformer</td><td>Decoder-only Transformer</td></tr><tr><td>输入如何处理</td><td>Encoder 编码输入，Decoder 以它为条件生成</td><td>Decoder 在因果注意力约束下读取已有上下文并逐步生成</td></tr><tr><td>典型预训练目标</td><td>恢复被破坏或遮盖的文本片段</td><td>预测下一个 token</td></tr><tr><td>能否做文本生成</td><td>可以</td><td>可以</td></tr></tbody></table></div>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-05.svg" alt="图 5 · T5 用独立的 encoder 编码输入；GPT 通过因果掩码读取前面的 token。" loading="lazy" decoding="async" width="840" height="470"></div><figcaption>图 5 · T5 用独立的 encoder 编码输入；GPT 通过因果掩码读取前面的 token。</figcaption></figure>
<p>不要误解：GPT 虽然叫 <em>decoder-only</em>，不代表它不能理解提示词。它仍会在多个层中处理上下文信息，只是<strong>没有 T5 那样独立的 encoder 模块</strong>。</p>
<p>也不要把“所有任务都能表示成文本”理解成“所有架构都一样”。统一的是任务接口，不是内部计算方式。</p>
<h2><span class="num">03</span> Embedding：把信息放进可以计算的空间</h2>
<p><strong>Embedding</strong> 是把词语、句子、图片等对象转换成数值向量。向量让模型可以在数学空间里处理它们之间的关系。</p>
<div class="table-wrap"><table><tbody><tr><th>对象</th><th class="r">示意向量</th></tr><tr><td>“猫的照片”</td><td class="r">[0.2, 0.8, …]</td></tr><tr><td>“a photo of a cat”</td><td class="r">[0.3, 0.7, …]</td></tr><tr><td>“火箭发射”</td><td class="r">[−0.6, 0.1, …]</td></tr></tbody></table></div>
<p>这些数字只是示意，不是实际训练结果。经过适当训练，不同语言但描述相近内容的向量可能靠近，而无关内容的向量可能更远。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-06.svg" alt="图 6 · 示意的 embedding 空间：相关的图片和句子聚在一起，跨语言也一样。" loading="lazy" decoding="async" width="840" height="450"></div><figcaption>图 6 · 示意的 embedding 空间：相关的图片和句子聚在一起，跨语言也一样。</figcaption></figure>
<p>要注意：<strong>向量靠近不是天生就代表“语义相同”。</strong>距离或方向有什么含义，是通过训练目标和数据逐渐学出来的。</p>
<h3>Contrastive learning：怎样学会“谁和谁更接近”？</h3>
<p><strong>对比学习（contrastive learning）</strong>借助配对关系训练表示空间。<strong>Positive pair</strong> 是应该彼此相关的两个样本，例如猫的图片和描述这张图片的文字；<strong>Negative pair</strong> 是相对不匹配的样本，例如猫的图片和描述火箭发射的文字。</p>
<p>训练目标让匹配对的相似度更高，不匹配对的相似度更低。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-07.svg" alt="图 7 · 图片与文字之间的示意相似度。对角线上的匹配对被推高。" loading="lazy" decoding="async" width="840" height="462"></div><figcaption>图 7 · 图片与文字之间的示意相似度。对角线上的匹配对被推高。</figcaption></figure>
<p>这种想法是跨模态检索的重要基础：可以用一句话检索图片，因为图片和文字能够被映射到可比较的表示空间。</p>
<p>一个限制：对比学习学到的“相似性”受训练数据、正负样本构造和损失函数影响，不能直接等同于人类对相似性的全部判断。</p>
<h2><span class="num">04</span> Diffusion：为什么生成图片要反复去噪？</h2>
<p><strong>扩散模型（diffusion model）</strong>的一个核心思路是：先学会怎样从有噪声的数据中恢复结构，再利用这种能力从噪声逐步生成新样本。</p>
<p>训练时：拿一张真实图片，人为加入某种程度的噪声，让模型预测噪声或干净信号，再计算 loss、更新参数。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-08.svg" alt="图 8 · 扩散模型训练：给真实图片加入已知噪声，再学着把它预测出来。" loading="lazy" decoding="async" width="840" height="416"></div><figcaption>图 8 · 扩散模型训练：给真实图片加入已知噪声，再学着把它预测出来。</figcaption></figure>
<p>生成时：从随机噪声出发，去噪一步，再去噪一步……最后得到一张图片。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-09.svg" alt="图 9 · 生成从新采样的噪声出发，一步步去噪；训练要覆盖沿途的每个噪声水平。" loading="lazy" decoding="async" width="840" height="442"></div><figcaption>图 9 · 生成从新采样的噪声出发，一步步去噪；训练要覆盖沿途的每个噪声水平。</figcaption></figure>
<h3>为什么训练要见到不同强度的噪声？</h3>
<p>如果模型只看过“几乎清晰的图片 + 一点点噪声”，它可能会修复细节，却不知道面对“几乎全是噪声”时该怎么办。</p>
<p>而生成常常要从高噪声开始，经过不同的中间状态逐步变清晰。因此训练必须覆盖<strong>多个噪声水平</strong>，让模型在不同难度下都学会合理的去噪方向。</p>
<p>这不等于每次生成都真的在“找回一张原来存在的图片”。生成的起点通常是新采样的噪声，模型利用学到的数据分布结构把它转变为样本。</p>
<h3>Diffusion 与语言模型有什么共同点？</h3>
<p>两者都能利用原始数据构造训练信号，而不必依靠人工为每个训练样本写出标签：<strong>语言模型</strong>从已有文本中预测后续 token；<strong>扩散模型</strong>在数据上加入已知噪声，让模型学习去噪。</p>
<p>但<strong>训练目标不同，生成方式也不同</strong>：前者通常逐 token 自回归生成，后者通常经过多个去噪步骤生成。</p>
<h2><span class="num">05</span> 为什么“像不像”有不止一种衡量方式？</h2>
<p>假设一张人脸图片整体向右平移了三个像素。人看起来可能觉得两张图片几乎一样；但如果逐像素对比，许多像素的位置都变了。</p>
<p>这说明：<strong>像素数值接近，不一定等于人类感知上接近。</strong></p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-10.svg" alt="图 10 · 轻微平移在人看来几乎一样，却让每条边缘上的像素都变了。" loading="lazy" decoding="async" width="840" height="374"></div><figcaption>图 10 · 轻微平移在人看来几乎一样，却让每条边缘上的像素都变了。</figcaption></figure>
<h3>Pixel loss</h3>
<p>直接比较生成图与目标图对应位置的像素差异，例如均方误差（MSE）。优点是定义直接、容易优化；局限是可能对轻微平移、结构位置变化比较敏感，数值误差低也不一定意味着视觉效果好。</p>
<h3>Perceptual loss</h3>
<p>不只看像素，而是利用某个特征提取网络得到的表示，比较两张图在特征空间里的差异。它更容易关注纹理、形状等特征层面的接近程度，但也不是“完全等同于人类审美”，效果取决于所用的特征网络。</p>
<h3>Adversarial loss</h3>
<p>在 GAN 中，让生成结果能够欺骗判别器，从而促使生成样本更像真实数据分布中的样本。</p>
<p>三个问题不要混成一个：</p>
<div class="table-wrap"><table><tbody><tr><th>评价方式</th><th>主要在问什么？</th></tr><tr><td>Pixel loss</td><td>对应像素的数值差多少？</td></tr><tr><td>Perceptual loss</td><td>学到的视觉特征差多少？</td></tr><tr><td>Adversarial loss</td><td>整体看起来是否像来自真实数据分布？</td></tr></tbody></table></div>
<p>生成结果“真实”与“忠实保留原图内容”，并不是同一个目标。</p>
<h2><span class="num">06</span> Autoencoder、GAN、Diffusion 的核心区别</h2>
<div class="table-wrap"><table><tbody><tr><th>方法</th><th>最核心的想法</th><th>学习重点</th></tr><tr><td>Autoencoder</td><td>把输入编码为 latent 表示，再重建</td><td>表示学习与重建</td></tr><tr><td>VAE</td><td>为 latent 变量建立概率分布并约束它</td><td>可采样的潜在结构与重建</td></tr><tr><td>GAN</td><td>生成器与判别器相互对抗</td><td>逼近真实样本分布</td></tr><tr><td>Diffusion</td><td>学习不同噪声水平下的去噪</td><td>通过逐步去噪生成样本</td></tr></tbody></table></div>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-11.svg" alt="图 11 · 四种生成方法，各有各的训练目标。" loading="lazy" decoding="async" width="840" height="376"></div><figcaption>图 11 · 四种生成方法，各有各的训练目标。</figcaption></figure>
<p>它们是不同的建模思路，不是一套必须依次执行的流水线。有些系统会结合其中几种思想，但理解时先把各自的训练目标分清楚。</p>
<h2><span class="num">07</span> 把这些想法串起来</h2>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s087-foundation-models/figure-12.svg" alt="图 12 · 模型能从原始数据里学到的三样东西：可迁移的能力、可比较的 embedding、数据分布。" loading="lazy" decoding="async" width="840" height="468"></div><figcaption>图 12 · 模型能从原始数据里学到的三样东西：可迁移的能力、可比较的 embedding、数据分布。</figcaption></figure>
<div class="chain"><b>原始数据自带训练目标</b> → 自监督预训练学到可迁移的模式 → 一个基础模型通过 text-to-text 接口服务多种任务 → 后训练调整它的行为 → embedding 和对比学习让不同模态可以比较 → VAE、GAN、Diffusion 学习数据分布，生成新样本。</div>
<p>基础模型之所以有用，是因为预训练能学到可迁移的能力；生成模型之所以能创造新样本，是因为它们通过不同训练目标学到了关于数据的结构或分布。<strong>两者相关，但不是同一个概念。</strong></p>
<p>现在读到一个新模型，我会问三个问题：它的训练信号从哪来？它的目标在奖励什么？输出追求的是忠实，还是只要逼真？</p>
<p class="note">图里的向量、相似度和噪声图是用来解释机制的，不是某个具体模型的输出。真实系统在数据、结构、训练目标和后训练上都各不相同。</p>
<h2>延伸阅读和参考</h2>
<ol class="refs"><li><a href="https://ocw.mit.edu/courses/6-s087-foundation-models-and-generative-ai-january-iap-2024/" target="_blank" rel="noopener">MIT 6.S087：基础模型与生成式 AI（OCW）</a>：这篇笔记跟的课程。</li><li><a href="https://arxiv.org/abs/2108.07258" target="_blank" rel="noopener">Bommasani 等人（2021）：基础模型的机遇与风险</a>：“foundation model”这个词的出处。</li><li><a href="https://arxiv.org/abs/1910.10683" target="_blank" rel="noopener">Raffel 等人（2019）：统一的 Text-to-Text Transformer</a>：T5 论文。</li><li><a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noopener">Ouyang 等人（2022）：用人类反馈训练语言模型遵循指令</a>：指令微调和基于偏好的后训练。</li><li><a href="https://arxiv.org/abs/2103.00020" target="_blank" rel="noopener">Radford 等人（2021）：CLIP</a>：图文对比学习。</li><li><a href="https://arxiv.org/abs/2006.11239" target="_blank" rel="noopener">Ho 等人（2020）：去噪扩散概率模型（DDPM）</a>：扩散模型的训练和采样。</li><li><a href="https://arxiv.org/abs/1603.08155" target="_blank" rel="noopener">Johnson 等人（2016）：Perceptual Losses</a>：在特征空间里比较图片。</li></ol>
<div class="next"><a href="/posts/mit-6s191-deep-learning">← 上一篇 · 01：神经网络到底在学什么？</a></div>
</div>
</div>
