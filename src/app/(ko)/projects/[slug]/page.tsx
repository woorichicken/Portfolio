import { notFound } from 'next/navigation';
import WorkDetail from '@/components/WorkDetail';
import { WORK_SLUGS, getWorkEntry } from '@/content';
import { buildDetailMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

// 목록에 있는 프로젝트만 만든다. 그 밖의 주소는 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return WORK_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildDetailMetadata('ko', slug);
}

export default async function KoreanProjectDetail({ params }: Props) {
  const { slug } = await params;
  const entry = getWorkEntry('ko', slug);
  if (!entry) notFound();
  return <WorkDetail locale="ko" entry={entry} />;
}
