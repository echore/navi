import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // Language the post was written in. Lists keep `title` (the original).
    // Post pages that contain both .lang-en and .lang-zh default to English.
    lang: z.enum(['en', 'zh']),
    titleEn: z.string().optional(),
    titleZh: z.string().optional(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    readTime: z.number(),
    slug: z.string(),
    // Short series hint shown after the title, e.g. "AI Infra Track Technology"
    series: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    // Always shown first on the homepage and the posts list.
    pinned: z.boolean().default(false),
    // Full-width page, used by the long AI infra notes.
    wide: z.boolean().default(false),
    // Wide pages hide the site title when they draw their own. The overview uses the site title.
    showTitle: z.boolean().default(false),
    // false = hidden from home and /posts, but the post URL still works
    listed: z.boolean().default(true),
    notionId: z.string().optional(),
  }),
});

export const collections = { posts };
