import { describe, it, expect } from 'vitest';
import { resolvePostTitles, shouldOfferLangToggle } from '../utils/postLang';

const both = `
<div class="lang-en"><p>English</p></div>
<div class="lang-zh"><p>中文</p></div>
`;

describe('shouldOfferLangToggle', () => {
  it('offers the toggle when both language blocks exist', () => {
    expect(shouldOfferLangToggle('ai-infra-product-lens', both)).toBe(true);
  });

  it('skips the toolkit page even if both blocks exist', () => {
    expect(shouldOfferLangToggle('toolkit', both)).toBe(false);
  });

  it('skips a post that only has one language', () => {
    expect(shouldOfferLangToggle('inner-scorecard', '<p>English only</p>')).toBe(false);
    expect(shouldOfferLangToggle('notes', '<div class="lang-zh"><p>只有中文</p></div>')).toBe(false);
  });
});

describe('resolvePostTitles', () => {
  it('uses the original title for the language it was written in', () => {
    expect(resolvePostTitles({ title: 'English title', lang: 'en' })).toEqual({
      titleEn: 'English title',
      titleZh: undefined,
    });
    expect(resolvePostTitles({ title: '中文标题', lang: 'zh' })).toEqual({
      titleEn: undefined,
      titleZh: '中文标题',
    });
  });

  it('prefers explicit translations', () => {
    expect(
      resolvePostTitles({
        title: 'English title',
        lang: 'en',
        titleZh: '中文标题',
      })
    ).toEqual({ titleEn: 'English title', titleZh: '中文标题' });
  });
});
