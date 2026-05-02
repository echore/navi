/**
 * Syncs published Notion pages to src/content/posts/*.md
 *
 * Notion page template expected structure:
 *   ## Title in English
 *   [EN title text]
 *   ## Body in English
 *   [EN body content]
 *   --- (divider)
 *   ## 中文标题
 *   [中文标题文字]
 *   ## 中文正文
 *   [中文正文内容]
 *   --- (divider)
 *   ## 其余一切: (ignored)
 *
 * Run: npm run sync
 */

import 'dotenv/config';
import { Client } from '@notionhq/client';
import { marked } from 'marked';
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
// This should be the Data Source ID (collection UUID), not the database page ID.
// Find it in the Notion MCP or from collection:// URL in your workspace.
// Current value: 188942e6-a592-801b-86b4-000b03cdf1bb
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  throw new Error('Missing NOTION_TOKEN or NOTION_DATABASE_ID in .env');
}

const notion = new Client({ auth: NOTION_TOKEN });

const POSTS_DIR = join(process.cwd(), 'src/content/posts');
const DATES_FILE = join(process.cwd(), 'scripts/published-dates.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadPublishedDates(): Record<string, string> {
  if (!existsSync(DATES_FILE)) return {};
  return JSON.parse(readFileSync(DATES_FILE, 'utf-8'));
}

function savePublishedDates(dates: Record<string, string>): void {
  writeFileSync(DATES_FILE, JSON.stringify(dates, null, 2) + '\n');
}

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

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Notion page parsing ───────────────────────────────────────────────────────

// Must match the ## headings in your Notion template exactly
const MARKERS = {
  enTitle: 'Title in English',
  enBody:  'Body in English',
  cnTitle: '中文标题',
  cnBody:  '中文正文',
} as const;

interface ParsedPost {
  titleEn: string;
  titleCn: string;
  tags: string[];
  enBody: string;
  cnBody: string;
  notionId: string;
}

/**
 * Extracts the content under a ## heading marker, up to the next ## heading or end of string.
 */
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

function normalizeMarkdown(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];

    if (line.startsWith('```')) inCodeBlock = !inCodeBlock;

    // Replace Notion empty blocks with a non-breaking space paragraph for extra spacing
    if (line.trim() === '<empty-block/>') {
      if (result.length > 0 && result[result.length - 1] !== '') result.push('');
      result.push('&nbsp;');
      result.push('');
      continue;
    }

    result.push(line);

    // Add blank line between consecutive non-empty lines when outside code blocks
    if (!inCodeBlock && line.trim() && next !== undefined && next.trim() && next.trim() !== '<empty-block/>') {
      result.push('');
    }
  }

  return result.join('\n').trim();
}

async function parsePage(pageId: string, tags: string[]): Promise<ParsedPost | null> {
  // Use Notion SDK v5 native Markdown conversion — no notion-to-md needed
  const result = await notion.pages.retrieveMarkdown({ page_id: pageId });
  const fullMd = result.markdown;

  // Split by divider: section[0]=EN, section[1]=CN, section[2+]=ignored
  const sections = fullMd.split(/\n---+\n/);

  if (sections.length < 2) {
    console.warn(`[skip] Page ${pageId}: needs at least one divider between EN and CN sections`);
    return null;
  }

  const [enSection, cnSection] = sections;

  const titleEn = extractSubsection(enSection, MARKERS.enTitle);
  const enBody  = normalizeMarkdown(extractSubsection(enSection, MARKERS.enBody));
  const titleCn = extractSubsection(cnSection, MARKERS.cnTitle);
  const cnBody  = normalizeMarkdown(extractSubsection(cnSection, MARKERS.cnBody));

  if (!titleEn || !titleCn) {
    console.warn(`[skip] Page ${pageId}: missing title marker ("${MARKERS.enTitle}" or "${MARKERS.cnTitle}")`);
    return null;
  }

  if (!enBody) {
    console.warn(`[skip] Page ${pageId}: EN body is empty — add content under "## ${MARKERS.enBody}" in Notion`);
    return null;
  }

  return { titleEn, titleCn, tags, enBody, cnBody, notionId: pageId };
}

// ── Markdown file generation ──────────────────────────────────────────────────

function buildMarkdown(post: ParsedPost, date: string, readTime: number, slug: string): string {
  const enHtml = String(marked(post.enBody));
  const cnHtml = String(marked(post.cnBody));

  return `---
titleEn: ${JSON.stringify(post.titleEn)}
titleCn: ${JSON.stringify(post.titleCn)}
tags: ${JSON.stringify(post.tags)}
date: ${date}
readTime: ${readTime}
slug: ${slug}
draft: false
notionId: ${JSON.stringify(post.notionId)}
---

<div class="lang-en">
${enHtml}
</div>

<div class="lang-zh">
${cnHtml}
</div>
`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function sync(): Promise<void> {
  const publishedDates = loadPublishedDates();

  // v5 API: paginate through all results (Notion returns max 100 per request)
  const allResults: Awaited<ReturnType<typeof notion.dataSources.query>>['results'] = [];
  let cursor: string | undefined;

  do {
    const firstResponse = await notion.dataSources.query({
      data_source_id: NOTION_DATABASE_ID!,
      filter: {
        property: 'Status',
        status: { equals: 'Publish' },
      },
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    allResults.push(...firstResponse.results);
    cursor = firstResponse.has_more ? (firstResponse.next_cursor ?? undefined) : undefined;
  } while (cursor);

  console.log(`Found ${allResults.length} published page(s)`);

  mkdirSync(POSTS_DIR, { recursive: true });

  // Remove .md files whose notionId is no longer in the Published set
  const publishedIds = new Set(allResults.filter(p => p.object === 'page').map(p => p.id));
  for (const file of readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'))) {
    const content = readFileSync(join(POSTS_DIR, file), 'utf-8');
    const match = content.match(/^notionId:\s*"([^"]+)"/m);
    if (!match) continue; // hand-written post without notionId — skip
    const notionId = match[1];
    if (!publishedIds.has(notionId)) {
      unlinkSync(join(POSTS_DIR, file));
      delete publishedDates[notionId];
      console.log(`[removed] ${file} (unpublished in Notion)`);
    }
  }

  let synced = 0;
  const usedSlugs = new Map<string, string>(); // slug → notionId

  for (const page of allResults) {
    if (page.object !== 'page') continue;

    const props = (page as any).properties;
    if (!props?.Tag) {
      console.warn(`[warn] Page ${page.id}: missing "Tag" property — check Notion field name`);
    }
    const tags: string[] = (props?.Tag?.multi_select ?? []).map((o: any) => o.name as string);

    const post = await parsePage(page.id, tags);
    if (!post) continue;

    const slug = slugify(post.titleEn);

    if (usedSlugs.has(slug)) {
      console.warn(`[skip] Page ${page.id}: slug "${slug}" already used by ${usedSlugs.get(slug)} — rename the EN title to avoid conflict`);
      continue;
    }
    usedSlugs.set(slug, page.id);
    const readTime = calcReadTime(post.enBody);

    if (!publishedDates[page.id]) {
      publishedDates[page.id] = today();
    }
    const date = publishedDates[page.id];

    const markdown = buildMarkdown(post, date, readTime, slug);
    writeFileSync(join(POSTS_DIR, `${slug}.md`), markdown);

    console.log(`[synced] ${slug}.md`);
    synced++;
  }

  savePublishedDates(publishedDates);
  console.log(`\nDone. ${synced} file(s) written.`);
}

sync().catch((err) => {
  console.error(err);
  process.exit(1);
});
