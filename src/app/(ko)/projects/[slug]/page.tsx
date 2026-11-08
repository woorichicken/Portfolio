import { notFound } from 'next/navigation';
import TitlePage from '@/components/screen/TitlePage';
import { getProject, getWorkEntry, projectIds, workSlugs } from '@/content';
import { getSite } from '@/content/store';
import { buildDetailMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

// 빌드 때 D1 에 있는 프로젝트를 미리 그린다. API 로 나중에 추가한 프로젝트도 열리도록 그 밖의 주소는 요청 때 그려 본다
// (D1 에 없으면 404). 예전에는 콘텐츠가 코드에 있어서 dynamicParams = false 였다.
export const dynamicParams = true;

export async function generateStaticParams() {
  const site = await getSite();
  return [...projectIds(site), ...workSlugs(site)].map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildDetailMetadata(await getSite(), 'ko', slug);
}

export default async function KoreanProjectDetail({ params }: Props) {
  const { slug } = await params;
  const site = await getSite();
  const project = getProject(site, 'ko', slug);
  if (project) return <TitlePage site={site} locale="ko" project={project} />;
  const entry = getWorkEntry(site, 'ko', slug);
  if (!entry) notFound();
  return <TitlePage site={site} locale="ko" entry={entry} />;
}
