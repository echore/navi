export interface ListablePost {
  data: {
    date: Date;
    draft?: boolean;
    listed?: boolean;
    featured?: boolean;
    pinned?: boolean;
  };
}

/** Published posts that appear in lists, newest first. */
export function selectListedPosts<T extends ListablePost>(posts: T[]): T[] {
  return posts
    .filter((post) => !post.data.draft && post.data.listed !== false)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Pinned posts stay first. Everything else keeps newest-first order. */
export function withPinnedFirst<T extends ListablePost>(posts: T[]): T[] {
  const pinned = posts.filter((post) => post.data.pinned);
  const rest = posts.filter((post) => !post.data.pinned);
  return [...pinned, ...rest];
}

/** Homepage grid: pinned posts first, then the newest, capped at nine. */
export function selectHomepagePosts<T extends ListablePost>(posts: T[], limit = 9): T[] {
  return withPinnedFirst(selectListedPosts(posts)).slice(0, limit);
}
