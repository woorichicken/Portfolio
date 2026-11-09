import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import RolePicker from '@/components/screen/RolePicker';
import { getSite } from '@/content/store';
import { isLocale } from '@/i18n/config';
import { buildMetadata } from '@/lib/metadata';
import { buildPersonJsonLd } from '@/lib/structured-data';

export { viewport } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata(await getSite(), locale);
}

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'ko') notFound();
  const site = await getSite();
  return (
    <>
      <JsonLd data={buildPersonJsonLd(site, locale)} />
      <RolePicker site={site} locale={locale} />
    </>
  );
}
