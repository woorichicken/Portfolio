import { listChanges } from '@/content/store';
import { authorize, ok, openStore, route } from '@/lib/content-api';

// GET /api/content/history?limit=20 — 최근 저장(change) 목록. 되돌리기는 이 changeId 로
export const dynamic = 'force-dynamic';

export const GET = route(async (req) => {
  await authorize(req);
  const { db } = await openStore();
  const limit = Math.min(100, Math.max(1, Number(new URL(req.url).searchParams.get('limit') ?? 20) || 20));
  return ok({ changes: await listChanges(db, limit) });
});
