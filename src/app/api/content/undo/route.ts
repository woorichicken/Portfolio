import { affectedPaths } from '@/content/ops';
import { undoChange } from '@/content/store';
import { authorize, ok, openStore, readJson, revalidate, route } from '@/lib/content-api';

// POST /api/content/undo — { changeId? } 없으면 가장 최근의(아직 안 되돌린) 저장을 되돌린다. 되돌리기도 새 저장으로 남는다
export const dynamic = 'force-dynamic';

export const POST = route(async (req) => {
  const actor = await authorize(req);
  const body = req.headers.get('content-length') === '0' ? {} : await readJson<{ changeId?: string }>(req).catch(() => ({}));
  const { db, base } = await openStore();
  const result = await undoChange(db, base, (body as { changeId?: string }).changeId, actor);
  const { base: after } = await openStore();
  return ok({ ...result, actor, revalidated: result.changeId ? revalidate(affectedPaths(base, after)) : [] });
});
