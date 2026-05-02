import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';

const postSchema = z.object({
  titleEn: z.string(),
  titleCn: z.string(),
  tag: z.enum(['AI', 'Notes']),
  date: z.coerce.date(),
  readTime: z.number(),
  slug: z.string(),
  draft: z.boolean().default(false),
});

function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error('No frontmatter found');
  const fm: Record<string, unknown> = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim().replace(/^"|"$/g, '');
    if (raw === 'true') fm[key] = true;
    else if (raw === 'false') fm[key] = false;
    else if (!isNaN(Number(raw)) && raw !== '') fm[key] = Number(raw);
    else fm[key] = raw;
  }
  return fm;
}

const postsDir = join(process.cwd(), 'src/content/posts');

describe('content schema', () => {
  it('dont-start-with-ai-tutorials.md passes schema', () => {
    const raw = readFileSync(join(postsDir, 'dont-start-with-ai-tutorials.md'), 'utf-8');
    const fm = parseFrontmatter(raw);
    const result = postSchema.safeParse(fm);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(result.data.tag).toBe('Notes');
      expect(result.data.draft).toBe(false);
      expect(result.data.readTime).toBe(3);
    }
  });

  it('conversation-to-note-skill.md passes schema', () => {
    const raw = readFileSync(join(postsDir, 'conversation-to-note-skill.md'), 'utf-8');
    const fm = parseFrontmatter(raw);
    const result = postSchema.safeParse(fm);
    expect(result.success, JSON.stringify(result)).toBe(true);
    if (result.success) {
      expect(result.data.tag).toBe('AI');
      expect(result.data.draft).toBe(false);
      expect(result.data.readTime).toBe(5);
    }
  });
});
