import { OpError } from '@/content/ops';
import { authorize, checkPassword, clearSessionCookie, ok, readJson, route, sessionCookie } from '@/lib/content-api';

// 어드민 로그인 — 비밀번호(피드백 모드와 같은 것)를 서버가 해시로 확인하고 HttpOnly 쿠키를 준다.
// POST {password} → 200 + Set-Cookie · GET → 지금 누구로 들어와 있나 · DELETE → 로그아웃
export const dynamic = 'force-dynamic';

export const POST = route(async (req) => {
  const { password } = await readJson<{ password?: string }>(req);
  if (!password || !(await checkPassword(password))) throw new OpError(401, 'unauthorized', '비밀번호가 맞지 않습니다');
  return ok({ actor: 'admin' }, { headers: { 'set-cookie': await sessionCookie() } });
});

export const GET = route(async (req) => ok({ actor: await authorize(req) }));

export const DELETE = route(async () => ok({}, { headers: { 'set-cookie': clearSessionCookie } }));
