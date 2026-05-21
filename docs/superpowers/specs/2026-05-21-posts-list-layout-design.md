# Posts List Layout Design

**Date:** 2026-05-21  
**Status:** Approved

## Goal

Replace the card grid on `/posts` with a lightweight row list. Cards are visually heavy for an archive page; a simple title + date row lets readers scan quickly.

**Out of scope:** Changing the homepage card layout, pagination, search, adding excerpt/description field.

**Done when:**
- `/posts` page shows a row-based list (title + date per row, no tags in rows)
- Tag filter bar at top still works (hides/shows rows by tag)
- Hover state on row titles
- Homepage card grid unchanged
- `astro check` clean, `npx vitest run` passes, local preview correct

---

## Architecture

New component, no changes to existing ones:

```
src/
  components/
    PostGrid.astro     ← unchanged (homepage cards)
    PostList.astro     ← NEW: row list for /posts page
  pages/
    posts/
      index.astro      ← swap PostGrid → PostList
```

`PostGrid.astro` stays as-is. `PostList.astro` is a self-contained component that owns its own data fetching, tag filtering, and styles — same pattern as PostGrid.

---

## PostList.astro

**Data:** `getCollection('posts')`, filter drafts, sort by date descending. No `limit` prop needed (always shows all).

**Template structure:**
```
<section>
  <div.section-row>
    <span "All Posts" data-en/data-cn>
  </div>
  <div.tag-filter>   ← same tag pill buttons as PostGrid
  <div.post-list>
    <a.list-row href="/posts/{slug}" data-tags="{tags}">
      <span.list-title>  ← titleCn / titleEn (via lang-cn body class)
      <span.list-meta>   ← readTime + date
    </a>
    ...
  </div>
</section>
```

**Bilingual titles:** Each row renders both `<span class="title-en">` and `<span class="title-cn">`, toggled via CSS using `body.lang-cn` — same pattern already used in `PostCard.astro`.

**Tag filtering:** Same client-side JS as PostGrid — clicking a tag button toggles `.active` and hides/shows `.list-row` elements by `data-tags` attribute.

**Hover:** Row title color transitions to `var(--terra)` on hover.

---

## Visual Spec

```
All Posts                          ← heading (11px uppercase, warm-gray)

[All] [AI] [Workflow] [Social]     ← tag filter pills

──────────────────────────────────────────────────
关于 Claude Code 的一切                    10分钟 · 5月   ← row
──────────────────────────────────────────────────
Toggl → Obsidian → Notion 自动化 SOP       1分钟 · 5月
──────────────────────────────────────────────────
收藏夹吃灰？我用 Claude 解决了              3分钟 · 5月
──────────────────────────────────────────────────
```

Row layout: title flex-1, meta right-aligned, separated by 0.5px `var(--sand)` border.

---

## Testing

- `astro check` — no TypeScript errors
- `npx vitest run` — all existing tests pass (no new tests needed; build smoke test already checks `/posts/index.html` exists)
- Manual: `/posts` shows list layout, not cards
- Manual: tag filter hides/shows rows correctly
- Manual: CN/EN toggle swaps titles
- Manual: homepage still shows card grid
