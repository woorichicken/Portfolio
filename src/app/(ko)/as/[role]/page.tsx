import { notFound } from 'next/navigation';
import Browse from '@/components/screen/Browse';
import { ROLE_IDS, isRoleId } from '@/content/roles';
import { buildBrowseMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

// 역할 화면 — 정해 둔 역할만 만든다. 그 밖의 주소는 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return ROLE_IDS.map((role) => ({ role }));
}

type Props = { params: Promise<{ role: string }> };

export async function generateMetadata({ params }: Props) {
  const { role } = await params;
  return isRoleId(role) ? buildBrowseMetadata('ko', role) : {};
}

export default async function KoreanBrowse({ params }: Props) {
  const { role } = await params;
  if (!isRoleId(role)) notFound();
  return <Browse locale="ko" role={role} />;
}
