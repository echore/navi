---
title: "What Does a Neural Network Actually Learn?"
titleZh: "神经网络到底在学什么？"
lang: en
tags: ["AI"]
date: 2026-11-23
readTime: 14
slug: mit-6s191-deep-learning
series: "MIT AI Course Notes"
draft: false
featured: true
listed: true
---

<link rel="stylesheet" href="/styles/infra-notes.css">

<div class="lang-en">
<div class="infra-note infra-note--gpu">

<p class="authorship-note">This article was summarized and organized by AI based on my original learning notes.</p>
<h2><span class="num">01</span> What a Neural Network Learns</h2>
<p>The basic computation of a neural network is small. Multiply each input by a weight, add a bias, and pass the result through an activation function.</p>
<div class="formula">z = Σ<sub>i</sub> w<sub>i</sub>x<sub>i</sub> + b,&nbsp;&nbsp;&nbsp; a = f(z)</div>
<div class="table-wrap"><table><tbody><tr><th>Part</th><th>What It Does</th></tr><tr><td>Input</td><td>The information given to the model, such as age, words, or image pixels.</td></tr><tr><td>Weight</td><td>How strongly, and in which direction, each input affects the result.</td></tr><tr><td>Bias</td><td>A learnable shift. Even when every input is 0, the output does not have to be 0.</td></tr><tr><td>Activation</td><td>Makes the computation nonlinear. Without it, many stacked linear layers still form one linear transformation.</td></tr></tbody></table></div>
<p>Take a store predicting its sales. Weather, price, and holidays each get a weight. The bias acts like a base sales level the model has learned. <strong>Weights decide how much each factor matters; the bias decides where the prediction starts.</strong></p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-01.svg" alt="Figure 1 · One artificial neuron: weighted inputs plus a bias, passed through an activation function." loading="lazy" decoding="async" width="840" height="414"></div><figcaption>Figure 1 · One artificial neuron: weighted inputs plus a bias, passed through an activation function.</figcaption></figure>
<h3>Forward Pass and Backpropagation</h3>
<p>Training repeats one loop. The <strong>forward pass</strong> uses the current parameters to compute an output. At that point nothing has been updated yet.</p>
<p>The <strong>loss</strong> measures the gap between that output and the training target. A <strong>gradient</strong> tells us how the loss would change if a parameter moved slightly, both in direction and in speed. <strong>Backpropagation</strong> uses the chain rule to compute those gradients efficiently for every parameter. An <strong>optimizer</strong> then updates the parameters. Plain gradient descent does it like this:</p>
<div class="formula">w ← w − η · ∂L / ∂w</div>
<p>Here η is the learning rate, which sets the size of each step.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-02.svg" alt="Figure 2 · One training step. The forward pass computes; learning happens when gradients update the weights." loading="lazy" decoding="async" width="840" height="416"></div><figcaption>Figure 2 · One training step. The forward pass computes; learning happens when gradients update the weights.</figcaption></figure>
<blockquote><p>The forward pass computes a result. Learning happens when the loss produces gradients and the optimizer updates the parameters.</p></blockquote>
<h2><span class="num">02</span> Why Sequences Need Memory</h2>
<p>A plain feedforward network usually treats its input as a fixed set of features. Text, speech, and motion have an order. What I see now may only make sense together with what came before.</p>
<h3>RNNs and the Hidden State</h3>
<p>A recurrent neural network (RNN) keeps a state that changes over time. The state is a compressed summary of the past:</p>
<div class="formula">h<sub>t</sub> = f(x<sub>t</sub>, h<sub>t−1</sub>)</div>
<p>x<sub>t</sub> is what the model sees at the current step. h<sub>t−1</sub> is the state left by the previous step. h<sub>t</sub> is the new state after combining the two.</p>
<p>Imagine a ball in the middle of a screen. One frame cannot tell me where it will go next. If I also know where it was a moment ago, I can estimate its speed and direction. <strong>The hidden state lets the network read the present with the past in mind.</strong></p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-03.svg" alt="Figure 3 · An RNN unrolled over four frames. The same cell passes its hidden state forward." loading="lazy" decoding="async" width="840" height="456"></div><figcaption>Figure 3 · An RNN unrolled over four frames. The same cell passes its hidden state forward.</figcaption></figure>
<p>One distinction I had blurred: <strong>a hidden state is not a hidden layer.</strong> The state changes with each position in the sequence. A layer is part of the network’s fixed structure.</p>
<h3>Why RNNs Struggle with Distant Information</h3>
<p>To train an RNN, we unroll the loop across time and compute gradients with <strong>backpropagation through time (BPTT)</strong>. The backward signal has to pass through many time steps. If the relevant derivatives are small again and again, the gradient keeps shrinking.</p>
<p>Suppose each step multiplies the gradient by 0.5. After ten steps:</p>
<div class="formula">0.5<sup>10</sup> ≈ 0.001</div>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-04.svg" alt="Figure 4 · A gradient multiplied by 0.5 at each step back in time. After ten steps, about 0.001 remains." loading="lazy" decoding="async" width="840" height="464"></div><figcaption>Figure 4 · A gradient multiplied by 0.5 at each step back in time. After ten steps, about 0.001 remains.</figcaption></figure>
<p>This is the intuition behind the <strong>vanishing gradient</strong>. It is first a training problem: the learning signal struggles to reach distant steps. It does not mean the model must instantly forget during the forward pass.</p>
<h2><span class="num">03</span> Attention: More Than One Compressed State</h2>
<p>An RNN relies on a hidden state it keeps overwriting. Attention lets the model <strong>look back at different positions, depending on what it needs right now.</strong></p>
<p>I find it easiest to read Query, Key, and Value as one lookup:</p>
<div class="table-wrap"><table><tbody><tr><th>Part</th><th>The Question It Answers</th></tr><tr><td>Query (Q)</td><td>What am I looking for right now?</td></tr><tr><td>Key (K)</td><td>What clue does each position offer, and does it match the query?</td></tr><tr><td>Value (V)</td><td>Once matched, what information do I actually take and combine?</td></tr></tbody></table></div>
<p>The model scores each Query against each Key, turns the scores into weights, and uses those weights to sum the Values:</p>
<div class="formula">Attention(Q, K, V) = softmax(<span class="frac"><span>QK<sup>T</sup></span><span>√d<sub>k</sub></span></span>) V</div>
<p>Take the sentence “This book is thick, but it reads easily.” To understand “it,” the model needs information from “book.” Attention can give that position a higher weight. It does not have to rely on one memory vector that it keeps updating.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-05.svg" alt="Figure 5 · Illustrative attention weights for “it”. The output mixes information from many positions." loading="lazy" decoding="async" width="840" height="500"></div><figcaption>Figure 5 · Illustrative attention weights for “it”. The output mixes information from many positions.</figcaption></figure>
<p>A point that is easy to miss: <strong>the output of attention is a weighted blend, not the selection of a single word.</strong></p>
<h2><span class="num">04</span> Why Images Suit CNNs</h2>
<p>Local information in an image matters. Edges, textures, and corners combine into shapes, and shapes combine into objects.</p>
<p>A <strong>convolutional neural network (CNN)</strong> slides a small, learnable filter, also called a kernel, across the image to look for one local pattern.</p>
<div class="steps"><div class="step"><div class="n">1</div><h4>Local Connections</h4><p>Look at nearby pixels first instead of mixing every pixel at once.</p></div><div class="step"><div class="n">2</div><h4>Weight Sharing</h4><p>The same filter detects the same pattern at every position in the image.</p></div><div class="step"><div class="n">3</div><h4>Layered Features</h4><p>Shallow layers may catch edges and textures. Deeper layers combine them into more complex structures.</p></div><div class="step"><div class="n">4</div><h4>A Limit</h4><p>Recognizing objects does not mean the network understands physical cause and effect.</p></div></div>
<p>A filter that detects vertical edges can work anywhere in the picture. The network does not need a separate set of parameters for every pixel position.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-06.svg" alt="Figure 6 · One 3×3 filter reused at every position produces a feature map. Deeper layers build on simpler patterns." loading="lazy" decoding="async" width="840" height="446"></div><figcaption>Figure 6 · One 3×3 filter reused at every position produces a feature map. Deeper layers build on simpler patterns.</figcaption></figure>
<h2><span class="num">05</span> From Autoencoders to VAEs: How Models Make New Things</h2>
<h3>Autoencoder: Compress, Then Rebuild</h3>
<p>The encoder turns raw data into a compact representation z. The decoder tries to rebuild the input x from z, producing x̂.</p>
<p>The <strong>latent space</strong> is the representation space the model learns. One point can encode one sample. Nearby points may share some features, but what “nearby” means depends on how the model was trained.</p>
<p>The latent space is not a hand-made coordinate system for face shape, eye size, or hair color. Some directions may carry meanings we can interpret. Nothing guarantees that every dimension has a name in human language.</p>
<h3>VAE: A Distribution Instead of a Point</h3>
<p>A plain autoencoder maps an input to one fixed z. The encoder of a <strong>variational autoencoder (VAE)</strong> outputs the parameters of an approximate posterior distribution, usually a mean μ and a standard deviation σ.</p>
<p>For example, an autoencoder might encode a picture as z = 5. A VAE might encode it as z ~ N(5, 1²) and sample from that distribution during training. A real VAE uses a multidimensional z; the single number only shows the difference between a point and a distribution.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-07.svg" alt="Figure 7 · An autoencoder encodes a point. A VAE encodes a distribution and samples z from it." loading="lazy" decoding="async" width="840" height="464"></div><figcaption>Figure 7 · An autoencoder encodes a point. A VAE encodes a distribution and samples z from it.</figcaption></figure>
<p>Why do this? Besides rebuilding inputs, a VAE tries to shape the latent space into a regular distribution we can sample. To generate something new, we sample from a chosen prior, such as a standard normal distribution, and pass the sample to the decoder.</p>
<h3>The Reparameterization Trick</h3>
<p>If we write z ~ N(μ, σ²) directly, the random draw is hard to express as a path we can differentiate with respect to the parameters. Rewrite it:</p>
<div class="formula">ε ~ N(0, 1),&nbsp;&nbsp;&nbsp; z = μ + σε</div>
<p>Now the randomness comes from ε, which does not depend on the model’s parameters. For one fixed draw of ε, z is a differentiable function of μ and σ. The reconstruction loss can flow back through z to the encoder.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-08.svg" alt="Figure 8 · Moving the randomness into ε opens a gradient path back to μ and σ." loading="lazy" decoding="async" width="840" height="448"></div><figcaption>Figure 8 · Moving the randomness into ε opens a gradient path back to μ and σ.</figcaption></figure>
<p>The intuition is to <strong>separate where the randomness lives from what the model must learn.</strong> Random operations are not all impossible to train through. This rewrite gives a low-variance gradient estimate that suits backpropagation.</p>
<h3>ELBO: Rebuild Well, Keep the Latent Space Tidy</h3>
<p>A VAE usually balances two terms. The <strong>reconstruction term</strong> asks whether z explains or rebuilds the input well. The <strong>KL divergence term</strong> asks whether the encoder’s distribution has drifted too far from the prior. A common form is the negative ELBO:</p>
<div class="formula">L = −E<sub>q<sub>φ</sub>(z|x)</sub>[log p<sub>θ</sub>(x|z)] + D<sub>KL</sub>(q<sub>φ</sub>(z|x) ‖ p(z))</div>
<p>The reconstruction term keeps useful information in the latent variables. The KL term constrains the distribution so that samples from the prior decode into reasonable results.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-09.svg" alt="Figure 9 · The two VAE loss terms trade off detail against a latent space that is easy to sample." loading="lazy" decoding="async" width="840" height="400"></div><figcaption>Figure 9 · The two VAE loss terms trade off detail against a latent space that is easy to sample.</figcaption></figure>
<p>The two pull against each other. Too strong a constraint can lose detail. Too weak a constraint can leave a latent space that is poor for generation.</p>
<h3>GAN: Another Way to Learn Generation</h3>
<p>A <strong>generative adversarial network (GAN)</strong> has two networks. The <strong>generator</strong> makes samples from noise or other input. The <strong>discriminator</strong> tries to tell real samples from generated ones.</p>
<p>The generator keeps learning to fool the discriminator, and the discriminator keeps learning to catch it. This contest pushes the generated distribution toward the real data distribution.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-10.svg" alt="Figure 10 · A generator and a discriminator train against each other." loading="lazy" decoding="async" width="840" height="458"></div><figcaption>Figure 10 · A generator and a discriminator train against each other.</figcaption></figure>
<p>GANs and VAEs are not steps in one pipeline. A VAE emphasizes probabilistic latent variables and reconstruction. A GAN generates through an adversarial objective.</p>
<h2><span class="num">06</span> Reinforcement Learning: Choosing, Not Only Predicting</h2>
<p>The earlier sections predict answers. Reinforcement learning (RL) learns to choose actions. It has five basic parts:</p>
<div class="table-wrap"><table><tbody><tr><th>Term</th><th>Meaning</th></tr><tr><td>State (s)</td><td>The current situation.</td></tr><tr><td>Action (a)</td><td>A move the agent can make.</td></tr><tr><td>Reward (r)</td><td>Feedback from one step.</td></tr><tr><td>Policy (π)</td><td>How the agent chooses an action in a given state.</td></tr><tr><td>Return (G)</td><td>The total reward from a sequence of actions, usually discounted.</td></tr></tbody></table></div>
<h3>A Q-Value Is Not the Immediate Reward</h3>
<div class="formula">Q<sup>π</sup>(s, a) = E<sub>π</sub>[ Σ<sub>k=0</sub><sup>∞</sup> γ<sup>k</sup> r<sub>t+k+1</sub> | s<sub>t</sub> = s, a<sub>t</sub> = a ]</div>
<p>Q(s, a) asks: if I take action a now and then follow policy π, <strong>how much future reward do I expect in total?</strong></p>
<p>Here is the simplest case, with a discount factor γ = 0.9:</p>
<div class="table-wrap"><table><tbody><tr><th>Choice</th><th class="r">Reward Now</th><th class="r">Reward Next Step</th><th class="r">Return</th></tr><tr><td>A</td><td class="r">5</td><td class="r">0</td><td class="r">5</td></tr><tr><td>B</td><td class="r">0</td><td class="r">10</td><td class="r">0 + 0.9 × 10 = 9</td></tr></tbody></table></div>
<p>B pays nothing right away and may still be the better choice.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-11.svg" alt="Figure 11 · The agent and environment loop. Action B earns nothing at first but has the higher return." loading="lazy" decoding="async" width="840" height="440"></div><figcaption>Figure 11 · The agent and environment loop. Action B earns nothing at first but has the higher return.</figcaption></figure>
<h3>What Q-Learning and Policy Learning Learn</h3>
<p><strong>Value-based methods</strong>, including Q-based ones, learn estimates of how good states or state-action pairs are, then choose actions from those estimates. <strong>Policy-based methods</strong> directly optimize how to choose actions, for example the probability distribution π(a|s).</p>
<p>The two are not strict opposites. Actor-critic methods combine a policy with a value estimate.</p>
<h3>Exploration Versus Exploitation</h3>
<p>Suppose the agent already believes that going right succeeds most often, so it almost always goes right. It may never discover that a detour to the left brings a higher long-term return.</p>
<p><strong>Exploitation</strong> uses the policy that currently looks best. <strong>Exploration</strong> tries uncertain actions that might be better. Good learning usually balances the two; otherwise the agent can settle early on a worse policy.</p>
<h3>Credit Assignment: Which Step Deserves the Credit?</h3>
<p>In a long task the reward may arrive late, while the decisions that shaped it came early.</p>
<p>A coding agent first understands the request, edits files, runs tests, finds an error, and finally succeeds. We cannot give all the credit to the last test run. We need to judge which early decisions actually raised the chance of success.</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-12.svg" alt="Figure 12 · A coding agent receives one reward at the end. Credit has to travel back to earlier steps." loading="lazy" decoding="async" width="840" height="392"></div><figcaption>Figure 12 · A coding agent receives one reward at the end. Credit has to travel back to earlier steps.</figcaption></figure>
<p><strong>Credit assignment</strong> is the problem of spreading delayed feedback back to the states and actions that came before it. The longer the task, the sparser the feedback, and the more complex the process, the harder it usually gets.</p>
<h2><span class="num">07</span> Putting the Ideas Together</h2>
<div class="chain"><b>A neuron weighs its inputs</b> → the loss measures the error → backpropagation computes gradients → the optimizer updates weights → RNNs carry a hidden state, attention looks back by weight → CNNs reuse local filters across an image → VAEs and GANs learn to generate new samples → RL learns which actions pay off over time.</div>
<div class="table-wrap"><table><tbody><tr><th>Question</th><th>Concept</th><th>The One Thing to Remember</th></tr><tr><td>How does a network improve?</td><td>Loss, gradient, backpropagation</td><td>The forward pass predicts, backpropagation computes gradients, the optimizer updates.</td></tr><tr><td>How does it handle order?</td><td>RNN, hidden state, attention</td><td>Keep a summary of the past, or look back at relevant positions.</td></tr><tr><td>How does it read images?</td><td>CNN</td><td>Local filters with shared weights.</td></tr><tr><td>How does it generate?</td><td>VAE, GAN</td><td>Learn a probabilistic latent structure, or learn through an adversary.</td></tr><tr><td>How does it decide over many steps?</td><td>Q-value, policy, credit assignment</td><td>Look past the immediate reward to the long-term result.</td></tr></tbody></table></div>
<p>When I meet a new model now, I ask four questions. What does it compute in the forward pass? What does the loss reward? How does the signal travel back? What structure does the architecture build in before training starts?</p>
<p class="note">The figures, weights, and reward values explain mechanisms. They are not taken from a trained model or a benchmark. Real networks have far more parameters, and their behavior depends on data, architecture, and training details.</p>
<h2>Further Reading and References</h2>
<ol class="refs"><li><a href="http://introtodeeplearning.com/" target="_blank" rel="noopener">MIT 6.S191: Introduction to Deep Learning</a>: The course these notes follow, with lecture videos and slides.</li><li><a href="https://arxiv.org/abs/1211.5063" target="_blank" rel="noopener">Pascanu et al. (2013): On the Difficulty of Training Recurrent Neural Networks</a>: Vanishing and exploding gradients in RNNs.</li><li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Vaswani et al. (2017): Attention Is All You Need</a>: The Transformer and scaled dot-product attention.</li><li><a href="https://arxiv.org/abs/1603.07285" target="_blank" rel="noopener">Dumoulin and Visin (2016): A Guide to Convolution Arithmetic</a>: How filters, strides, and padding shape a feature map.</li><li><a href="https://arxiv.org/abs/1312.6114" target="_blank" rel="noopener">Kingma and Welling (2013): Auto-Encoding Variational Bayes</a>: The VAE, the ELBO, and the reparameterization trick.</li><li><a href="https://arxiv.org/abs/1406.2661" target="_blank" rel="noopener">Goodfellow et al. (2014): Generative Adversarial Networks</a>: The original GAN formulation.</li><li><a href="http://incompleteideas.net/book/the-book-2nd.html" target="_blank" rel="noopener">Sutton and Barto: Reinforcement Learning, An Introduction</a>: Returns, value functions, and policies.</li></ol>
<div class="next"><a href="/posts/mit-6s087-foundation-models">Next · 02: Why Can One Model Handle So Many Tasks? →</a></div>
</div>
</div>

<div class="lang-zh">
<div class="infra-note infra-note--gpu">

<p class="authorship-note">文章是AI 根据我的原始学习笔记总结、整理而成。</p>
<h2><span class="num">01</span> 神经网络究竟在学什么？</h2>
<p>神经网络最基本的计算很小：每个输入乘一个权重，加上偏置，再经过激活函数。</p>
<div class="formula">z = Σ<sub>i</sub> w<sub>i</sub>x<sub>i</sub> + b,&nbsp;&nbsp;&nbsp; a = f(z)</div>
<div class="table-wrap"><table><tbody><tr><th>部分</th><th>它在做什么</th></tr><tr><td>输入（input）</td><td>交给模型的信息，例如年龄、文字、图片像素。</td></tr><tr><td>权重（weight）</td><td>决定每个输入以多大力度、什么方向影响结果。</td></tr><tr><td>偏置（bias）</td><td>额外的可学习平移量。即使所有输入为 0，输出也不一定是 0。</td></tr><tr><td>激活函数（activation）</td><td>把线性计算变成非线性表达。否则堆叠再多线性层，本质上仍只是一个线性变换。</td></tr></tbody></table></div>
<p>举个例子：预测一家店的销量。天气、价格、节假日各有各的权重；bias 则像模型学到的一个基础销量水平。<strong>权重决定每个因素的影响，bias 决定整体起点。</strong></p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-01.svg" alt="图 1 · 一个人工神经元：输入加权求和、加上偏置，再经过激活函数。" loading="lazy" decoding="async" width="840" height="414"></div><figcaption>图 1 · 一个人工神经元：输入加权求和、加上偏置，再经过激活函数。</figcaption></figure>
<h3>前向传播与反向传播</h3>
<p>训练是一个不断重复的循环。<strong>前向传播（forward pass）</strong>用当前参数算出输出，只是“算一遍”，参数还没更新。</p>
<p><strong>Loss</strong> 衡量输出和训练目标之间的差距。<strong>梯度（gradient）</strong>告诉我们：参数发生微小变化时，loss 会朝哪个方向、以多快的速度变化。<strong>反向传播（backpropagation）</strong>利用链式法则，高效算出每个参数的梯度。最后由<strong>优化器（optimizer）</strong>更新参数，最朴素的梯度下降是这样：</p>
<div class="formula">w ← w − η · ∂L / ∂w</div>
<p>η 是 learning rate，决定每一步迈多大。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-02.svg" alt="图 2 · 一次训练循环。前向传播只负责计算，学习发生在梯度更新权重的时候。" loading="lazy" decoding="async" width="840" height="416"></div><figcaption>图 2 · 一次训练循环。前向传播只负责计算，学习发生在梯度更新权重的时候。</figcaption></figure>
<blockquote><p>前向传播是计算结果；学习发生在根据 loss 算出梯度、再由优化器更新参数的过程中。</p></blockquote>
<h2><span class="num">02</span> 处理序列：为什么需要记忆？</h2>
<p>普通前馈网络通常把输入当成固定的一组特征。但文字、语音、动作轨迹有先后顺序：眼前的信息，可能要结合过去才能理解。</p>
<h3>RNN 与 hidden state</h3>
<p>循环神经网络（RNN）用一个随时间变化的状态，保存对过去信息的压缩表示：</p>
<div class="formula">h<sub>t</sub> = f(x<sub>t</sub>, h<sub>t−1</sub>)</div>
<p>x<sub>t</sub> 是当前时刻看到的信息，h<sub>t−1</sub> 是上一时刻留下的状态，h<sub>t</sub> 是结合新输入之后更新的状态。</p>
<p>比如只知道球此刻在屏幕中央，不一定能判断它下一刻往哪走；如果还知道它刚才在哪，就更容易推断速度和方向。<strong>hidden state 承担的就是“带着历史信息看现在”的作用。</strong></p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-03.svg" alt="图 3 · 把 RNN 沿四帧展开。同一个单元一步步把 hidden state 往后传。" loading="lazy" decoding="async" width="840" height="456"></div><figcaption>图 3 · 把 RNN 沿四帧展开。同一个单元一步步把 hidden state 往后传。</figcaption></figure>
<p>一个我之前混在一起的点：<strong>hidden state（状态）不是 hidden layer（网络层）。</strong>前者随序列位置变化，后者是网络结构的一部分。</p>
<h3>RNN 为什么难以记住很久以前的信息？</h3>
<p>训练 RNN 时，要把循环沿时间展开，用<strong>随时间反向传播（BPTT）</strong>计算梯度。反向信号要连续穿过很多时间步；如果相关的导数一再很小，梯度就会越来越小。</p>
<p>假设梯度每往回一步都乘以 0.5，10 步后只剩下：</p>
<div class="formula">0.5<sup>10</sup> ≈ 0.001</div>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-04.svg" alt="图 4 · 梯度每往回一步乘以 0.5，十步之后只剩约 0.001。" loading="lazy" decoding="async" width="840" height="464"></div><figcaption>图 4 · 梯度每往回一步乘以 0.5，十步之后只剩约 0.001。</figcaption></figure>
<p>这就是<strong>梯度消失（vanishing gradient）</strong>的直觉。它首先是训练中学习信号难以传回远处的问题，不能简单理解为模型在前向计算时“必然瞬间忘记”。</p>
<h2><span class="num">03</span> Attention：不只是把历史压缩成一个状态</h2>
<p>RNN 依靠不断更新的 hidden state。Attention 则允许模型<strong>根据当前需要，动态查看不同位置的信息。</strong></p>
<p>我觉得把 Query、Key、Value 理解成一次检索最好懂：</p>
<div class="table-wrap"><table><tbody><tr><th>部分</th><th>它回答的问题</th></tr><tr><td>Query（Q）</td><td>我现在想找什么？</td></tr><tr><td>Key（K）</td><td>每个位置能提供什么线索，和查询匹不匹配？</td></tr><tr><td>Value（V）</td><td>匹配之后，真正要取用和汇总的信息是什么？</td></tr></tbody></table></div>
<p>模型根据 Query 和 Key 算出匹配程度，变成权重，再用这些权重对 Value 加权求和：</p>
<div class="formula">Attention(Q, K, V) = softmax(<span class="frac"><span>QK<sup>T</sup></span><span>√d<sub>k</sub></span></span>) V</div>
<p>比如“这本书很厚，但它很好读”。理解“它”时，需要“这本书”的信息。Attention 可以给那个位置更高的权重，而不必只依靠一个不断被改写的记忆向量。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-05.svg" alt="图 5 · 读到“it（它）”时的示意注意力权重。输出混合了多个位置的信息。" loading="lazy" decoding="async" width="840" height="500"></div><figcaption>图 5 · 读到“it（它）”时的示意注意力权重。输出混合了多个位置的信息。</figcaption></figure>
<p>一个容易混淆的点：<strong>Attention 的输出不是“选中一个词”，而是从多个位置取得信息，按权重混合。</strong></p>
<h2><span class="num">04</span> 图像为什么适合 CNN？</h2>
<p>图像里的局部信息有意义：边缘、纹理、角点可以组合成形状，形状再组合成物体。</p>
<p><strong>卷积神经网络（CNN）</strong>的核心，是让一个小的、可学习的过滤器（filter / kernel）在图像上滑动，寻找某种局部模式。</p>
<div class="steps"><div class="step"><div class="n">1</div><h4>局部连接</h4><p>先看附近的像素，而不是一上来就把所有像素混在一起。</p></div><div class="step"><div class="n">2</div><h4>权重共享</h4><p>同一个过滤器在图像的不同位置检测同一种模式。</p></div><div class="step"><div class="n">3</div><h4>层级特征</h4><p>浅层可能捕捉边缘和纹理，深层把它们组合成更复杂的结构。</p></div><div class="step"><div class="n">4</div><h4>一个限制</h4><p>会识别图像里的物体，不自动意味着理解物理因果关系。</p></div></div>
<p>一个识别竖直边缘的过滤器可以在整张图的任何区域工作，不必针对每个像素位置重新学一套参数。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-06.svg" alt="图 6 · 同一个 3×3 过滤器在每个位置重复使用，得到特征图；深层在简单模式之上继续组合。" loading="lazy" decoding="async" width="840" height="446"></div><figcaption>图 6 · 同一个 3×3 过滤器在每个位置重复使用，得到特征图；深层在简单模式之上继续组合。</figcaption></figure>
<h2><span class="num">05</span> 从 Autoencoder 到 VAE：模型怎样生成新东西？</h2>
<h3>Autoencoder：先压缩，再重建</h3>
<p>Encoder 把原始数据转成较紧凑的表示 z；Decoder 尝试根据 z 重建输入 x，得到 x̂。</p>
<p><strong>潜在空间（latent space）</strong>是模型学出来的表示空间。一个点可以对应一个样本的编码；附近的点可能有某些相似特征，但“靠近”具体意味着什么，取决于训练方式。</p>
<p>Latent space 不等于人工定义好的“脸型、眼睛大小、发色”坐标系。某些方向可能有可解释的含义，但不能保证每个维度都能直接用人类语言命名。</p>
<h3>VAE：输出的不是一个点，而是一个分布</h3>
<p>普通 Autoencoder 把输入映射到一个确定的 z；<strong>变分自编码器（VAE）</strong>的 Encoder 则输出一个近似后验分布的参数，常见的是均值 μ 和标准差 σ。</p>
<p>比如普通 Autoencoder 把某张图片编码为 z = 5；VAE 则说这张图片对应 z ~ N(5, 1²)，训练时从这个分布里抽样。真实 VAE 的 z 通常是多维向量，这里的数字只为说明“点”和“分布”的区别。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-07.svg" alt="图 7 · Autoencoder 编码出一个点；VAE 编码出一个分布，再从中抽样 z。" loading="lazy" decoding="async" width="840" height="464"></div><figcaption>图 7 · Autoencoder 编码出一个点；VAE 编码出一个分布，再从中抽样 z。</figcaption></figure>
<p>为什么要这样做？VAE 除了重建，还尝试让潜在空间形成一个有规律、可以采样的分布。生成新样本时，从设定的 prior（例如标准正态分布）抽样，再交给 Decoder。</p>
<h3>Reparameterization trick：为什么随机抽样也能训练？</h3>
<p>如果直接写 z ~ N(μ, σ²)，随机采样这一步不容易表达成一条能对参数求导的路径。改写成：</p>
<div class="formula">ε ~ N(0, 1),&nbsp;&nbsp;&nbsp; z = μ + σε</div>
<p>随机性来自与模型参数无关的 ε。固定一次抽出的 ε 后，z 就是 μ 和 σ 的可微函数，重建损失可以经过 z 回传到 Encoder。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-08.svg" alt="图 8 · 把随机性挪到 ε 上，梯度就有路可以回到 μ 和 σ。" loading="lazy" decoding="async" width="840" height="448"></div><figcaption>图 8 · 把随机性挪到 ε 上，梯度就有路可以回到 μ 和 σ。</figcaption></figure>
<p>直觉是：<strong>把“随机在哪里”与“模型需要学什么”分开。</strong>并不是所有随机操作都绝对不能训练，而是这种改写提供了一种低方差、方便反向传播的梯度估计方式。</p>
<h3>ELBO：重建得好，还要让 latent 空间规整</h3>
<p>VAE 训练时通常兼顾两件事。<strong>重建项（reconstruction term）</strong>问：用 z 能不能把输入解释或重建好？<strong>KL 散度项</strong>问：Encoder 给出的分布，和设定的 prior 是不是偏得太远？常见的负 ELBO 损失是：</p>
<div class="formula">L = −E<sub>q<sub>φ</sub>(z|x)</sub>[log p<sub>θ</sub>(x|z)] + D<sub>KL</sub>(q<sub>φ</sub>(z|x) ‖ p(z))</div>
<p>重建项让潜在变量保留有用信息；KL 项约束分布，帮助我们从 prior 采样时生成合理的样本。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-09.svg" alt="图 9 · VAE 损失里的两项，在保留细节和潜在空间好不好采样之间取舍。" loading="lazy" decoding="async" width="840" height="400"></div><figcaption>图 9 · VAE 损失里的两项，在保留细节和潜在空间好不好采样之间取舍。</figcaption></figure>
<p>两者之间存在权衡：限制太强可能损失细节，限制太弱则潜在空间可能不利于生成。</p>
<h3>GAN：换一种方式学习生成</h3>
<p><strong>生成对抗网络（GAN）</strong>由两个网络构成。<strong>Generator</strong> 从输入噪声等信息生成样本；<strong>Discriminator</strong> 尝试区分真实样本和生成样本。</p>
<p>生成器不断学习骗过判别器，判别器不断学习识别真假。这样的对抗训练让生成分布向真实数据分布靠近。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-10.svg" alt="图 10 · 生成器和判别器相互对抗地训练。" loading="lazy" decoding="async" width="840" height="458"></div><figcaption>图 10 · 生成器和判别器相互对抗地训练。</figcaption></figure>
<p>GAN 与 VAE 不是必须串起来的步骤：VAE 强调概率潜变量与重建，GAN 强调通过对抗目标进行生成。</p>
<h2><span class="num">06</span> 强化学习：学会选择，而不是只预测答案</h2>
<p>前面几节都在预测答案；强化学习（RL）学的是怎么选动作。它有五个基本要素：</p>
<div class="table-wrap"><table><tbody><tr><th>术语</th><th>含义</th></tr><tr><td>State（s）</td><td>当前处境。</td></tr><tr><td>Action（a）</td><td>可以采取的动作。</td></tr><tr><td>Reward（r）</td><td>某一步得到的反馈。</td></tr><tr><td>Policy（π）</td><td>在某个状态下如何选择动作。</td></tr><tr><td>Return（G）</td><td>一段行动带来的累计（通常折扣后）奖励。</td></tr></tbody></table></div>
<h3>Q-value 不等于眼前奖励</h3>
<div class="formula">Q<sup>π</sup>(s, a) = E<sub>π</sub>[ Σ<sub>k=0</sub><sup>∞</sup> γ<sup>k</sup> r<sub>t+k+1</sub> | s<sub>t</sub> = s, a<sub>t</sub> = a ]</div>
<p>Q(s, a) 关注的是：现在做动作 a，之后按照策略 π 行动，<strong>预计总共能得到多少未来奖励？</strong></p>
<p>举个最简单的例子，折扣因子 γ = 0.9：</p>
<div class="table-wrap"><table><tbody><tr><th>选择</th><th class="r">眼前奖励</th><th class="r">下一步奖励</th><th class="r">回报</th></tr><tr><td>A</td><td class="r">5</td><td class="r">0</td><td class="r">5</td></tr><tr><td>B</td><td class="r">0</td><td class="r">10</td><td class="r">0 + 0.9 × 10 = 9</td></tr></tbody></table></div>
<p>B 即使眼前没有奖励，也可能更值得选。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-11.svg" alt="图 11 · 智能体与环境的循环。B 一开始没有奖励，但总回报更高。" loading="lazy" decoding="async" width="840" height="440"></div><figcaption>图 11 · 智能体与环境的循环。B 一开始没有奖励，但总回报更高。</figcaption></figure>
<h3>Q-learning 和 Policy learning 在学什么？</h3>
<p><strong>Value / Q-based 方法</strong>学习状态或状态-动作的价值估计，再依据价值选择动作。<strong>Policy-based 方法</strong>直接优化如何选择动作，例如 π(a|s) 这个概率分布。</p>
<p>二者不是绝对对立的。Actor–critic 方法就把策略和价值估计结合在一起。</p>
<h3>Exploration vs. Exploitation</h3>
<p>如果模型已经认为“向右”成功率高，于是几乎一直向右，它就很难发现“向左绕一下”可能带来更高的长期回报。</p>
<p><strong>Exploitation</strong> 是利用当前看起来最好的策略；<strong>Exploration</strong> 是尝试还不确定、可能更好的动作。好的学习过程通常要在二者之间权衡，否则容易过早锁定次优策略。</p>
<h3>Credit assignment：成功到底该归功于哪一步？</h3>
<p>长任务里的奖励可能很晚才出现，但影响结果的动作往往发生在前面。</p>
<p>比如 Coding Agent 先理解需求、修改文件、运行测试、定位错误，最后任务成功。我们不能把全部功劳简单记在“最后一次运行测试”上，而要设法判断哪些早期决策真正提高了成功的可能性。</p>
<figure class="fig wide"><div class="svg-scroll"><img src="/assets/posts/mit-6s191-deep-learning/figure-12.svg" alt="图 12 · Coding Agent 只在最后得到一次奖励，功劳要往回分给前面的步骤。" loading="lazy" decoding="async" width="840" height="392"></div><figcaption>图 12 · Coding Agent 只在最后得到一次奖励，功劳要往回分给前面的步骤。</figcaption></figure>
<p><strong>信用分配（credit assignment）</strong>就是：怎样把延迟出现的反馈，合理分配给之前的状态和动作。任务越长、反馈越少、过程越复杂，通常越难。</p>
<h2><span class="num">07</span> 把这些想法串起来</h2>
<div class="chain"><b>神经元给输入加权</b> → loss 衡量误差 → 反向传播算出梯度 → 优化器更新权重 → RNN 带着 hidden state 往前走，attention 按权重回看 → CNN 在整张图上复用局部过滤器 → VAE 和 GAN 学会生成新样本 → 强化学习学会哪些动作长期来看更划算。</div>
<div class="table-wrap"><table><tbody><tr><th>关键问题</th><th>对应概念</th><th>最值得记住的一点</th></tr><tr><td>神经网络如何改进？</td><td>Loss、gradient、backpropagation</td><td>前向计算预测，反向传播梯度，优化器更新参数。</td></tr><tr><td>如何理解有顺序的信息？</td><td>RNN、hidden state、attention</td><td>保存过去信息，或动态关注相关位置。</td></tr><tr><td>如何提取图像特征？</td><td>CNN</td><td>局部过滤器和权重共享。</td></tr><tr><td>如何生成新样本？</td><td>VAE、GAN</td><td>学潜在概率结构，或通过对抗学习生成分布。</td></tr><tr><td>如何在多步任务里做决策？</td><td>Q-value、policy、credit assignment</td><td>不只看即时奖励，更要看长期结果。</td></tr></tbody></table></div>
<p>现在遇到一个新模型，我会问四个问题：前向传播在算什么？loss 奖励的是什么？信号怎么传回去？结构在训练开始前，已经替模型预设了什么？</p>
<p class="note">图里的权重、注意力分数和奖励数值是用来解释机制的，不是来自某个训练好的模型或 benchmark。真实网络的参数多得多，表现取决于数据、结构和训练细节。</p>
<h2>延伸阅读和参考</h2>
<ol class="refs"><li><a href="http://introtodeeplearning.com/" target="_blank" rel="noopener">MIT 6.S191：深度学习导论</a>：这篇笔记跟的课程，有讲座视频和课件。</li><li><a href="https://arxiv.org/abs/1211.5063" target="_blank" rel="noopener">Pascanu 等人（2013）：训练循环神经网络的困难</a>：RNN 里的梯度消失和梯度爆炸。</li><li><a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Vaswani 等人（2017）：Attention Is All You Need</a>：Transformer 和缩放点积注意力。</li><li><a href="https://arxiv.org/abs/1603.07285" target="_blank" rel="noopener">Dumoulin 和 Visin（2016）：卷积运算指南</a>：过滤器、步长和填充怎样决定特征图。</li><li><a href="https://arxiv.org/abs/1312.6114" target="_blank" rel="noopener">Kingma 和 Welling（2013）：Auto-Encoding Variational Bayes</a>：VAE、ELBO 和 reparameterization trick。</li><li><a href="https://arxiv.org/abs/1406.2661" target="_blank" rel="noopener">Goodfellow 等人（2014）：生成对抗网络</a>：最早的 GAN 论文。</li><li><a href="http://incompleteideas.net/book/the-book-2nd.html" target="_blank" rel="noopener">Sutton 和 Barto：《强化学习导论》</a>：回报、价值函数和策略。</li></ol>
<div class="next"><a href="/posts/mit-6s087-foundation-models">下一篇 · 02：为什么一个模型能做这么多任务？ →</a></div>
</div>
</div>
