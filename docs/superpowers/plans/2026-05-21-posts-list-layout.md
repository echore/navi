# Posts List Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card grid on `/posts` with a lightweight row list (title + meta per row, tags only in filter bar).

**Architecture:** Create a new `PostList.astro` component that owns its own data fetching, tag filtering, and styles. Update `/posts/index.astro` to use it instead of `PostGrid`. `PostGrid.astro` is untouched — it stays for the homepage.

**Tech Stack:** Astro, TypeScript, Vitest (build smoke tests)

---

## Files

| Action | Path |
|--------|------|
| Create | `src/components/PostList.astro` |
| Modify | `src/pages/posts/index.astro` |
| Modify | `src/tests/build.test.ts` |

---

### Task 1: Add failing test for list layout (TDD first)

**Files:**
- Modify: `src/tests/build.test.ts`

- [ ] **Step 1: Add a new test inside the existing `describe('build smoke test', ...)` block**

Open `src/tests/build.test.ts` and add this `it` block after the existing tests:

```ts
it('/posts page uses list layout, not card grid', () => {
  const html = readFileSync(join(dist, 'posts/index.html'), 'utf-8');
  expect(html).toContain('list-row');
  expect(html).not.toContain('post-grid');
});
```

- [ ] **Step 2: Build and run to confirm the new test fails**

```bash
npm run build && npx vitest run
```

Expected: the new test FAILS (`list-row` not found, or `post-grid` is present). All other tests still pass.

Do NOT commit yet.

---

### Task 2: Create PostList.astro

**Files:**
- Create: `src/components/PostList.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
import { getCollection } from 'astro:content';
import { getTagColor, getTagLightColor } from '../utils/tagColor';

const allPosts = await getCollection('posts', ({ data }) => !data.draft);
const posts = allPosts.sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
);
const allTags = [...new Set(posts.flatMap(p => p.data.tags))].sort();
---

<section class="posts-section">
  <div class="section-row">
    <span class="section-heading" data-en="All Posts" data-cn="全部文章">All Posts</span>
  </div>

  {allTags.length > 0 && (
    <div class="tag-filter" id="post-tag-filter">
      <button
        class="tag-btn active"
        data-tag="all"
        style="--btn-color: var(--terra); --btn-color-lt: var(--terra-lt)"
      >All</button>
      {allTags.map(tag => (
        <button
          class="tag-btn"
          data-tag={tag}
          style={`--btn-color: ${getTagColor(tag)}; --btn-color-lt: ${getTagLightColor(tag)}`}
        >{tag}</button>
      ))}
    </div>
  )}

  <div class="post-list" id="post-list">
    {posts.map((post) => {
      const dateEn = post.data.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const dateCn = `${post.data.date.getFullYear()}年${post.data.date.getMonth() + 1}月`;
      const metaEn = `${post.data.readTime} min · ${dateEn}`;
      const metaCn = `${post.data.readTime} 分钟 · ${dateCn}`;
      return (
        <a
          class="list-row"
          href={`/posts/${post.data.slug}`}
          data-tags={post.data.tags.join(',')}
        >
          <span
            class="list-title"
            data-en={post.data.titleEn}
            data-cn={post.data.titleCn}
          >{post.data.titleEn}</span>
          <span
            class="list-meta"
            data-en={metaEn}
            data-cn={metaCn}
          >{metaEn}</span>
        </a>
      );
    })}
  </div>
</section>

<style>
  .posts-section {
    max-width: 1080px;
    margin: 0 auto;
    padding: 72px 40px;
  }

  .section-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 28px;
  }

  .section-heading {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--warm-gray);
  }

  .tag-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }

  .tag-btn {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid var(--sand);
    background: transparent;
    color: var(--warm-gray);
    cursor: pointer;
    transition: border-color 150ms, color 150ms, background 150ms;
  }

  .tag-btn:hover {
    border-color: var(--btn-color);
    color: var(--btn-color);
  }

  .tag-btn.active {
    background: var(--btn-color-lt);
    border-color: var(--btn-color);
    color: var(--btn-color);
  }

  .post-list {
    border-top: 0.5px solid var(--sand);
  }

  .list-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 24px;
    padding: 14px 0;
    border-bottom: 0.5px solid var(--sand);
    text-decoration: none;
    color: inherit;
  }

  .list-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--deep);
    line-height: 1.4;
    flex: 1;
    transition: color 150ms;
  }

  .list-row:hover .list-title {
    color: var(--terra);
  }

  .list-meta {
    font-size: 12px;
    color: var(--dim);
    white-space: nowrap;
    flex-shrink: 0;
  }

  @media (max-width: 639px) {
    .posts-section {
      padding: 48px 20px;
    }

    .list-row {
      flex-direction: column;
      gap: 4px;
    }

    .list-meta {
      font-size: 11px;
    }
  }
</style>

<script>
  const filterEl = document.getElementById('post-tag-filter');
  if (filterEl) {
    filterEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.tag-btn');
      if (!btn) return;

      const tag = btn.dataset.tag ?? 'all';
      filterEl.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll<HTMLElement>('.list-row').forEach(row => {
        if (tag === 'all') {
          row.style.display = '';
        } else {
          const rowTags = (row.dataset.tags ?? '').split(',');
          row.style.display = rowTags.includes(tag) ? '' : 'none';
        }
      });
    });
  }
</script>
```

Do NOT commit yet.

---

### Task 3: Update /posts/index.astro to use PostList

**Files:**
- Modify: `src/pages/posts/index.astro`

- [ ] **Step 1: Replace the file content**

The current content is:
```astro
---
import Layout from '../../layouts/Layout.astro';
import NavBar from '../../components/NavBar.astro';
import PostGrid from '../../components/PostGrid.astro';
import Footer from '../../components/Footer.astro';
---

<Layout title="All Posts — Navi">
  <NavBar />
  <PostGrid />
  <Footer />
</Layout>
```

Replace with:
```astro
---
import Layout from '../../layouts/Layout.astro';
import NavBar from '../../components/NavBar.astro';
import PostList from '../../components/PostList.astro';
import Footer from '../../components/Footer.astro';
---

<Layout title="All Posts — Navi">
  <NavBar />
  <PostList />
  <Footer />
</Layout>
```

Only the import and component name change — `PostGrid` → `PostList`.

Do NOT commit yet.

---

### Task 4: Build, verify all tests pass, commit

- [ ] **Step 1: Run astro type check**

```bash
npx astro check
```

Expected: No new errors from our files. (A pre-existing warning about `allowDangerousHtml` in `astro.config.mjs` is known and unrelated — ignore it.)

- [ ] **Step 2: Build and run all tests**

```bash
npm run build && npx vitest run
```

Expected: All tests PASS including the new one:
- ✅ `/posts page uses list layout, not card grid`

- [ ] **Step 3: Start dev server and manually verify**

```bash
npm run dev
```

Check at `localhost:4321`:
- `/posts` — shows row list (not cards), tag filter works, clicking a tag hides other rows
- `/posts` — hover on a title turns it terra/orange color
- `/posts` — CN toggle swaps titles and meta text
- `localhost:4321` (homepage) — still shows card grid, unaffected

Stop server with `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add src/components/PostList.astro src/pages/posts/index.astro src/tests/build.test.ts
git commit -m "feat: replace /posts card grid with row list layout"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push
```
