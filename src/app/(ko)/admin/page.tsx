import type { Metadata } from 'next';
import Admin, { type AdminItem } from '@/components/admin/Admin';
import Shell from '@/components/screen/Shell';
import { HIDDEN, ROLES } from '@/content/roles';
import { allTitleCards } from '@/content/screen-data';

export { viewport } from '@/lib/metadata';

// 나를 위한 화면 — 검색엔진에 올리지 않는다(robots.ts 에서도 막는다). 비밀번호 관문은 가림막이지 보안 경계가 아니다:
// 여기 보이는 것은 전부 공개 저장소의 콘텐츠 파일과 같은 내용이다.
export const metadata: Metadata = { title: '어드민 — SOLHUN', robots: { index: false, follow: false } };

export default function AdminPage() {
  const items: AdminItem[] = allTitleCards('ko').map((c) => ({ slug: c.slug, name: c.name, kicker: c.kicker, cover: c.shot.src, kind: c.kind }));
  const roles = Object.fromEntries(
    Object.entries(ROLES).map(([id, r]) => [id, { name: r.name.ko, featured: r.featured, projects: r.projects, others: r.others }]),
  );
  return (
    <Shell locale="ko" altPath={() => '/admin'} contact={false}>
      <Admin items={items} roles={roles} hidden={HIDDEN} />
    </Shell>
  );
}
