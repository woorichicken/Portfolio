import type { Metadata, Viewport } from 'next';
import { getContent } from '@/content';
import { LOCALES, OG_LOCALES, SITE_URL, localePath, type Locale } from '@/i18n/config';

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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f6fb' },
    { media: '(prefers-color-scheme: dark)', color: '#12142a' },
  ],
};
