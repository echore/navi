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

function extractSubsection(section: string, marker: string): string {
  const parts = section.trim().split(/\n(?=## )/);
  for (const part of parts) {
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) continue;
    const heading = part.slice(0, newlineIdx).replace(/^##\s+/, '').trim();
    if (heading === marker) return part.slice(newlineIdx).trim();
  }
  return '';
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

describe('extractSubsection', () => {
  it('extracts content under a ## marker heading', () => {
    const section = `## Title in English\n\nMy Article Title\n\n## Body in English\n\nFirst paragraph.\n\nSecond paragraph.`;
    expect(extractSubsection(section, 'Title in English')).toBe('My Article Title');
    expect(extractSubsection(section, 'Body in English')).toBe('First paragraph.\n\nSecond paragraph.');
  });

  it('returns empty string when marker not found', () => {
    const section = `## Some Other Heading\n\nContent.`;
    expect(extractSubsection(section, 'Title in English')).toBe('');
  });

  it('works with Chinese markers', () => {
    const section = `## 中文标题\n\n这是标题\n\n## 中文正文\n\n这是正文内容。`;
    expect(extractSubsection(section, '中文标题')).toBe('这是标题');
    expect(extractSubsection(section, '中文正文')).toBe('这是正文内容。');
  });
});

describe('slug collision detection', () => {
  it('two titles that differ only in punctuation produce the same slug', () => {
    expect(slugify('How I Learn')).toBe(slugify('How I Learn!!'));
  });

  it('Map-based dedup skips the second entry with identical slug', () => {
    const usedSlugs = new Map<string, string>();
    const slugA = slugify('How I Learn');
    const slugB = slugify('How I Learn!!');

    usedSlugs.set(slugA, 'notion-id-A');
    const conflict = usedSlugs.has(slugB);
    expect(conflict).toBe(true);
  });
});

describe('enBody empty guard', () => {
  it('extractSubsection returns empty string when Body in English marker is absent', () => {
    const section = `## Title in English\n\nMy Title`;
    expect(extractSubsection(section, 'Body in English')).toBe('');
  });

  it('extractSubsection returns empty string when body section exists but has no content', () => {
    const section = `## Title in English\n\nMy Title\n\n## Body in English\n\n`;
    expect(extractSubsection(section, 'Body in English')).toBe('');
  });
});

describe('full page markdown splitting', () => {
  it('parses template with ## markers and dividers', () => {
    const fullMd = [
      '## Title in English',
      '',
      "Don't start with AI tutorials",
      '',
      '## Body in English',
      '',
      'EN body content here.',
      '',
      '---',
      '',
      '## 中文标题',
      '',
      '不要从 AI 教程开始',
      '',
      '## 中文正文',
      '',
      '中文正文内容。',
      '',
      '---',
      '',
      '## 其余一切:',
      '',
      'Draft notes ignored.',
    ].join('\n');

    const sections = fullMd.split(/\n---+\n/);
    expect(sections.length).toBe(3);

    expect(extractSubsection(sections[0], 'Title in English')).toBe("Don't start with AI tutorials");
    expect(extractSubsection(sections[0], 'Body in English')).toBe('EN body content here.');
    expect(extractSubsection(sections[1], '中文标题')).toBe('不要从 AI 教程开始');
    expect(extractSubsection(sections[1], '中文正文')).toBe('中文正文内容。');
  });
});
