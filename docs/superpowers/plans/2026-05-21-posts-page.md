# Posts Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Limit the homepage to 6 posts and add a dedicated `/posts` page that shows all articles with tag filtering.

**Architecture:** Add a `limit` prop to `PostGrid.astro` — when set, it slices posts and shows a "View all →" link; when unset, it shows all posts with an "All Posts" heading. A new `/posts/index.astro` page uses PostGrid without a limit. NavBar links update from `/#posts` to `/posts`.

**Tech Stack:** Astro, TypeScript, Vitest (build smoke tests)

---

## Files

| Action | Path |
|--------|------|
| Modify | `src/components/PostGrid.astro` |
| Modify | `src/components/NavBar.astro` |
| Modify | `src/pages/index.astro` |
| Create | `src/pages/posts/index.astro` |
| Modify | `src/tests/build.test.ts` |

---

### Task 1: Write failing build tests (TDD first)

**Files:**
- Modify: `src/tests/build.test.ts`

- [ ] **Step 1: Add two new test cases to the existing `build smoke test` describe block**

Open `src/tests/build.test.ts` and add these two `it` blocks inside the existing `describe('build smoke test', ...)`:

```ts
it('dist/posts/index.html exists', () => {
  expect(existsSync(join(dist, 'posts/index.html'))).toBe(true);
});

it('homepage contains view-all link to /posts', () => {
  const html = readFileSync(join(dist, 'index.html'), 'utf-8');
  expect(html).toContain('id="lbl-viewall"');
  expect(html).toContain('href="/posts"');
});
```

- [ ] **Step 2: Build and run tests to confirm both new tests fail**

```bash
npm run build && npx vitest run
```

Expected: the two new tests FAIL (one with "posts/index.html does not exist", one missing the view-all link). All existing tests still pass.

---

### Task 2: Update PostGrid.astro to support limit prop

**Files:**
- Modify: `src/components/PostGrid.astro`

- [ ] **Step 1: Replace the entire frontmatter and template with the following**

Replace from line 1 to the end of the `---` closing fence (lines 1–11):

```astro
---
import { getCollection } from 'astro:content';
import PostCard from './PostCard.astro';
import { getTagColor, getTagLightColor } from '../utils/tagColor';

interface Props {
  limit?: number;
}

const { limit } = Astro.props;

const allPosts = await getCollection('posts', ({ data }) => !data.draft);
const sorted = allPosts.sort(
  (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
);
const posts = limit ? sorted.slice(0, limit) : sorted;
const allTags = [...new Set(posts.flatMap(p => p.data.tags))].sort();
---
```

- [ ] **Step 2: Replace the section-row div in the template**

Find this block in the template:
```html
  <div class="section-row">
    <span class="section-heading" id="lbl-latest">Latest posts</span>
  </div>
```

Replace with:
```html
  <div class="section-row">
    {limit ? (
      <span class="section-heading" id="lbl-latest">Latest posts</span>
    ) : (
      <span class="section-heading" data-en="All Posts" data-cn="全部文章">All Posts</span>
    )}
    {limit && (
      <a href="/posts" class="view-all-link" id="lbl-viewall">View all →</a>
    )}
  </div>
```

- [ ] **Step 3: Add the view-all-link style to the `<style>` block**

Inside the existing `<style>` block, add after the `.section-heading` rule:

```css
  .view-all-link {
    font-size: 12px;
    font-weight: 500;
    color: var(--terra);
    text-decoration: none;
    letter-spacing: 0.02em;
    transition: color 150ms;
  }

  .view-all-link:hover {
    color: var(--terra-dk);
  }
```

---

### Task 3: Create /posts page

**Files:**
- Create: `src/pages/posts/index.astro`

- [ ] **Step 1: Create the file with this exact content**

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

Note: `PostGrid` has no `limit` prop here — it renders all posts with the "All Posts" heading.

---

### Task 4: Update NavBar links

**Files:**
- Modify: `src/components/NavBar.astro`

- [ ] **Step 1: Update the desktop nav link**

Find:
```html
    <li><a href="/#posts" id="nav-posts">Posts</a></li>
```

Replace with:
```html
    <li><a href="/posts" id="nav-posts">Posts</a></li>
```

- [ ] **Step 2: Update the mobile menu link**

Find:
```html
  <a href="/#posts" class="mobile-link" id="m-posts">Posts</a>
```

Replace with:
```html
  <a href="/posts" class="mobile-link" id="m-posts">Posts</a>
```

---

### Task 5: Pass limit to PostGrid on homepage

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add the limit prop**

Find:
```html
  <PostGrid />
```

Replace with:
```html
  <PostGrid limit={6} />
```

---

### Task 6: Build, verify, commit

- [ ] **Step 1: Run astro type check**

```bash
npx astro check
```

Expected: No errors.

- [ ] **Step 2: Build and run all tests**

```bash
npm run build && npx vitest run
```

Expected: All tests PASS including the two new ones added in Task 1.

- [ ] **Step 3: Start dev server and verify manually**

```bash
npm run dev
```

Check:
- Homepage at `localhost:4321` shows exactly 6 post cards
- "View all →" / "查看全部 →" link appears top-right of the posts section
- Clicking the link goes to `/posts`
- `/posts` page shows all articles with tag filter working
- NavBar "Posts" link on both pages goes to `/posts`
- CN/EN toggle works on both pages
- Mobile hamburger menu works on `/posts` page

- [ ] **Step 4: Commit**

```bash
git add src/components/PostGrid.astro src/components/NavBar.astro src/pages/index.astro src/pages/posts/index.astro src/tests/build.test.ts
git commit -m "feat: add /posts page and limit homepage to 6 posts"
```
