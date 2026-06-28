import { HTML_META_KEYWORDS, HTML_META_DESCRIPTION, HTML_TITLE } from './index.util';

describe('SEO constants', () => {
  it('should include YouthPay in keywords', () => {
    expect(HTML_META_KEYWORDS).toContain('YouthPay');
  });

  it('should set YouthPay description', () => {
    expect(HTML_META_DESCRIPTION).toContain('YouthPay');
  });

  it('should set YouthPay title', () => {
    expect(HTML_TITLE).toContain('YouthPay');
  });
});
