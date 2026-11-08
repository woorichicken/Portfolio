import { LOCALES } from '@/i18n/config';
import { OpError, itemIndex, itemId, listOf } from '@/content/ops';
import { authorize, ok, openStore, route } from '@/lib/content-api';

// GET /api/content/item/<id> — 프로젝트 하나를 세 언어로 + 어느 역할 몇 번째 · 숨김. 고치기 전에 지금 값을 볼 때
export const dynamic = 'force-dynamic';

export const GET = route(async (req, { params }) => {
  await authorize(req);
  const { id } = (await params) as { id: string };
  const { base } = await openStore();
  const info = itemIndex(base).find((i) => i.id === id);
  if (!info) throw new OpError(404, 'not_found', `"${id}" 인 항목이 없습니다 — GET /api/content 로 id 목록을 보세요`);
  const item = Object.fromEntries(LOCALES.map((l) => [l, listOf(base.content[l], info.kind).find((x) => itemId(x) === id)]));
  const path = { project: 'work.projects', other: 'others.items', early: 'early.items' }[info.kind];
  return ok({ ...info, path: `${path}[${id}]`, item, versions: base.versions });
});
