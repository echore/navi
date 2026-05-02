import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    titleEn: z.string(),
    titleCn: z.string(),
    tags: z.array(z.string()),
    date: z.coerce.date(),
    readTime: z.number(),
    slug: z.string(),
    draft: z.boolean().default(false),
    notionId: z.string().optional(),
  }),
});

export const collections = { posts };
