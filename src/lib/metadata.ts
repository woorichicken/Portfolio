import type { Metadata, Viewport } from 'next';
import { plain } from '@/components/Rich';
import { getContent, getProject, getWorkEntry } from '@/content';
import type { RoleId } from '@/content/roles';
import type { SiteDocs } from '@/content/schema';
import { LOCALES, OG_LOCALES, SITE_URL, browsePath, localePath, projectPath, type Locale } from '@/i18n/config';

// 세 언어가 서로를 hreflang 으로 가리키게 한다. 검색엔진이 언어별 페이지를 같은 문서의 번역으로 묶는 근거다.
export function buildMetadata(docs: SiteDocs, locale: Locale): Metadata {
  const t = getContent(docs, locale);
  const languages = Object.fromEntries(LOCALES.map((l) => [l, localePath(l)]));
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    authors: [{ name: t.hero.name, url: 'https://github.com/woorichicken' }],
    alternates: {
      canonical: localePath(locale),
      languages: { ...languages, 'x-default': localePath('ko') },
    },
    openGraph: {
      type: 'profile',
      url: localePath(locale),
      title: t.meta.title,
      description: t.meta.description,
      siteName: 'SOLHUN',
      locale: OG_LOCALES[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      images: [{ url: '/work/lw_kits-hero-phones.jpg', width: 1400, height: 933 }],
    },
    twitter: { card: 'summary_large_image', title: t.meta.title, description: t.meta.description },
    robots: { index: true, follow: true },
  };
}

// 상세 페이지도 세 언어판이 서로를 가리킨다. 제목은 「프로젝트 — 이름」, 설명은 홈 카드의 한 줄 요약.
export function buildDetailMetadata(docs: SiteDocs, locale: Locale, slug: string): Metadata {
  const t = getContent(docs, locale);
  // 큰 프로젝트(ProjectCase)와 「그 외」·「이전」(WorkDetail)이 같은 /projects/<slug> 를 쓴다
  const project = getProject(docs, locale, slug);
  const entry = project
    ? { name: project.name, body: project.tagline, shot: project.cover }
    : getWorkEntry(docs, locale, slug);
  if (!entry) return {};
  const title = `${entry.name} — ${t.hero.name} (SOLHUN)`;
  const description = plain(entry.body);
  const languages = Object.fromEntries(LOCALES.map((l) => [l, projectPath(l, slug)]));
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: projectPath(locale, slug),
      languages: { ...languages, 'x-default': projectPath('ko', slug) },
    },
    openGraph: {
      type: 'article',
      url: projectPath(locale, slug),
      title,
      description,
      siteName: 'SOLHUN',
      locale: OG_LOCALES[locale],
      images: [{ url: entry.shot.src, width: entry.shot.width, height: entry.shot.height }],
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

// 역할 화면(/as/<역할>) — 제목에 역할 이름을 붙이고, 미리보기 그림은 그 역할의 대표작 표지
export function buildBrowseMetadata(docs: SiteDocs, locale: Locale, role: RoleId): Metadata {
  const t = getContent(docs, locale);
  const def = docs.roles[role];
  const featured = getProject(docs, locale, def.featured);
  const title = `${def.name[locale]} — ${t.hero.name} (SOLHUN)`;
  const description = `${def.blurb[locale]}. ${t.meta.description}`;
  const languages = Object.fromEntries(LOCALES.map((l) => [l, browsePath(l, role)]));
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: browsePath(locale, role), languages: { ...languages, 'x-default': browsePath('ko', role) } },
    openGraph: {
      type: 'website', url: browsePath(locale, role), title, description, siteName: 'SOLHUN', locale: OG_LOCALES[locale],
      images: featured ? [{ url: featured.cover.src, width: featured.cover.width, height: featured.cover.height }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  // 브라우저 주소창 색 — globals.css 의 --bg 와 같은 값(리브랜딩 화면은 어두운 화면 하나다)
  themeColor: '#0b0f14',
  colorScheme: 'dark',
};
