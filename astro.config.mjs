// @ts-check
import { defineConfig } from 'astro/config';
import rehypeRaw from 'rehype-raw';

export default defineConfig({
  output: 'static',
  markdown: {
    rehypePlugins: [rehypeRaw],
  },
});
