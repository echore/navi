// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  markdown: {
    allowDangerousHtml: true,
  },
});
