import type { MetadataRoute } from 'next';
import { LOCALES, SITE_URL, localePath } from '@/i18n/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${localePath(l)}`]));
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}${localePath(locale)}`,
    changeFrequency: 'monthly',
    priority: locale === 'ko' ? 1 : 0.8,
    alternates: { languages },
  }));
}
