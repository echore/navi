import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const dist = join(process.cwd(), 'dist');

describe('build smoke test', () => {
  it('dist/index.html exists', () => {
    expect(existsSync(join(dist, 'index.html'))).toBe(true);
  });

  it('dont-start-with-ai-tutorials post HTML exists', () => {
    expect(
      existsSync(join(dist, 'posts/dont-start-with-ai-tutorials/index.html'))
    ).toBe(true);
  });

  it('conversation-to-note-skill post HTML exists', () => {
    expect(
      existsSync(join(dist, 'posts/conversation-to-note-skill/index.html'))
    ).toBe(true);
  });

  it('homepage has no social media section or language toggle', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf-8');
    expect(html).not.toContain('id="platforms"');
    expect(html).not.toContain('Find my socials');
    expect(html).not.toContain('lang-toggle');
  });

  it('homepage shows the hero directly, with no intro overlay', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf-8');
    expect(html).toContain('Be curious');
    expect(html).not.toContain('id="intro"');
  });

  it('post pages include copy button script', () => {
    const html = readFileSync(
      join(dist, 'posts/conversation-to-note-skill/index.html'),
      'utf-8'
    );
    expect(html).toContain('copy-btn');
    expect(html).toContain('navigator.clipboard');
  });

  it('dist/posts/index.html exists', () => {
    expect(existsSync(join(dist, 'posts/index.html'))).toBe(true);
  });

  it('homepage contains view-all link to /posts', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf-8');
    // Match an <a> tag that has BOTH id="lbl-viewall" and href="/posts" (order-independent)
    const hasViewAllLink =
      /<a[^>]*id="lbl-viewall"[^>]*href="\/posts"[^>]*>/.test(html) ||
      /<a[^>]*href="\/posts"[^>]*id="lbl-viewall"[^>]*>/.test(html);
    expect(hasViewAllLink).toBe(true);
  });

  it('homepage shows at most 9 posts, with view all under the grid', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf-8');
    const cards = html.match(/class="post-card"/g) ?? [];
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThanOrEqual(9);
    const gridAt = html.indexOf('id="post-grid"');
    const linkAt = html.indexOf('id="lbl-viewall"');
    expect(gridAt).toBeGreaterThan(-1);
    expect(linkAt).toBeGreaterThan(gridAt);
  });

  it('a bilingual post defaults to English and can switch; toolkit cannot', () => {
    const html = readFileSync(
      join(dist, 'posts/real-lessons-from-claude-code-codex-and-ai-agent-tools/index.html'),
      'utf-8'
    );
    expect(html).toContain('id="post-lang"');
    expect(html).toMatch(/<article[^>]*id="post-article"[^>]*lang="en"/);
    expect(html).toContain('class="lang-en"');
    expect(html).toContain('class="lang-zh"');
    expect(html).toContain('Real Lessons from Claude Code, Codex, and AI Agent Tools');
    expect(html).toContain('长文干货｜关于Claude Code Codex等Agent工具的一切');

    const toolkit = readFileSync(join(dist, 'posts/toolkit/index.html'), 'utf-8');
    expect(toolkit).not.toContain('id="post-lang"');
    expect(toolkit).toContain('AI工具资源库');
  });

  it('the A/B testing post defaults to English and includes the Chinese original', () => {
    const html = readFileSync(join(dist, 'posts/what-we-mean-by-ab-testing/index.html'), 'utf-8');
    expect(html).toContain('id="post-lang"');
    expect(html).toMatch(/<article[^>]*id="post-article"[^>]*lang="en"/);
    expect(html).toContain('What Are We Actually Talking About When We Say A/B Testing?');
    expect(html).toContain('The family photo brought in an extra $57 million.');
    expect(html).toContain('当我们在说 A/B 测试的时候，我们到底在说什么');
    expect(html).toContain('全家福那一组多募集了 5700 万美元');
  });

  it('AI infra note 01 is on the site and labeled', () => {
    const html = readFileSync(join(dist, 'posts/ai-infra-from-zero-01/index.html'), 'utf-8');
    expect(html).toContain('AI Infra Track Technology');
    expect(html).toContain('What Happens After a Prompt Enters an LLM?');
    expect(html).toContain('提示词进了 LLM 之后，发生了什么？');
    expect(html).toContain('id="post-lang"');
    expect(html).toContain('/assets/posts/ai-infra-from-zero-01/00_knowledge_tree.svg');
  });

  it('the three AI infra notes default to English and include a Chinese version', () => {
    const cases = [
      ['ai-infra-product-lens', 'What Makes AI Infrastructure Worth Using?', '到底谁需要这个？'],
      ['ai-infra-from-zero-02', 'Why Is the GPU Still a Bottleneck?', '模型放进显存，只是服务用户的第一步。'],
      ['ai-infra-from-zero-03', 'How Does an LLM Serve Thousands of Requests?', '有一个模型，还不等于有一项服务'],
    ] as const;
    for (const [slug, en, zh] of cases) {
      const html = readFileSync(join(dist, 'posts', slug, 'index.html'), 'utf-8');
      expect(html).toContain('id="post-lang"');
      expect(html).toMatch(/<article[^>]*id="post-article"[^>]*lang="en"/);
      expect(html).toContain(en);
      expect(html).toContain(zh);
      expect(html).toContain('infra-notes.css');
    }
  });

  it('home shows the nine newest posts, and /posts lists every published post', () => {
    const all = [
      'ai-infra-overview',
      'ai-infra-from-zero-01',
      'ai-infra-product-lens',
      'ai-infra-from-zero-02',
      'ai-infra-from-zero-03',
      'real-lessons-from-claude-code-codex-and-ai-agent-tools',
      'toolkit',
      'what-we-mean-by-ab-testing',
      'reflections-on-my-entrepreneurial-journey-or-side-hustle',
      'study-abroad-agencies-are-not-good-business',
      'inner-scorecard',
    ];
    const postsPage = readFileSync(join(dist, 'posts/index.html'), 'utf-8');
    const listed = [...postsPage.matchAll(/href="\/posts\/([^"]+)"/g)].map(m => m[1]);
    expect(new Set(listed)).toEqual(new Set(all));

    const home = readFileSync(join(dist, 'index.html'), 'utf-8');
    const homeLinks = [...home.matchAll(/href="\/posts\/([^"]+)"/g)].map(m => m[1]);
    expect(homeLinks).toHaveLength(9);
    expect(homeLinks[0]).toBe('ai-infra-overview');
    expect(home).toContain('AI Infra Track Technology');
    expect(home).toContain('AI Infra Track Product');
    expect(home).toContain('AI Infra · Overview');
    // The pinned overview takes the first slot, so the two oldest posts stay on /posts only.
    expect(homeLinks).not.toContain('study-abroad-agencies-are-not-good-business');
    expect(homeLinks).not.toContain('inner-scorecard');
  });

  it('the AI infra overview is pinned, bilingual, and defaults to English', () => {
    const html = readFileSync(join(dist, 'posts/ai-infra-overview/index.html'), 'utf-8');
    expect(html).toContain('id="post-lang"');
    expect(html).toMatch(/<article[^>]*id="post-article"[^>]*lang="en"/);
    expect(html).toContain('Learning AI Infrastructure');
    expect(html).toContain('An Overview of My AI Infrastructure Learning');
    expect(html).toContain('AI Infrastructure 学习总览');
    expect(html).toContain('最初的原因其实很简单');
    expect(html).toContain('infra-overview.css');
  });

  it('unlisted posts keep their URLs', () => {
    expect(
      existsSync(join(dist, 'posts/i-avoided-claude-code-for-months-because-of-one-word/index.html'))
    ).toBe(true);
  });

  it('/posts page uses list layout, not card grid', () => {
    const html = readFileSync(join(dist, 'posts/index.html'), 'utf-8');
    expect(html).toContain('list-row');
    expect(html).not.toContain('post-grid');
  });
});
