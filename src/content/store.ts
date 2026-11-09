import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cache } from 'react';
import { LOCALES, type Locale } from '@/i18n/config';
import { OpError } from './ops';
import { validateSite, type Problem, type Roles, type SiteDocs } from './schema';
import { STATIC_DOCS } from './static-site';
import type { Content } from './types';

// 본문을 어디서 읽고 어떻게 쓰는가 — D1 문서 다섯 개(content:ko·en·es · roles · hidden).
// 화면은 getSite() 만 부른다. 같은 요청 안에서는 한 번만 읽는다(React cache).

export const DOC_KEYS = ['content:ko', 'content:en', 'content:es', 'roles', 'hidden'] as const;
export type DocKey = (typeof DOC_KEYS)[number];

export type Site = SiteDocs & {
  /** 어디서 읽었나 — d1 이 정상, static 은 D1 이 없는 빌드(Vercel)에서만 */
  source: 'd1' | 'static';
  versions: Partial<Record<DocKey, number>>;
  /** 가장 최근에 바뀐 문서의 시각(ISO) */
  updatedAt: string;
};

/**
 * 본문 출처. 기본은 D1. Vercel 빌드(VERCEL=1)는 D1 이 없으니 저장소의 TS 파일을 쓴다 — Workers 로 옮기는 동안 지금 운영이 안 깨지게.
 * Workers 에서는 D1 이 없으면 조용히 TS 파일로 넘어가지 않고 실패한다(낡은 본문을 「정상」처럼 보여 주지 않게).
 */
export function contentSource(): 'd1' | 'static' {
  const v = process.env.CONTENT_SOURCE;
  if (v === 'static' || v === 'd1') return v;
  return process.env.VERCEL ? 'static' : 'd1';
}

export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as Partial<CloudflareEnv>).DB;
  if (!db) throw new OpError(503, 'no_db', 'D1 바인딩(DB)이 없습니다 — wrangler.jsonc 의 d1_databases 를 확인하세요');
  return db;
}

const keyOf = (l: Locale): DocKey => `content:${l}`;

type Row = { key: DocKey; body: string; version: number; updated_at: string };

function docsFromRows(rows: Row[]): Site {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const missing = DOC_KEYS.filter((k) => !byKey.has(k));
  if (missing.length) {
    throw new OpError(503, 'not_seeded', `D1 에 본문이 없습니다(${missing.join(', ')}) — 마이그레이션과 시드를 먼저: pnpm db:migrate:local && pnpm db:seed:local`);
  }
  const parse = <T,>(k: DocKey) => JSON.parse(byKey.get(k)!.body) as T;
  return {
    content: Object.fromEntries(LOCALES.map((l) => [l, parse<Content>(keyOf(l))])) as Record<Locale, Content>,
    roles: parse<Roles>('roles'),
    hidden: parse<string[]>('hidden'),
    source: 'd1',
    versions: Object.fromEntries(rows.map((r) => [r.key, r.version])),
    updatedAt: rows.map((r) => r.updated_at).sort().at(-1)!,
  };
}

export async function readSite(db: D1Database): Promise<Site> {
  const { results } = await db.prepare('SELECT key, body, version, updated_at FROM content_doc').all<Row>();
  return docsFromRows(results);
}

/**
 * `next build` 가 미리 그릴 때는 D1 대신 빌드 직전에 뜬 스냅숏을 읽는다(scripts/content-snapshot.mjs — 이유는 그 파일 머리).
 * 스냅숏이 없으면 빌드를 멈춘다 — TS 파일로 조용히 넘어가면 D1 과 다른 본문이 배포된다.
 */
async function readSnapshot(): Promise<Site> {
  const { readFile } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const file = join(process.cwd(), '.wrangler', 'content-snapshot.json');
  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch {
    throw new OpError(503, 'no_snapshot', `빌드용 본문 스냅숏이 없습니다(${file}) — pnpm cf:build 로 빌드하세요(스냅숏을 먼저 뜬다)`);
  }
  return docsFromRows((JSON.parse(raw) as { rows: Row[] }).rows);
}

/** 화면이 부르는 단 하나 — 같은 요청(페이지 + generateMetadata) 안에서는 D1 을 한 번만 읽는다 */
export const getSite = cache(async (): Promise<Site> => {
  if (contentSource() === 'static') {
    return { ...STATIC_DOCS, source: 'static', versions: {}, updatedAt: new Date().toISOString() };
  }
  if (process.env.NEXT_PHASE === 'phase-production-build') return readSnapshot();
  return readSite(await getDb());
});

// ── 쓰기 ─────────────────────────────────────────────────────────────────

export type Actor = 'admin' | 'agent' | 'seed';
export type Action = 'seed' | 'set' | 'add-project' | 'role' | 'hide' | 'layout' | 'undo';

export type WriteResult = { changeId: string | null; changed: DocKey[]; versions: Partial<Record<DocKey, number>> };

export class ValidationError extends OpError {
  constructor(public problems: Problem[]) {
    super(422, 'invalid', `검사를 통과하지 못했습니다 — ${problems.length}건 (첫 줄: ${problems[0]?.path} · ${problems[0]?.message})`);
  }
}

function bodiesOf(docs: SiteDocs): Record<DocKey, string> {
  return {
    'content:ko': JSON.stringify(docs.content.ko),
    'content:en': JSON.stringify(docs.content.en),
    'content:es': JSON.stringify(docs.content.es),
    roles: JSON.stringify(docs.roles),
    hidden: JSON.stringify(docs.hidden),
  };
}

export function newChangeId(): string {
  return `${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * base(읽은 상태) → next 로 쓴다. 검사 → 바뀐 문서만 → 이력 + 본문을 한 batch(트랜잭션)로.
 * 읽은 뒤 누가 먼저 썼으면 트리거가 batch 전체를 되돌리고 409 를 던진다.
 */
export async function writeSite(
  db: D1Database,
  base: Site,
  next: SiteDocs,
  meta: { action: Action; actor: Actor; summary: string; changeId?: string; undoes?: string; extra?: D1PreparedStatement[] },
): Promise<WriteResult> {
  const problems = validateSite(next);
  if (problems.length) throw new ValidationError(problems);
  const before = bodiesOf(base);
  const after = bodiesOf(next);
  const changed = DOC_KEYS.filter((k) => before[k] !== after[k]);
  if (!changed.length) return { changeId: null, changed: [], versions: base.versions };

  const changeId = meta.changeId ?? newChangeId();
  const at = new Date().toISOString();
  // 안 바꾼 문서도 검사(validateSite)에 썼다 — 그 사이 바뀌었으면 batch 전체를 막는다(migrations/0003). 바꾼 문서는 아래 트리거가 지킨다
  const statements: D1PreparedStatement[] = DOC_KEYS.filter((k) => !changed.includes(k) && base.versions[k] !== undefined).map((k) =>
    db.prepare('INSERT INTO content_version_check (key) SELECT key FROM content_doc WHERE key = ?1 AND version != ?2').bind(k, base.versions[k]!),
  );
  for (const key of changed) {
    const version = base.versions[key];
    if (version === undefined) throw new OpError(503, 'not_seeded', `${key} 문서가 없습니다 — 시드를 먼저`);
    // 이력에 「쓰기 직전 값」을 D1 에서 직접 복사한다 — 읽은 값이 아니라 실제로 덮이는 값이 남는다
    statements.push(
      db
        .prepare(
          `INSERT INTO content_history (change_id, key, version, prev_body, body, action, actor, summary, at, undoes)
           SELECT ?1, key, ?2, body, ?3, ?4, ?5, ?6, ?7, ?9 FROM content_doc WHERE key = ?8`,
        )
        .bind(changeId, version + 1, after[key], meta.action, meta.actor, meta.summary, at, key, meta.undoes ?? null),
      db.prepare('UPDATE content_doc SET body = ?1, version = ?2, updated_at = ?3, updated_by = ?4 WHERE key = ?5').bind(after[key], version + 1, at, meta.actor, key),
    );
  }
  try {
    await db.batch([...statements, ...(meta.extra ?? [])]);
  } catch (e) {
    if (String(e).includes('version_conflict')) {
      throw new OpError(409, 'conflict', '그 사이 다른 곳에서 먼저 저장했습니다 — 다시 읽고(GET) 다시 시도하세요');
    }
    throw e;
  }
  const versions = { ...base.versions };
  for (const key of changed) versions[key] = (base.versions[key] ?? 0) + 1;
  return { changeId, changed, versions };
}

// ── 이력 · 되돌리기 ──────────────────────────────────────────────────────

export type HistoryRow = {
  id: number;
  undoes?: string | null;
  change_id: string;
  key: DocKey;
  version: number;
  action: Action;
  actor: Actor;
  summary: string;
  at: string;
  undone_by: string | null;
};

export type Change = { changeId: string; action: Action; actor: Actor; summary: string; at: string; keys: DocKey[]; undoneBy: string | null };

export async function listChanges(db: D1Database, limit = 20): Promise<Change[]> {
  const { results } = await db
    .prepare(
      `SELECT id, change_id, key, version, action, actor, summary, at, undone_by FROM content_history
       WHERE change_id IN (SELECT change_id FROM content_history GROUP BY change_id ORDER BY MAX(id) DESC LIMIT ?1)
       ORDER BY id DESC`,
    )
    .bind(limit)
    .all<HistoryRow>();
  const byChange = new Map<string, Change>();
  for (const r of results) {
    const c = byChange.get(r.change_id) ?? { changeId: r.change_id, action: r.action, actor: r.actor, summary: r.summary, at: r.at, keys: [], undoneBy: r.undone_by };
    c.keys.push(r.key);
    byChange.set(r.change_id, c);
  }
  return [...byChange.values()];
}

/**
 * change 하나를 되돌린다. 기본 대상은 「가장 최근의, 아직 안 되돌린, 되돌리기가 아닌 저장」 — 그래서 undo 를 여러 번 부르면
 * 한 칸씩 뒤로 간다(되돌리기를 되돌리는 「다시 하기」는 그 undo 의 changeId 를 직접 준다).
 * 그 저장 뒤에 같은 문서가 또 바뀌어 지금 값이 그 저장이 쓴 값과 다르면 막는다 — 뒤의 저장을 조용히 지우지 않게.
 * (뒤의 저장을 이미 되돌려서 값이 같아졌으면 통과한다. 버전 번호가 아니라 내용을 비교하는 이유)
 */
export async function undoChange(db: D1Database, base: Site, changeId: string | undefined, actor: Actor): Promise<WriteResult & { undid: string }> {
  const target =
    changeId ??
    (
      await db
        .prepare(`SELECT change_id FROM content_history WHERE undone_by IS NULL AND action NOT IN ('seed', 'undo') ORDER BY id DESC LIMIT 1`)
        .first<{ change_id: string }>()
    )?.change_id;
  if (!target) throw new OpError(404, 'not_found', '되돌릴 저장이 없습니다');
  const { results } = await db
    .prepare('SELECT key, body, prev_body, action, summary, undone_by FROM content_history WHERE change_id = ?1')
    .bind(target)
    .all<{ key: DocKey; body: string; prev_body: string | null; action: Action; summary: string; undone_by: string | null }>();
  if (!results.length) throw new OpError(404, 'not_found', `change "${target}" 가 없습니다`);
  if (results[0].undone_by) throw new OpError(409, 'conflict', `이미 되돌렸습니다(${results[0].undone_by}) — 그걸 되돌리려면 그 change 를 undo 하세요`);
  if (results[0].action === 'seed') throw new OpError(409, 'conflict', '시드(처음 넣은 본문)는 되돌리지 않습니다');

  const current = bodiesOf(base);
  const next: SiteDocs = structuredClone({ content: base.content, roles: base.roles, hidden: base.hidden });
  for (const r of results) {
    if (current[r.key] !== r.body) {
      throw new OpError(409, 'conflict', `${r.key} 는 이 저장 뒤에 또 바뀌었습니다 — GET /api/content/history 에서 뒤의 저장부터 되돌리세요`);
    }
    if (r.prev_body === null) throw new OpError(409, 'conflict', `${r.key} 는 이 저장이 처음 만든 문서라 되돌릴 값이 없습니다`);
    const prev = JSON.parse(r.prev_body);
    if (r.key === 'roles') next.roles = prev;
    else if (r.key === 'hidden') next.hidden = prev;
    else next.content[r.key.slice('content:'.length) as Locale] = prev;
  }
  const undoId = newChangeId();
  const result = await writeSite(db, base, next, {
    action: 'undo',
    actor,
    summary: `되돌림: ${results[0].summary}`,
    changeId: undoId,
    undoes: target,
    extra: await statusUpdates(db, target, undoId),
  });
  return { ...result, undid: target };
}

/**
 * target 을 undoId 가 되돌렸다고 적고, 그 연쇄를 따라 「살아 있음」을 맞춘다.
 * target 이 되돌리기였으면(= 다시 하기) 그게 되돌렸던 저장은 다시 살아 있고, 그 저장이 또 되돌리기였으면 그 대상은 다시 되돌린 상태다 …
 * 이걸 맞춰 둬야 기본 undo(가장 최근의 살아 있는 저장)가 사람이 기대하는 것을 고른다.
 */
async function statusUpdates(db: D1Database, target: string, undoId: string): Promise<D1PreparedStatement[]> {
  const out = [db.prepare('UPDATE content_history SET undone_by = ?1 WHERE change_id = ?2').bind(undoId, target)];
  let current = target;
  let active = true; // current 가 꺼졌으니 그 대상은 켜진다
  for (let depth = 0; depth < 20; depth += 1) {
    const row = await db.prepare('SELECT action, undoes FROM content_history WHERE change_id = ?1 LIMIT 1').bind(current).first<{ action: Action; undoes: string | null }>();
    if (!row || row.action !== 'undo' || !row.undoes) break;
    out.push(db.prepare('UPDATE content_history SET undone_by = ?1 WHERE change_id = ?2').bind(active ? null : current, row.undoes));
    current = row.undoes;
    active = !active;
  }
  return out;
}
