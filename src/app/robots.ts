import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/i18n/config';

export default function robots(): MetadataRoute.Robots {
  // 어드민은 나를 위한 화면이라 검색에 올리지 않는다
  return { rules: [{ userAgent: '*', allow: '/', disallow: '/admin' }], sitemap: `${SITE_URL}/sitemap.xml` };
}
