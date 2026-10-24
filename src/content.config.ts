import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    // Language the post was written in; posts are shown as written, no translation
    lang: z.enum(['en', 'zh']),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    readTime: z.number(),
    slug: z.string(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    // false = hidden from home and /posts, but the post URL still works
    listed: z.boolean().default(true),
    notionId: z.string().optional(),
  }),
});

export const collections = { posts };
