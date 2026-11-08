import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Document from '@/components/Document';
import { PREFIXED_LOCALES, isLocale } from '@/i18n/config';

// /en, /es 만 만든다. 그 밖의 경로(/ko 포함)는 아래 notFound() 로 404 — 한국어의 정식 주소는 / 하나로 둔다.
// dynamicParams 는 true 여야 저장 뒤 /en·/es 페이지가 다시 그려진다(false 면 NoFallbackError → 404, as/[role] 주석).
export const dynamicParams = true;

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}

export default async function IntlRootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'ko') notFound();
  return <Document locale={locale}>{children}</Document>;
}
