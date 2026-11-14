import { describe, it, expect } from 'vitest';
import { selectHomepagePosts, selectListedPosts } from '../utils/selectPosts';

function post(date: string, extra: { draft?: boolean; listed?: boolean; featured?: boolean } = {}) {
  return { data: { date: new Date(date), ...extra }, slug: date };
}

describe('selectHomepagePosts', () => {
  const posts = [
    post('2026-01-01'),
    post('2026-02-01', { draft: true }),
    post('2026-03-01', { listed: false }),
    post('2026-04-01'),
    post('2026-05-01'),
    post('2026-06-01'),
    post('2026-07-01'),
    post('2026-08-01'),
    post('2026-09-01'),
    post('2026-10-01', { featured: false }),
    post('2026-11-01'),
    post('2026-12-01'),
    post('2026-11-15'),
  ];

  it('returns at most 9 posts', () => {
    expect(selectHomepagePosts(posts)).toHaveLength(9);
  });

  it('keeps the newest listed posts and drops drafts and unlisted ones', () => {
    const picked = selectHomepagePosts(posts).map((p) => p.data.date.toISOString().slice(0, 10));
    expect(picked).toEqual([
      '2026-12-01',
      '2026-11-15',
      '2026-11-01',
      '2026-10-01',
      '2026-09-01',
      '2026-08-01',
      '2026-07-01',
      '2026-06-01',
      '2026-05-01',
    ]);
    expect(picked).not.toContain('2026-02-01');
    expect(picked).not.toContain('2026-03-01');
    expect(picked).not.toContain('2026-04-01');
  });

  it('does not require the featured flag', () => {
    const picked = selectHomepagePosts(posts);
    expect(picked.some((p) => p.data.featured === false)).toBe(true);
  });

  it('keeps a pinned post first without dropping the nine-post cap', () => {
    const pinned = { data: { date: new Date('2020-01-01'), pinned: true }, slug: 'overview' };
    const picked = selectHomepagePosts([pinned, ...posts]);
    expect(picked).toHaveLength(9);
    expect(picked[0]).toBe(pinned);
    expect(picked[1].data.date.toISOString().slice(0, 10)).toBe('2026-12-01');
  });

  it('lists every non-draft listed post when there is no cap', () => {
    const listed = selectListedPosts(posts);
    expect(listed).toHaveLength(11);
    expect(listed.at(-1)?.data.date.toISOString().slice(0, 10)).toBe('2026-01-01');
  });
});
