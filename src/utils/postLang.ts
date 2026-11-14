export interface PostTitleFields {
  title: string;
  lang: 'en' | 'zh';
  titleEn?: string;
  titleZh?: string;
}

/** The toolkit page is a link list and stays on its original language. */
export const LANG_TOGGLE_EXCLUDED_SLUG = 'toolkit';

export function shouldOfferLangToggle(slug: string, markdown: string): boolean {
  if (slug === LANG_TOGGLE_EXCLUDED_SLUG) return false;
  return markdown.includes('class="lang-en"') && markdown.includes('class="lang-zh"');
}

export function resolvePostTitles(data: PostTitleFields): { titleEn?: string; titleZh?: string } {
  return {
    titleEn: data.titleEn ?? (data.lang === 'en' ? data.title : undefined),
    titleZh: data.titleZh ?? (data.lang === 'zh' ? data.title : undefined),
  };
}
