import { getContent } from '@/content';
import type { Site } from '@/content/store';
import { LOCALES, SITE_URL, localePath, type Locale } from '@/i18n/config';

// AI 검색(GEO)이 「이 사이트가 누구의 것인지」를 문장이 아니라 구조로 읽게 한다.
// 2026-10-30 Zecle SCORE 에서 solhun.com 은 「브랜드 구조화 데이터」「sameAs」 둘 다 실패였다(GEO 52점).
// 값은 화면에 이미 공개된 것(이름·역할·이메일·링크)과 주소가 살아 있는지 확인한 계정만 쓴다.
// 회사 정보는 이 사이트가 가려 온 방침대로 worksFor 로 따로 내지 않는다 — 역할 문구에 이미 들어 있다.
const EXTRA_PROFILES = [
  'https://www.youtube.com/@solhunlab',
  'https://velog.io/@solhun',
  'https://dev.to/solhun',
];

export function buildPersonJsonLd(site: Site, locale: Locale) {
  const t = getContent(site, locale);
  const otherNames = LOCALES.map((l) => getContent(site, l).hero.name).filter((name) => name !== t.hero.name);
  // 본문이 마지막으로 바뀐 날 — 예전에는 빌드한 날이었다. D1 로 옮긴 뒤로는 문서의 updated_at 이 그 날이다
  const modified = site.updatedAt.slice(0, 10);
  const siteLinks = [...t.hero.links, ...t.contact.links].map((link) => link.href).filter((href) => href.startsWith('https://'));

  // Person 을 ProfilePage 안에 넣지 않고 @graph 의 형제 노드로 둔다 — 중첩을 안 펼치는 점검기·크롤러도 Person 과 sameAs 를 바로 읽게
  const personId = `${SITE_URL}/#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        // 세 언어판이 같은 사람이라는 걸 하나의 @id 로 묶는다
        '@id': personId,
        name: t.hero.name,
        alternateName: [...new Set(['SOLHUN', ...otherNames])],
        url: SITE_URL,
        jobTitle: t.hero.role,
        description: t.meta.description,
        email: `mailto:${t.contact.email}`,
        sameAs: [...new Set([...siteLinks, ...EXTRA_PROFILES])],
      },
      {
        '@type': 'ProfilePage',
        url: `${SITE_URL}${localePath(locale)}`,
        inLanguage: locale,
        dateModified: modified,
        mainEntity: { '@id': personId },
      },
    ],
  };
}

// <script> 안에 그대로 넣으므로 "</script>" 같은 문자열이 태그를 닫지 못하게 < 를 이스케이프한다
export function toJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
