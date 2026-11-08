import { notFound } from 'next/navigation';
import Browse from '@/components/screen/Browse';
import { ROLE_IDS, isRoleId } from '@/content/roles';
import { getSite } from '@/content/store';
import { buildBrowseMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';

// 역할 화면 — 정해 둔 역할만 미리 그린다. 그 밖의 주소는 아래 notFound() 가 404 로 돌려준다.
// dynamicParams 를 false 로 두면 안 된다: 저장 뒤 캐시가 무효가 되면 OpenNext 가 그 주소를 「미리 만든 적 없음」으로 보고
// NoFallbackError → 404 를 낸다(2026-11-08 실측 — /as/design 이 저장 직후 404). true 면 그 자리에서 D1 로 다시 그린다.
export const dynamicParams = true;

export function generateStaticParams() {
  return ROLE_IDS.map((role) => ({ role }));
}

type Props = { params: Promise<{ role: string }> };

export async function generateMetadata({ params }: Props) {
  const { role } = await params;
  return isRoleId(role) ? buildBrowseMetadata(await getSite(), 'ko', role) : {};
}

export default async function KoreanBrowse({ params }: Props) {
  const { role } = await params;
  if (!isRoleId(role)) notFound();
  return <Browse site={await getSite()} locale="ko" role={role} />;
}
