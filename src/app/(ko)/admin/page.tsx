import type { Metadata } from 'next';
import Admin, { type AdminItem } from '@/components/admin/Admin';
import Shell from '@/components/screen/Shell';
import { allTitleCards } from '@/content/screen-data';
import { getSite } from '@/content/store';

export { viewport } from '@/lib/metadata';

// 나를 위한 화면 — 검색엔진에 올리지 않는다(robots.ts 에서도 막는다).
// 화면 자체는 공개 본문만 담는다. 「저장」은 /api/content 가 비밀번호 쿠키를 확인한 뒤에만 받는다.
export const metadata: Metadata = { title: '어드민 — SOLHUN', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const site = await getSite();
  // 숨긴 항목도 어드민에는 보여야 한다 — 숨김을 뺀 문서로 카드를 만든다
  const items: AdminItem[] = allTitleCards({ ...site, hidden: [] }, 'ko').map((c) => ({ slug: c.slug, name: c.name, kicker: c.kicker, cover: c.shot.src, kind: c.kind }));
  const roles = Object.fromEntries(
    Object.entries(site.roles).map(([id, r]) => [id, { name: r.name.ko, featured: r.featured, projects: r.projects, others: r.others }]),
  );
  return (
    <Shell site={site} locale="ko" altPath={() => '/admin'} contact={false}>
      <Admin items={items} roles={roles} hidden={site.hidden} staticMode={site.source === 'static'} />
    </Shell>
  );
}
