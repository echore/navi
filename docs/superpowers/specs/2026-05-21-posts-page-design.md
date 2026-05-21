# Posts Page Design

**Date:** 2026-05-21  
**Status:** Approved

## Goal

Homepage currently shows all posts and grows unbounded as content is added. Fix this by limiting the homepage to 6 posts and adding a dedicated `/posts` page that shows everything.

**Out of scope:** Pagination on `/posts`, search, RSS feed changes.

**Done when:**
- Homepage shows exactly 6 posts with a "View all posts →" link
- `/posts` is a working page with all posts + tag filter
- NavBar "Posts" link goes to `/posts`
- `astro check` passes, tests pass, local preview works

---

## Architecture

Three files change, one new file is created:

```
src/
  components/
    PostGrid.astro       ← add `limit` prop + "View all" link
  pages/
    index.astro          ← no change (PostGrid handles limit)
    posts/
      index.astro        ← NEW: full posts list page
      [slug].astro       ← unchanged
  components/
    NavBar.astro         ← change Posts href from /#posts to /posts
```

---

## Component Changes

### PostGrid.astro

Add a `limit` prop (number, optional). When set, slice the sorted posts array to that length and show a "View all posts →" / "查看全部文章 →" link at the bottom right of the section header row.

- Default: no limit (used by `/posts` page to show everything)
- Homepage passes `limit={6}`
- "View all" link only renders when `limit` is set
- Tag filter still works — it filters from the full set on `/posts`, from the 6 on homepage (consistent with existing JS logic)

### NavBar.astro

Change two links:
- Desktop: `href="/#posts"` → `href="/posts"`
- Mobile menu: same change

No active-state logic needed for now (can be added later).

### src/pages/posts/index.astro (new)

A standalone Astro page at `/posts`. Contains:
- Same `Layout` and `NavBar` as homepage
- Page title: `"All Posts — Navi"`
- `PostGrid` component with no `limit` prop (shows all)
- No Hero, no QuoteBand, no PlatformCard, no Newsletter, no Footer... actually keep Footer for consistency

Layout structure:
```
<Layout title="All Posts — Navi">
  <NavBar />
  <PostGrid />
  <Footer />
</Layout>
```

The PostGrid on this page renders with a heading "All Posts" (EN) / "全部文章" (CN) and the article count visible below it.

---

## Data Flow

No data model changes. Both pages use `getCollection('posts')` — PostGrid already does this internally. The `limit` prop is applied after sorting, before rendering.

---

## Bilingual Support

- Section heading on homepage: "Latest posts" / "最新文章" (existing, unchanged)
- Section heading on `/posts`: "All Posts" / "全部文章" (new i18n strings)
- "View all posts →" / "查看全部文章 →" (new i18n strings)
- Article count: rendered as plain text, no i18n needed (`{posts.length} posts`)
- NavBar link text "Posts" stays as-is (already has CN via existing lang system if applicable)

---

## Testing

- `astro check` — no TypeScript errors
- `npx vitest run` — existing tests pass
- Manual: homepage shows exactly 6 cards + "View all" link
- Manual: `/posts` shows all articles, tag filter works
- Manual: clicking "View all" and NavBar "Posts" both land on `/posts`
- Manual: CN/EN toggle works on both pages
