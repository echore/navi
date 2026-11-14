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

  it('home and /posts list only the selected posts', () => {
    const selected = [
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
    for (const page of ['index.html', 'posts/index.html']) {
      const html = readFileSync(join(dist, page), 'utf-8');
      const linked = [...html.matchAll(/href="\/posts\/([^"]+)"/g)].map(m => m[1]);
      expect(new Set(linked)).toEqual(new Set(selected));
    }
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
