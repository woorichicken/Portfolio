import { getCloudflareContext } from '@opennextjs/cloudflare';
import { revalidatePath } from 'next/cache';
import { OpError, affectedPaths } from '@/content/ops';
import type { SiteDocs } from '@/content/schema';
import { DOC_KEYS, ValidationError, contentSource, getDb, readSite, writeSite, type Action, type Actor, type DocKey, type Site } from '@/content/store';
import { FEEDBACK_PASSWORD_HASH, hashPassword } from './feedback-gate';

// /api/content/* 공통 — 인증 · 응답 모양 · 「읽기 → 바꾸기 → 검사 → 쓰기 → 다시 그리기」 한 흐름.
// 응답·오류 모양은 docs/content-api.md 표와 같게 둔다(바꾸면 둘 다).

// ── 응답 ─────────────────────────────────────────────────────────────────

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

export function ok(data: Record<string, unknown>, init?: ResponseInit): Response {
  return new Response(JSON.stringify({ ok: true, ...data }), { ...init, headers: { ...JSON_HEADERS, ...init?.headers } });
}

export function fail(status: number, code: string, message: string, extra?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ ok: false, error: { code, message, ...extra } }), { status, headers: JSON_HEADERS });
}

/** 핸들러를 감싸 OpError·검사 실패·모르는 오류를 같은 모양으로 바꾼다 */
export function route(handler: (req: Request, ctx: { params: Promise<Record<string, string | string[]>> }) => Promise<Response>) {
  return async (req: Request, ctx: { params: Promise<Record<string, string | string[]>> }) => {
    // D1 없는 정적 배포(Vercel)는 Cloudflare 컨텍스트·비밀이 없다 — 인증부터 시도하면 500 이 난다. 먼저 깔끔히 거절한다(수정 1회차 P1)
    if (contentSource() === 'static') return fail(503, 'no_db', '이 배포는 D1 없이 저장소 파일을 읽습니다(CONTENT_SOURCE=static) — 콘텐츠 API 가 없습니다');
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof ValidationError) return fail(422, 'invalid', e.message, { problems: e.problems });
      if (e instanceof OpError) return fail(e.status, e.code, e.message);
      console.error('[content-api]', e);
      return fail(500, 'internal', '서버 오류 — Worker 로그(wrangler tail)를 보세요');
    }
  };
}

/** 본문이 비어 있으면 {} — 있는데 JSON 이 아니면 400(조용히 {} 로 바꾸지 않는다 — 수정 1회차 P2d) */
export async function readOptionalJson<T extends object>(req: Request): Promise<Partial<T>> {
  const text = await req.text();
  if (!text.trim()) return {};
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new OpError(400, 'bad_json', '본문이 JSON 이 아닙니다 — 비우거나 { "changeId": "…" } 로 보내세요');
  }
  // "…" 처럼 JSON 이지만 객체가 아니면 changeId 를 못 읽어 「가장 최근」으로 새어 나간다 — 그것도 400
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new OpError(400, 'bad_json', '본문은 JSON 객체여야 합니다 — 예: { "changeId": "…" }');
  return value as Partial<T>;
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new OpError(400, 'bad_json', '본문이 JSON 이 아닙니다 — Content-Type: application/json 으로 보내세요');
  }
}

// ── 인증 ─────────────────────────────────────────────────────────────────
// 사람(어드민): 비밀번호 → POST /api/content/auth → HttpOnly 쿠키(12시간). 에이전트: Authorization: Bearer <CONTENT_API_TOKEN>.
// 비밀은 Worker secret(로컬은 .dev.vars). 하나라도 없으면 그 방법은 꺼진다(열어 두지 않는다).

export const SESSION_COOKIE = 'solhun_admin';
const SESSION_HOURS = 12;

type Env = { CONTENT_API_TOKEN?: string; ADMIN_SESSION_SECRET?: string; ADMIN_PASSWORD_HASH?: string };

async function secrets(): Promise<Env> {
  const { env } = await getCloudflareContext({ async: true });
  return env as unknown as Env;
}

const enc = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** 길이가 같을 때 글자를 다 비교한다 — 앞에서부터 틀린 곳을 시간으로 알아내지 못하게 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkPassword(password: string): Promise<boolean> {
  const env = await secrets();
  return safeEqual(await hashPassword(password), env.ADMIN_PASSWORD_HASH || FEEDBACK_PASSWORD_HASH);
}

export async function sessionCookie(): Promise<string> {
  const env = await secrets();
  if (!env.ADMIN_SESSION_SECRET) throw new OpError(503, 'no_secret', 'ADMIN_SESSION_SECRET 가 없습니다 — .dev.vars(로컬) 또는 wrangler secret put(운영)');
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  const value = `${exp}.${await hmac(env.ADMIN_SESSION_SECRET, `admin:${exp}`)}`;
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`;
}

export const clearSessionCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

function cookieValue(req: Request, name: string): string | undefined {
  const raw = req.headers.get('cookie') ?? '';
  return raw.split(/;\s*/).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);
}

/** 누가 부르는가. 틀리면 401. 쿠키로 쓰기를 할 때는 같은 출처(Origin)에서 온 요청만 받는다 — 다른 사이트가 쿠키를 빌려 쓰지 못하게 */
export async function authorize(req: Request): Promise<Actor> {
  const env = await secrets();
  const bearer = req.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (bearer) {
    if (env.CONTENT_API_TOKEN && safeEqual(bearer, env.CONTENT_API_TOKEN)) return 'agent';
    throw new OpError(401, 'unauthorized', '토큰이 맞지 않습니다');
  }
  const cookie = cookieValue(req, SESSION_COOKIE);
  if (cookie && env.ADMIN_SESSION_SECRET) {
    const [exp, sig] = cookie.split('.');
    const valid = Number(exp) > Date.now() && sig && safeEqual(sig, await hmac(env.ADMIN_SESSION_SECRET, `admin:${exp}`));
    if (valid) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        // req.url 이 아니라 Host 헤더와 비교한다 — Workers(OpenNext) 안의 req.url 호스트는 브라우저가 연 주소와 다를 수 있다(2026-11-08 로컬에서 403)
        const origin = req.headers.get('origin');
        const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
        if (!origin || !host || new URL(origin).host !== host) throw new OpError(403, 'bad_origin', `다른 출처에서 온 쓰기 요청입니다(origin ${origin ?? '없음'} · host ${host ?? '없음'})`);
      }
      return 'admin';
    }
  }
  throw new OpError(401, 'unauthorized', '로그인이 필요합니다 — 어드민 비밀번호(POST /api/content/auth) 또는 Authorization: Bearer <CONTENT_API_TOKEN>');
}

// ── 쓰기 흐름 ─────────────────────────────────────────────────────────────

export async function openStore(): Promise<{ db: D1Database; base: Site }> {
  if (contentSource() === 'static') throw new OpError(503, 'no_db', '이 배포는 D1 없이 저장소 파일을 읽습니다(CONTENT_SOURCE=static) — 저장할 수 없습니다');
  const db = await getDb();
  return { db, base: await readSite(db) };
}

export type Expect = Partial<Record<DocKey, number>>;

/** 요청이 「이 버전을 보고 고쳤다」고 말하면(expect) 그 사이 바뀌었는지 먼저 본다 — 어드민처럼 화면을 오래 열어 둔 쪽을 위해 */
function checkExpect(base: Site, expect: Expect | undefined) {
  for (const [key, v] of Object.entries(expect ?? {})) {
    if (!(DOC_KEYS as readonly string[]).includes(key)) throw new OpError(400, 'bad_request', `expect 에 모르는 문서: ${key}`);
    if (base.versions[key as DocKey] !== v) {
      throw new OpError(409, 'conflict', `${key} 가 그 사이 바뀌었습니다(보던 v${v} · 지금 v${base.versions[key as DocKey]}) — 새로 읽고 다시 저장하세요`);
    }
  }
}

/**
 * 쓰기 한 번. op 가 다음 문서 묶음을 만들고, 검사 → D1 → 그 페이지들만 다시 그리기까지 한다.
 * 응답: { changeId, changed, versions, revalidated } — 아무것도 안 바뀌었으면 changeId 가 null 이고 아무것도 다시 그리지 않는다.
 */
export async function write(
  req: Request,
  meta: { action: Action; summary: string | ((docs: SiteDocs) => string); expect?: Expect },
  op: (docs: SiteDocs) => SiteDocs,
): Promise<Response> {
  const actor = await authorize(req);
  const { db, base } = await openStore();
  checkExpect(base, meta.expect);
  const next = op(base);
  const summary = typeof meta.summary === 'function' ? meta.summary(next) : meta.summary;
  const result = await writeSite(db, base, next, { action: meta.action, actor, summary });
  const revalidated = result.changeId ? revalidate(affectedPaths(base, next)) : [];
  return ok({ ...result, actor, summary, revalidated });
}

/** 저장 직후 그 페이지들만 무효로 만든다 — 다음 요청이 D1 에서 새로 읽어 다시 그린다(OpenNext D1 태그 캐시) */
export function revalidate(paths: string[]): string[] {
  for (const p of paths) revalidatePath(p);
  return paths;
}
