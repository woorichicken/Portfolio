import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Portfolio from '@/components/Portfolio';
import { isLocale } from '@/i18n/config';
import { buildMetadata } from '@/lib/metadata';
import { buildPersonJsonLd } from '@/lib/structured-data';

export { viewport } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata(locale);
}

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'ko') notFound();
  return (
    <>
      <JsonLd data={buildPersonJsonLd(locale)} />
      <Portfolio locale={locale} />
    </>
  );
}
