import { notFound } from 'next/navigation';
import TitlePage from '@/components/screen/TitlePage';
import { getProject, getWorkEntry, projectIds, workSlugs } from '@/content';
import { getSite } from '@/content/store';
import { PREFIXED_LOCALES, isLocale } from '@/i18n/config';
import { buildDetailMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

// (ko)/projects/[slug] 와 같다 — API 로 추가한 프로젝트도 열리게 dynamicParams = true
export const dynamicParams = true;

export async function generateStaticParams() {
  const site = await getSite();
  return PREFIXED_LOCALES.flatMap((locale) => [...projectIds(site), ...workSlugs(site)].map((slug) => ({ locale, slug })));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  return buildDetailMetadata(await getSite(), locale, slug);
}

export default async function LocalizedProjectDetail({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === 'ko') notFound();
  const site = await getSite();
  const project = getProject(site, locale, slug);
  if (project) return <TitlePage site={site} locale={locale} project={project} />;
  const entry = getWorkEntry(site, locale, slug);
  if (!entry) notFound();
  return <TitlePage site={site} locale={locale} entry={entry} />;
}
