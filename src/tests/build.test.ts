import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
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
});
