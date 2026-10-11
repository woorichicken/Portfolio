import { notFound } from 'next/navigation';
import DesignWall from '@/components/DesignWall';
import { isLocale } from '@/i18n/config';
import { buildDesignMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildDesignMetadata(locale);
}

export default async function LocalizedDesign({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'ko') notFound();
  return <DesignWall locale={locale} />;
}
