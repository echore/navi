import { describe, it, expect } from 'vitest';

// Pure helpers extracted for testing — mirrors logic in scripts/sync-notion.ts

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function countWords(markdown: string): number {
  const cjkCount = (markdown.match(/[一-鿿぀-ヿ]/g) ?? []).length;
  const enWords = markdown.replace(/[一-鿿぀-ヿ]/g, ' ').split(/\s+/).filter(Boolean).length;
  return enWords + cjkCount;
}

function calcReadTime(enMarkdown: string): number {
  return Math.max(1, Math.ceil(countWords(enMarkdown) / 200));
}

function parseSection(section: string): { title: string; body: string } | null {
  const titleMatch = section.match(/^#\s+(.+)$/m);
  if (!titleMatch) return null;
  const title = titleMatch[1].trim();
  const body = section.replace(/^#\s+.+\n?/m, '').trim();
  return { title, body };
}

describe('slugify', () => {
  it('converts EN title to slug', () => {
    expect(slugify("Don't start with AI tutorials.")).toBe('dont-start-with-ai-tutorials');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('AI & Tools: A Guide')).toBe('ai-tools-a-guide');
  });
});

describe('calcReadTime', () => {
  it('returns 1 for very short text', () => {
    expect(calcReadTime('Hello world')).toBe(1);
  });

  it('returns correct value for 400 EN words', () => {
    const text = Array(400).fill('word').join(' ');
    expect(calcReadTime(text)).toBe(2);
  });

  it('counts CJK characters as words', () => {
    const text = '这是一段中文内容，共有很多汉字。'.repeat(10);
    expect(calcReadTime(text)).toBeGreaterThan(0);
  });
});

describe('parseSection', () => {
  it('extracts title and body from section', () => {
    const section = `# My Article Title\n\nFirst paragraph.\n\nSecond paragraph.`;
    const result = parseSection(section);
    expect(result?.title).toBe('My Article Title');
    expect(result?.body).toBe('First paragraph.\n\nSecond paragraph.');
  });

  it('returns null when no # heading', () => {
    const section = `Just some text without a heading.`;
    expect(parseSection(section)).toBeNull();
  });

  it('works with Chinese title', () => {
    const section = `# 这是中文标题\n\n正文内容。`;
    const result = parseSection(section);
    expect(result?.title).toBe('这是中文标题');
    expect(result?.body).toBe('正文内容。');
  });
});

describe('full page markdown splitting', () => {
  it('splits by divider into EN and CN sections', () => {
    const fullMd = `# EN Title\n\nEN body.\n\n---\n\n# CN 标题\n\nCN body.\n\n---\n\n## 草稿\n\nIgnored.`;
    const sections = fullMd.split(/\n---+\n/);
    expect(sections.length).toBe(3);

    const enResult = parseSection(sections[0]);
    expect(enResult?.title).toBe('EN Title');
    expect(enResult?.body).toBe('EN body.');

    const cnResult = parseSection(sections[1]);
    expect(cnResult?.title).toBe('CN 标题');
    expect(cnResult?.body).toBe('CN body.');
  });
});
