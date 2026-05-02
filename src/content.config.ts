import { defineCollection } from 'astro:content';
import { z } from 'zod';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    titleEn: z.string(),
    titleCn: z.string(),
    tag: z.enum(['AI', 'Notes']),
    date: z.date(),
    readTime: z.number(),
    slug: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
