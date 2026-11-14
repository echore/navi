export interface ListablePost {
  data: {
    date: Date;
    draft?: boolean;
    listed?: boolean;
    featured?: boolean;
  };
}

/** Published posts that appear in lists, newest first. */
export function selectListedPosts<T extends ListablePost>(posts: T[]): T[] {
  return posts
    .filter((post) => !post.data.draft && post.data.listed !== false)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Homepage grid: the newest listed posts, capped so new uploads don't stretch the page. */
export function selectHomepagePosts<T extends ListablePost>(posts: T[], limit = 9): T[] {
  return selectListedPosts(posts).slice(0, limit);
}
