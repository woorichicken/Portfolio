import type { MetadataRoute } from 'next';
import { PROJECT_IDS, WORK_SLUGS } from '@/content';
import { LOCALES, SITE_URL, designPath, localePath, projectPath } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${localePath(l)}`]));
  const home: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}${localePath(locale)}`,
    changeFrequency: 'monthly',
    priority: locale === 'ko' ? 1 : 0.8,
    alternates: { languages },
  }));
  // 프로젝트 상세 — 언어판끼리 서로를 가리킨다
  const details: MetadataRoute.Sitemap = [...PROJECT_IDS, ...WORK_SLUGS].flatMap((slug) => {
    const alternates = { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${projectPath(l, slug)}`])) };
    return LOCALES.map((locale) => ({
      url: `${SITE_URL}${projectPath(locale, slug)}`,
      changeFrequency: 'monthly' as const,
      priority: PROJECT_IDS.includes(slug) ? 0.7 : 0.5,
      alternates,
    }));
  });
  const designAlternates = { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${designPath(l)}`])) };
  const design: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}${designPath(locale)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    alternates: designAlternates,
  }));
  return [...home, ...details, ...design];
}
