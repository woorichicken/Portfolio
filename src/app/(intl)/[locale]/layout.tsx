import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Document from '@/components/Document';
import { PREFIXED_LOCALES, isLocale } from '@/i18n/config';

// /en, /es 만 만든다. 그 밖의 경로(/ko 포함)는 404 — 한국어의 정식 주소는 / 하나로 둔다.
export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}

export default async function IntlRootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'ko') notFound();
  return <Document locale={locale}>{children}</Document>;
}
