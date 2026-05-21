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

  it('CN nav uses 社交媒体, not 找到我', () => {
    const html = readFileSync(join(dist, 'index.html'), 'utf-8');
    expect(html).toContain('社交媒体');
    expect(html).not.toContain('找到我');
  });

  it('intro overlay uses 55px font size', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/components/Hero.astro'),
      'utf-8'
    );
    const il1Match = src.match(/\.il1\s*\{[^}]*font-size:\s*(\d+px)/);
    const il2Match = src.match(/\.il2\s*\{[^}]*font-size:\s*(\d+px)/);
    expect(il1Match?.[1]).toBe('55px');
    expect(il2Match?.[1]).toBe('55px');
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

  it('/posts page uses list layout, not card grid', () => {
    const html = readFileSync(join(dist, 'posts/index.html'), 'utf-8');
    expect(html).toContain('list-row');
    expect(html).not.toContain('post-grid');
  });
});
