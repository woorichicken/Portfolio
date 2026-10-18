import type { Metadata, Viewport } from 'next';
import { plain } from '@/components/Rich';
import { getContent, getProject, getWorkEntry } from '@/content';
import { LOCALES, OG_LOCALES, SITE_URL, designPath, localePath, projectPath, type Locale } from '@/i18n/config';

// 세 언어가 서로를 hreflang 으로 가리키게 한다. 검색엔진이 언어별 페이지를 같은 문서의 번역으로 묶는 근거다.
export function buildMetadata(locale: Locale): Metadata {
  const t = getContent(locale);
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
export function buildDetailMetadata(locale: Locale, slug: string): Metadata {
  const t = getContent(locale);
  // 큰 프로젝트(ProjectCase)와 「그 외」·「이전」(WorkDetail)이 같은 /projects/<slug> 를 쓴다
  const project = getProject(locale, slug);
  const entry = project
    ? { name: project.name, body: project.tagline, shot: project.cover }
    : getWorkEntry(locale, slug);
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

// 「디자인 엔지니어로서」 결과물 화면(/design)
export function buildDesignMetadata(locale: Locale): Metadata {
  const t = getContent(locale);
  const title = `${t.design.title} — ${t.hero.name} (SOLHUN)`;
  const description = t.design.pageTitle;
  const languages = Object.fromEntries(LOCALES.map((l) => [l, designPath(l)]));
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: designPath(locale), languages: { ...languages, 'x-default': designPath('ko') } },
    // 링크 미리보기 이미지 — 결과물 화면의 첫 칸(디자인 아틀라스). 없으면 카카오톡 등에서 글자만 뜬다
    openGraph: { type: 'website', url: designPath(locale), title, description, siteName: 'SOLHUN', locale: OG_LOCALES[locale], images: [{ url: '/work/design_atlas.jpg', width: 1400, height: 875 }] },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    // 브라우저 주소창 색 — globals.css 의 --paper(밝은·어두운 화면)와 같은 값
    { media: '(prefers-color-scheme: light)', color: '#f7ece4' },
    { media: '(prefers-color-scheme: dark)', color: '#161d26' },
  ],
};
