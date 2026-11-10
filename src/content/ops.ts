import { LOCALES, browsePath, localePath, projectPath, type Locale } from '@/i18n/config';
import { ROLE_IDS, type RoleDef, type RoleId } from './roles';
import type { Roles, SiteDocs } from './schema';
import type { Content, EarlyWork, OtherWork, Project } from './types';

// 콘텐츠를 바꾸는 순수 함수들 — D1 을 모른다. 문서 묶음(SiteDocs)을 받아 바뀐 묶음을 돌려준다.
// API(src/app/api/content/*)는 이걸 부르고, 결과를 schema.ts 로 검사한 뒤 D1 에 쓴다. 유닛 테스트도 이걸 직접 부른다.

export class OpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

const clone = <T>(v: T): T => structuredClone(v);

// ── 경로(path) — `work.projects[kits].tagline` 같은 주소로 칸 하나를 가리킨다 ─────────────
// [x] 가 숫자면 몇 번째, 아니면 id 또는 slug 가 x 인 항목. 예: hero.lead · others.items[design-atlas].detail.paragraphs[0]

type Step = { key: string } | { index: number } | { match: string };

export function parsePath(path: string): Step[] {
  const steps: Step[] = [];
  const re = /([^.[\]]+)|\[([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  let consumed = '';
  while ((m = re.exec(path))) {
    consumed += m[0];
    if (m[1] !== undefined) steps.push({ key: m[1] });
    else steps.push(/^\d+$/.test(m[2]) ? { index: Number(m[2]) } : { match: m[2] });
  }
  if (!steps.length || consumed.replace(/\./g, '') !== path.replace(/\./g, '')) throw new OpError(400, 'bad_path', `경로를 읽을 수 없습니다: "${path}" — 예: work.projects[kits].tagline`);
  return steps;
}

function childIndex(arr: unknown[], step: Step, path: string): number {
  if ('index' in step) return step.index;
  if ('match' in step) {
    const i = arr.findIndex((v) => v && typeof v === 'object' && ((v as { id?: string }).id === step.match || (v as { slug?: string }).slug === step.match));
    if (i < 0) throw new OpError(404, 'not_found', `"${step.match}" 인 항목이 없습니다 (${path})`);
    return i;
  }
  throw new OpError(400, 'bad_path', `목록에는 [번호] 또는 [id] 로 들어갑니다 (${path})`);
}

export function getAt(root: unknown, path: string): unknown {
  let cur: unknown = root;
  for (const step of parsePath(path)) {
    if (Array.isArray(cur)) cur = cur[childIndex(cur, step, path)];
    else if (cur && typeof cur === 'object' && 'key' in step) cur = (cur as Record<string, unknown>)[step.key];
    else throw new OpError(404, 'not_found', `경로가 없습니다: ${path}`);
    if (cur === undefined) throw new OpError(404, 'not_found', `경로가 없습니다: ${path}`);
  }
  return cur;
}

/** 칸 하나를 바꾼다(unset 이면 지운다). 마지막 칸은 없어도 되고(선택 칸 추가), 중간 칸은 있어야 한다 */
export function setAt(root: unknown, path: string, value: unknown, unset = false): void {
  const steps = parsePath(path);
  let cur: unknown = root;
  steps.forEach((step, i) => {
    const last = i === steps.length - 1;
    if (Array.isArray(cur)) {
      const idx = childIndex(cur, step, path);
      if (last) {
        if (unset) cur.splice(idx, 1);
        else if (idx <= cur.length) cur[idx] = value;
        else throw new OpError(400, 'bad_path', `목록 끝을 넘었습니다 (${path})`);
      } else cur = cur[idx];
    } else if (cur && typeof cur === 'object' && 'key' in step) {
      const obj = cur as Record<string, unknown>;
      if (last) {
        if (unset) delete obj[step.key];
        else obj[step.key] = value;
      } else cur = obj[step.key];
    } else throw new OpError(404, 'not_found', `경로가 없습니다: ${path}`);
    if (!last && cur === undefined) throw new OpError(404, 'not_found', `경로가 없습니다: ${path}`);
  });
}

// ── 연산 ─────────────────────────────────────────────────────────────────

export type FieldEdit =
  | { path: string; locale: Locale; value: unknown }
  | { path: string; values: Partial<Record<Locale, unknown>> }
  | { path: string; unset: true; locales?: Locale[] };

/** 본문 칸 바꾸기. 세 언어 모양을 맞춰야 하는 칸(선택 칸 추가·목록 길이)은 values 로 세 언어를 한 번에 준다 */
export function editField(docs: SiteDocs, edit: FieldEdit): SiteDocs {
  const next = clone(docs);
  if ('unset' in edit) {
    for (const l of edit.locales ?? LOCALES) setAt(next.content[l], edit.path, undefined, true);
  } else if ('values' in edit) {
    const entries = Object.entries(edit.values) as [Locale, unknown][];
    if (!entries.length) throw new OpError(400, 'bad_request', 'values 에 언어가 하나도 없습니다');
    for (const [l, v] of entries) {
      if (!LOCALES.includes(l)) throw new OpError(400, 'bad_request', `모르는 언어: ${l}`);
      setAt(next.content[l], edit.path, v);
    }
  } else {
    if (!LOCALES.includes(edit.locale)) throw new OpError(400, 'bad_request', `모르는 언어: ${edit.locale}`);
    setAt(next.content[edit.locale], edit.path, edit.value);
  }
  return next;
}

/**
 * 이력 한 줄 — 칸 하나면 그 경로, 객체·목록을 통째로 넣었으면(어드민 「항목 저장」) 그 안에서 바뀐 칸 이름과 언어까지 적는다.
 * 예: `고침 work.projects[kits] — tagline·summary (ko·en)`. 바뀐 것이 없으면 경로만.
 */
export function describeEdit(prev: SiteDocs, next: SiteDocs, edit: FieldEdit): string {
  const verb = 'unset' in edit ? '지움' : '고침';
  if ('unset' in edit) return `${verb} ${edit.path} (${(edit.locales ?? LOCALES).join('·')})`;
  const read = (docs: SiteDocs, l: Locale) => {
    try {
      return getAt(docs.content[l], edit.path);
    } catch {
      return undefined;
    }
  };
  const keys = new Set<string>();
  const locales: Locale[] = [];
  for (const l of LOCALES) {
    const a = read(prev, l);
    const b = read(next, l);
    if (same(a, b)) continue;
    locales.push(l);
    const objA = a && typeof a === 'object' && !Array.isArray(a) ? (a as Record<string, unknown>) : null;
    const objB = b && typeof b === 'object' && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
    if (objA && objB) for (const k of new Set([...Object.keys(objA), ...Object.keys(objB)])) if (!same(objA[k], objB[k])) keys.add(k);
    if (!objA && objB) keys.add('(새로)');
  }
  const where = locales.length ? locales.join('·') : 'locale' in edit ? edit.locale : Object.keys(edit.values).join('·');
  const what = keys.size ? ` — ${[...keys].slice(0, 6).join('·')}${keys.size > 6 ? ` 외 ${keys.size - 6}` : ''}` : '';
  return `${verb} ${edit.path}${what} (${where})`;
}

export type ItemKind = 'project' | 'other' | 'early';
type ItemOf<K extends ItemKind> = K extends 'project' ? Project : K extends 'other' ? OtherWork : EarlyWork;

export function listOf(content: Content, kind: ItemKind): (Project | OtherWork | EarlyWork)[] {
  return kind === 'project' ? content.work.projects : kind === 'other' ? content.others.items : content.early.items;
}

export function itemId(item: Project | OtherWork | EarlyWork): string {
  return 'id' in item ? item.id : item.slug;
}

export type AddItem<K extends ItemKind = ItemKind> = {
  kind: K;
  item: Record<Locale, ItemOf<K>>;
  /** 목록 안 위치(0부터). 없으면 맨 뒤 */
  at?: number;
  /** 넣을 역할과 그 안의 위치 */
  roles?: { role: RoleId; at?: number }[];
};

/** 프로젝트(큰 프로젝트 · 그 외 · 이전) 하나를 세 언어로 추가 */
export function addItem(docs: SiteDocs, add: AddItem): SiteDocs {
  const next = clone(docs);
  const ids = LOCALES.map((l) => (add.item[l] ? itemId(add.item[l]) : undefined));
  if (ids.some((id) => !id)) throw new OpError(400, 'bad_request', '세 언어(ko·en·es) 모두 item 을 주세요 — 한 언어만 추가하면 모양 검사에서 막힙니다');
  if (new Set(ids).size !== 1) throw new OpError(400, 'bad_request', `세 언어의 id 가 다릅니다: ${ids.join(' · ')}`);
  const id = ids[0]!;
  const exists = (['project', 'other', 'early'] as const).some((k) => listOf(next.content.ko, k).some((i) => itemId(i) === id));
  if (exists) throw new OpError(409, 'exists', `"${id}" 는 이미 있습니다 — 고치려면 field 를 쓰세요`);
  for (const l of LOCALES) {
    const list = listOf(next.content[l], add.kind) as unknown[];
    const at = add.at ?? list.length;
    if (at < 0 || at > list.length) throw new OpError(400, 'bad_request', `at 은 0~${list.length} 입니다`);
    list.splice(at, 0, add.item[l]);
  }
  for (const r of add.roles ?? []) Object.assign(next, placeInRole(next, { role: r.role, id, at: r.at }));
  return next;
}

function roleListKey(docs: SiteDocs, id: string): 'projects' | 'others' {
  if (docs.content.ko.work.projects.some((p) => p.id === id)) return 'projects';
  if ([...docs.content.ko.others.items, ...docs.content.ko.early.items].some((o) => o.slug === id)) return 'others';
  throw new OpError(404, 'not_found', `"${id}" 인 항목이 없습니다`);
}

function assertRole(role: string): asserts role is RoleId {
  if (!(ROLE_IDS as readonly string[]).includes(role)) throw new OpError(404, 'not_found', `모르는 역할: ${role} — ${ROLE_IDS.join(' · ')}`);
}

/** 역할 화면에 항목을 넣거나 위치를 옮긴다. 큰 프로젝트는 projects, 그 외·이전은 others 줄로 간다 */
export function placeInRole(docs: SiteDocs, p: { role: string; id: string; at?: number }): SiteDocs {
  assertRole(p.role);
  const next = clone(docs);
  const key = roleListKey(next, p.id);
  const list = next.roles[p.role][key].filter((x) => x !== p.id);
  const at = p.at ?? list.length;
  if (at < 0 || at > list.length) throw new OpError(400, 'bad_request', `at 은 0~${list.length} 입니다`);
  list.splice(at, 0, p.id);
  next.roles[p.role][key] = list;
  return next;
}

export function removeFromRole(docs: SiteDocs, p: { role: string; id: string }): SiteDocs {
  assertRole(p.role);
  const next = clone(docs);
  const key = roleListKey(next, p.id);
  if (!next.roles[p.role][key].includes(p.id)) throw new OpError(404, 'not_found', `"${p.id}" 는 ${p.role} 역할에 없습니다`);
  if (next.roles[p.role].featured === p.id) throw new OpError(409, 'conflict', `"${p.id}" 는 ${p.role} 의 대표작입니다 — 대표작을 먼저 바꾸세요`);
  next.roles[p.role][key] = next.roles[p.role][key].filter((x) => x !== p.id);
  return next;
}

/** 역할 정의 일부를 바꾼다(featured · projects · others 순서 통째 · early · 이름 등) */
export function patchRole(docs: SiteDocs, role: string, patch: Partial<RoleDef>): SiteDocs {
  assertRole(role);
  const next = clone(docs);
  next.roles[role] = { ...next.roles[role], ...patch };
  return next;
}

/** 어드민 「저장」 — 역할마다 대표작·순서와 숨김 목록을 한 번에 */
export function applyLayout(docs: SiteDocs, layout: { roles?: Partial<Record<RoleId, Pick<RoleDef, 'featured' | 'projects' | 'others'>>>; hidden?: string[] }): SiteDocs {
  let next = clone(docs);
  for (const [role, r] of Object.entries(layout.roles ?? {})) {
    if (!r) continue;
    next = patchRole(next, role, { featured: r.featured, projects: r.projects, others: r.others });
  }
  if (layout.hidden) next.hidden = [...new Set(layout.hidden)];
  return next;
}

export function setHidden(docs: SiteDocs, p: { hide?: string[]; show?: string[] }): SiteDocs {
  const next = clone(docs);
  const set = new Set(next.hidden);
  for (const id of p.hide ?? []) set.add(id);
  for (const id of p.show ?? []) set.delete(id);
  next.hidden = [...set];
  return next;
}

// ── 저장 뒤 다시 그릴 페이지 ───────────────────────────────────────────────

/** 상세 페이지에서만 보이는 칸 — 이것만 바뀌면 그 상세 페이지 하나만 다시 그린다 */
const DETAIL_ONLY: Record<ItemKind, string[]> = {
  project: ['summary', 'parts', 'improvements', 'metrics', 'quotes', 'lesson', 'gallery'],
  other: ['detail'],
  early: ['detail', 'metrics', 'note'],
};

function localePages(docs: SiteDocs, l: Locale): string[] {
  const ids = [...docs.content.ko.work.projects.map((p) => p.id), ...docs.content.ko.others.items.map((o) => o.slug), ...docs.content.ko.early.items.map((e) => e.slug)];
  return [localePath(l), ...ROLE_IDS.map((r) => browsePath(l, r)), ...ids.map((id) => projectPath(l, id)), ...(l === 'ko' ? ['/admin'] : [])];
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * prev → next 로 바뀌었을 때 다시 그려야 하는 주소. 정확히 그 페이지만 고르되, 애매하면 그 언어 전체로 넓힌다(덜 그려서 낡은 화면이 남는 것보다 낫다).
 */
export function affectedPaths(prev: SiteDocs, next: SiteDocs): string[] {
  const out = new Set<string>();
  const ids = (d: SiteDocs) => JSON.stringify(localePages(d, 'ko'));
  // 앞뒤 주소의 합집합 — 항목을 지우는 쪽(추가를 되돌림)이면 next 에 없는 상세도 캐시에서 빼야 404 가 된다(수정 1회차 P2a)
  const pages = (l: Locale) => [...new Set([...localePages(prev, l), ...localePages(next, l)])];
  if (!same(prev.roles, next.roles) || !same(prev.hidden, next.hidden)) {
    // 역할 순서·숨김은 모든 역할 화면과 상세의 「비슷한 작품」에 걸친다
    for (const l of LOCALES) pages(l).forEach((p) => out.add(p));
  }
  for (const l of LOCALES) {
    const a = prev.content[l];
    const b = next.content[l];
    if (same(a, b)) continue;
    const onlyDetail = detailOnlyChanges(a, b);
    if (onlyDetail) onlyDetail.forEach((id) => out.add(projectPath(l, id)));
    else pages(l).forEach((p) => out.add(p));
    // llms.txt 는 한국어 본문과 영어 소개 한 줄을 쓴다
    if (!onlyDetail && (l === 'ko' || l === 'en')) out.add('/llms.txt');
  }
  if (ids(prev) !== ids(next)) {
    out.add('/sitemap.xml');
    out.add('/llms.txt');
  }
  return [...out].sort();
}

/** 바뀐 것이 전부 「상세에만 보이는 칸」이면 그 항목 id 들, 아니면 null */
function detailOnlyChanges(a: Content, b: Content): string[] | null {
  const ids = new Set<string>();
  const rest = (c: Content) => ({ ...c, work: { ...c.work, projects: [] }, others: { ...c.others, items: [] }, early: { ...c.early, items: [] } });
  if (!same(rest(a), rest(b))) return null;
  for (const kind of ['project', 'other', 'early'] as const) {
    const la = listOf(a, kind);
    const lb = listOf(b, kind);
    if (!same(la.map(itemId), lb.map(itemId))) return null;
    for (let i = 0; i < la.length; i += 1) {
      if (same(la[i], lb[i])) continue;
      const keys = new Set([...Object.keys(la[i]), ...Object.keys(lb[i])]);
      for (const k of keys) {
        const ra = (la[i] as Record<string, unknown>)[k];
        const rb = (lb[i] as Record<string, unknown>)[k];
        if (!same(ra, rb) && !DETAIL_ONLY[kind].includes(k)) return null;
      }
      ids.add(itemId(la[i]));
    }
  }
  return [...ids];
}

/** 사람이 읽는 목록 — CLI `get`·어드민이 쓴다 */
export function itemIndex(docs: SiteDocs) {
  const ko = docs.content.ko;
  return (['project', 'other', 'early'] as const).flatMap((kind) =>
    listOf(ko, kind).map((item) => {
      const id = itemId(item);
      return {
        id,
        kind,
        name: item.name,
        hidden: docs.hidden.includes(id),
        roles: (Object.entries(docs.roles) as [RoleId, RoleDef][])
          .filter(([, r]) => r.projects.includes(id) || r.others.includes(id))
          .map(([role, r]) => ({ role, at: (r.projects.includes(id) ? r.projects : r.others).indexOf(id), featured: r.featured === id })),
      };
    }),
  );
}

export type { Roles };
