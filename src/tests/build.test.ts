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

  it('home and /posts list only the selected posts', () => {
    const selected = [
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
