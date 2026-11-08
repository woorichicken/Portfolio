import { applyLayout } from '@/content/ops';
import type { RoleDef, RoleId } from '@/content/roles';
import { readJson, route, write, type Expect } from '@/lib/content-api';

// PUT /api/content/layout — 어드민 「저장」. 역할마다 대표작·순서와 숨김 목록을 한 번에(한 change 로 남아 한 번에 되돌린다)
//   { roles: { design: { featured, projects, others }, … }, hidden: [...], expect?: { roles: 3, hidden: 1 } }
export const dynamic = 'force-dynamic';

type Body = { roles?: Partial<Record<RoleId, Pick<RoleDef, 'featured' | 'projects' | 'others'>>>; hidden?: string[]; expect?: Expect };

export const PUT = route(async (req) => {
  const body = await readJson<Body>(req);
  return write(req, { action: 'layout', summary: `어드민 저장 — 역할 ${Object.keys(body.roles ?? {}).length}개 · 숨김 ${body.hidden?.length ?? '그대로'}`, expect: body.expect }, (docs) => applyLayout(docs, body));
});
