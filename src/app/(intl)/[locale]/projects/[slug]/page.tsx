import { notFound } from 'next/navigation';
import ProjectCase from '@/components/ProjectCase';
import WorkDetail from '@/components/WorkDetail';
import { PROJECT_IDS, WORK_SLUGS, getProject, getWorkEntry } from '@/content';
import { PREFIXED_LOCALES, isLocale } from '@/i18n/config';
import { buildDetailMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LOCALES.flatMap((locale) => [...PROJECT_IDS, ...WORK_SLUGS].map((slug) => ({ locale, slug })));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  return buildDetailMetadata(locale, slug);
}

export default async function LocalizedProjectDetail({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || locale === 'ko') notFound();
  const project = getProject(locale, slug);
  if (project) return <ProjectCase locale={locale} project={project} />;
  const entry = getWorkEntry(locale, slug);
  if (!entry) notFound();
  return <WorkDetail locale={locale} entry={entry} />;
}
