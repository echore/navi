/**
 * Syncs published Notion pages to src/content/posts/*.md
 *
 * Notion page template expected structure:
 *   # English Title
 *   [EN body blocks]
 *   --- (divider)
 *   # 中文标题
 *   [CN body blocks]
 *   --- (divider)
 *   [draft notes — ignored]
 *
 * Run: npx tsx scripts/sync-notion.ts
 */

import 'dotenv/config';
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  throw new Error('Missing NOTION_TOKEN or NOTION_DATABASE_ID in .env');
}

const notion = new Client({ auth: NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

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
  // Count EN words (non-CJK) + CJK characters (each ~1 word)
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

interface ParsedPost {
  titleEn: string;
  titleCn: string;
  tags: string[];
  enBody: string;
  cnBody: string;
  notionId: string;
}

async function parsePage(pageId: string, tags: string[]): Promise<ParsedPost | null> {
  // Get full page markdown via notion-to-md
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const fullMd = n2m.toMarkdownString(mdBlocks).parent;

  // Split into sections by divider (--- on its own line)
  const sections = fullMd.split(/\n---+\n/);

  if (sections.length < 2) {
    console.warn(`[skip] Page ${pageId}: needs at least one divider separating EN and CN sections`);
    return null;
  }

  const [enSection, cnSection] = sections;

  // Extract title (first # heading) and body from each section
  const titleEnMatch = enSection.match(/^#\s+(.+)$/m);
  const titleCnMatch = cnSection.match(/^#\s+(.+)$/m);

  if (!titleEnMatch || !titleCnMatch) {
    console.warn(`[skip] Page ${pageId}: missing # heading in EN or CN section`);
    return null;
  }

  const titleEn = titleEnMatch[1].trim();
  const titleCn = titleCnMatch[1].trim();

  // Body = section content minus the first # heading line
  const enBody = enSection.replace(/^#\s+.+\n?/m, '').trim();
  const cnBody = cnSection.replace(/^#\s+.+\n?/m, '').trim();

  return { titleEn, titleCn, tags, enBody, cnBody, notionId: pageId };
}

// ── Markdown file generation ──────────────────────────────────────────────────

function buildMarkdown(post: ParsedPost, date: string, readTime: number, slug: string): string {
  const tagsYaml = JSON.stringify(post.tags);

  return `---
titleEn: ${JSON.stringify(post.titleEn)}
titleCn: ${JSON.stringify(post.titleCn)}
tags: ${tagsYaml}
date: ${date}
readTime: ${readTime}
slug: ${slug}
draft: false
notionId: ${JSON.stringify(post.notionId)}
---

<div class="lang-en">

${post.enBody}

</div>

<div class="lang-zh">

${post.cnBody}

</div>
`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function sync(): Promise<void> {
  const publishedDates = loadPublishedDates();

  // Query all Published pages
  const response = await notion.databases.query({
    database_id: NOTION_DATABASE_ID!,
    filter: {
      property: 'Status',
      status: { equals: 'Publish' },
    },
  });

  console.log(`Found ${response.results.length} published page(s)`);

  mkdirSync(POSTS_DIR, { recursive: true });

  let synced = 0;

  for (const page of response.results) {
    if (page.object !== 'page') continue;

    const props = (page as any).properties;

    // Extract tags from multi-select
    const tags: string[] = (props.Tag?.multi_select ?? []).map((o: any) => o.name as string);

    const post = await parsePage(page.id, tags);
    if (!post) continue;

    const slug = slugify(post.titleEn);
    const readTime = calcReadTime(post.enBody);

    // Record publish date the first time this page goes live
    if (!publishedDates[page.id]) {
      publishedDates[page.id] = today();
    }
    const date = publishedDates[page.id];

    const markdown = buildMarkdown(post, date, readTime, slug);
    const outPath = join(POSTS_DIR, `${slug}.md`);
    writeFileSync(outPath, markdown);

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
