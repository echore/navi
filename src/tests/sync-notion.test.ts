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

function findMarkerLine(text: string, marker: string): { start: number; afterHeading: number } | null {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|\\n)## ${escaped}\\s*:?\\s*(?=\\n|$)`);
  const m = re.exec(text);
  if (!m) return null;
  const start = m.index + (m[1] === '\n' ? 1 : 0);
  const afterHeading = m.index + m[0].length;
  return { start, afterHeading };
}

function extractBetween(text: string, startMarker: string, stopMarkers: readonly string[]): string {
  const start = findMarkerLine(text, startMarker);
  if (!start) return '';
  const after = text.slice(start.afterHeading);
  let end = after.length;
  for (const stop of stopMarkers) {
    const found = findMarkerLine(after, stop);
    if (found && found.start < end) end = found.start;
  }
  return after.slice(0, end).trim();
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

describe('extractBetween', () => {
  it('extracts content between named markers', () => {
    const text = `## Title in English\n\nMy Article Title\n\n## Body in English\n\nFirst paragraph.\n\nSecond paragraph.`;
    expect(extractBetween(text, 'Title in English', ['Body in English'])).toBe('My Article Title');
    expect(extractBetween(text, 'Body in English', ['中文标题'])).toBe('First paragraph.\n\nSecond paragraph.');
  });

  it('returns empty string when start marker not found', () => {
    const text = `## Some Other Heading\n\nContent.`;
    expect(extractBetween(text, 'Title in English', ['Body in English'])).toBe('');
  });

  it('works with Chinese markers', () => {
    const text = `## 中文标题\n\n这是标题\n\n## 中文正文\n\n这是正文内容。`;
    expect(extractBetween(text, '中文标题', ['中文正文'])).toBe('这是标题');
    expect(extractBetween(text, '中文正文', ['其余一切'])).toBe('这是正文内容。');
  });

  it('reads to end of text when no stop marker is found', () => {
    const text = `## 中文正文\n\n只有这一段，没有结束标记。`;
    expect(extractBetween(text, '中文正文', ['其余一切'])).toBe('只有这一段，没有结束标记。');
  });

  it('tolerates trailing colon on stop marker (## 其余一切:)', () => {
    const text = `## 中文正文\n\nbody.\n\n## 其余一切:\n\nignored.`;
    expect(extractBetween(text, '中文正文', ['其余一切'])).toBe('body.');
  });

  // Regression: prior implementation split on any `## ` heading or treated
  // `---` dividers as section breaks, which truncated bodies that contained
  // sub-headings or decorative dividers. The new logic must read through them.
  it('does NOT truncate the section at sub-headings (###) or dividers (---)', () => {
    const text = [
      '## 中文正文',
      '',
      '段落一。',
      '',
      '### 小标题',
      '段落二，标题下面的内容。',
      '',
      '---',
      '',
      '段落三，横线后还应保留。',
      '',
      '## 其余一切:',
      '',
      '草稿（应被忽略）。',
    ].join('\n');
    const body = extractBetween(text, '中文正文', ['其余一切']);
    expect(body).toContain('段落一');
    expect(body).toContain('### 小标题');
    expect(body).toContain('段落二');
    expect(body).toContain('---');
    expect(body).toContain('段落三，横线后还应保留');
    expect(body).not.toContain('草稿');
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
  it('returns empty string when Body in English marker is absent', () => {
    const section = `## Title in English\n\nMy Title`;
    expect(extractBetween(section, 'Body in English', ['中文标题'])).toBe('');
  });

  it('returns empty string when body section exists but has no content', () => {
    const section = `## Title in English\n\nMy Title\n\n## Body in English\n\n`;
    expect(extractBetween(section, 'Body in English', ['中文标题'])).toBe('');
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

    expect(extractBetween(fullMd, 'Title in English', ['Body in English', '中文标题', '中文正文', '其余一切'])).toBe("Don't start with AI tutorials");
    expect(extractBetween(fullMd, 'Body in English', ['中文标题', '中文正文', '其余一切'])).toBe('EN body content here.\n\n---');
    expect(extractBetween(fullMd, '中文标题', ['中文正文', '其余一切'])).toBe('不要从 AI 教程开始');
    expect(extractBetween(fullMd, '中文正文', ['其余一切'])).toBe('中文正文内容。\n\n---');
  });
});
