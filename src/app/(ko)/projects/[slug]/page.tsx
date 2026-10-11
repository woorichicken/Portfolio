import { notFound } from 'next/navigation';
import ProjectCase from '@/components/ProjectCase';
import WorkDetail from '@/components/WorkDetail';
import { PROJECT_IDS, WORK_SLUGS, getProject, getWorkEntry } from '@/content';
import { buildDetailMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

// 목록에 있는 프로젝트만 만든다. 그 밖의 주소는 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return [...PROJECT_IDS, ...WORK_SLUGS].map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildDetailMetadata('ko', slug);
}

export default async function KoreanProjectDetail({ params }: Props) {
  const { slug } = await params;
  const project = getProject('ko', slug);
  if (project) return <ProjectCase locale="ko" project={project} />;
  const entry = getWorkEntry('ko', slug);
  if (!entry) notFound();
  return <WorkDetail locale="ko" entry={entry} />;
}
