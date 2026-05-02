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

  it('post pages include copy button script', () => {
    const html = readFileSync(
      join(dist, 'posts/conversation-to-note-skill/index.html'),
      'utf-8'
    );
    expect(html).toContain('copy-btn');
    expect(html).toContain('navigator.clipboard');
  });
});
