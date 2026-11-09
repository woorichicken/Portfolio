import { OpError, patchRole, placeInRole, removeFromRole } from '@/content/ops';
import type { RoleDef } from '@/content/roles';
import { readJson, route, write, type Expect } from '@/lib/content-api';

// PATCH /api/content/roles/<design|product|ax|maker|all> — 역할 화면 배치
//   { place: { id, at? } }     넣거나 옮기기(at = 0부터, 없으면 맨 뒤). 큰 프로젝트는 위 줄, 그 외·이전은 「그 외」 줄로 간다
//   { remove: id }             빼기(대표작이면 막힌다 — featured 부터)
//   { featured: id }           대표작(빌보드) 바꾸기
//   { projects: [...] } · { others: [...] } · { early: bool } · { name|blurb|rowTitle: { ko, en, es } }   통째로 바꾸기
export const dynamic = 'force-dynamic';

type Body = { place?: { id: string; at?: number }; remove?: string; expect?: Expect } & Partial<RoleDef>;

export const PATCH = route(async (req, { params }) => {
  const { role } = (await params) as { role: string };
  const { place, remove, expect, ...patch } = await readJson<Body>(req);
  if (!place && !remove && !Object.keys(patch).length) throw new OpError(400, 'bad_request', 'place · remove · featured 등 바꿀 것을 하나 이상 주세요');
  const what = [place && `넣음 ${place.id}@${place.at ?? '끝'}`, remove && `뺌 ${remove}`, ...Object.keys(patch).map((k) => `${k}=${JSON.stringify((patch as Record<string, unknown>)[k])}`)].filter(Boolean).join(' · ');
  return write(req, { action: 'role', summary: `역할 ${role}: ${what}`, expect }, (docs) => {
    let next = docs;
    if (place) next = placeInRole(next, { role, ...place });
    if (remove) next = removeFromRole(next, { role, id: remove });
    if (Object.keys(patch).length) next = patchRole(next, role, patch);
    return next;
  });
});
