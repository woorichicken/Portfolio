import { itemIndex } from '@/content/ops';
import { ROLE_IDS } from '@/content/roles';
import { authorize, ok, openStore, route } from '@/lib/content-api';

// GET /api/content — 지금 상태 한눈에: 문서 버전 · 항목 목록(id·종류·이름·숨김·어느 역할 몇 번째) · 역할별 순서
export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  await authorize(req);
  const { base } = await openStore();
  const roles = Object.fromEntries(ROLE_IDS.map((r) => [r, { name: base.roles[r].name.ko, featured: base.roles[r].featured, projects: base.roles[r].projects, others: base.roles[r].others }]));
  return ok({ source: base.source, versions: base.versions, updatedAt: base.updatedAt, items: itemIndex(base), roles, hidden: base.hidden });
});
