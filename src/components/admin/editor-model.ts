import { LOCALES, type Locale } from '@/i18n/config';

// 어드민 편집기의 순수 함수 — 화면(React)을 모른다. 유닛 테스트가 직접 부른다(src/components/admin/__tests__).
//
// 편집기는 세 언어 값을 나란히 들고 있다(`L3<T>` = { ko, en, es }). 저장은 항목·목록을 통째로 PATCH /api/content/field 에 보낸다
// (`{ path, values: { ko, en, es } }` — 한 번 저장 = 이력 한 줄 = 되돌리기 한 번).
// 세 언어 모양이 어긋나지 않게 **목록 줄 추가·빼기·순서와 선택 칸 켜고 끄기는 세 언어에 같이** 한다. 글자만 언어마다 다르다.

export type L3<T> = Record<Locale, T>;
export type Path = (string | number)[];
export type Problem = { path: string; message: string };

const clone = <T>(v: T): T => structuredClone(v);

/** ['improvements', 0, 'badge'] → 'improvements[0].badge' — 서버 문제(problems) 경로와 맞춰 보는 열쇠 */
export function keyOf(path: Path): string {
  return path.map((p, i) => (typeof p === 'number' ? `[${p}]` : i === 0 ? p : `.${p}`)).join('');
}

export function getIn(root: unknown, path: Path): unknown {
  let cur = root;
  for (const p of path) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string | number, unknown>)[p];
  }
  return cur;
}

/** 새 객체를 돌려준다(원본은 그대로). value 가 undefined 면 그 칸을 지운다(배열이면 줄을 뺀다) */
function setInPlace(root: unknown, path: Path, value: unknown) {
  let cur = root as Record<string | number, unknown>;
  path.forEach((p, i) => {
    const last = i === path.length - 1;
    if (last) {
      if (value === undefined) {
        if (Array.isArray(cur)) cur.splice(p as number, 1);
        else delete cur[p];
      } else cur[p] = value;
      return;
    }
    if (cur[p] === undefined || cur[p] === null) cur[p] = typeof path[i + 1] === 'number' ? [] : {};
    cur = cur[p] as Record<string | number, unknown>;
  });
}

/** 한 언어의 칸 하나 */
export function setOne<T>(draft: L3<T>, locale: Locale, path: Path, value: unknown): L3<T> {
  const next = clone(draft);
  setInPlace(next[locale], path, value);
  return next;
}

/** 세 언어에 같은 값 — 주소·사진 파일·id 처럼 언어마다 같아야 하는 칸 */
export function setAll<T>(draft: L3<T>, path: Path, value: unknown): L3<T> {
  const next = clone(draft);
  for (const l of LOCALES) setInPlace(next[l], path, clone(value));
  return next;
}

/** 선택 글자 칸(배지·캡션 등) — 비우면 그 언어에서 칸을 지운다. 한 언어만 채우면 서버가 「ko 에만 있는 칸」으로 막는다(422) */
export function setOptionalText<T>(draft: L3<T>, locale: Locale, path: Path, value: string): L3<T> {
  return setOne(draft, locale, path, value === '' ? undefined : value);
}

/** 세 언어에 같은 값을 넣되, 비면 지운다(repo·homepage 같은 선택 주소) */
export function setAllOptional<T>(draft: L3<T>, path: Path, value: string): L3<T> {
  return setAll(draft, path, value.trim() === '' ? undefined : value.trim());
}

/** 목록 끝에 줄 하나 — 세 언어 같이. 목록이 없으면(선택 목록) 만든다 */
export function listAdd<T>(draft: L3<T>, path: Path, make: (l: Locale) => unknown): L3<T> {
  const next = clone(draft);
  for (const l of LOCALES) {
    const list = getIn(next[l], path);
    if (Array.isArray(list)) list.push(make(l));
    else setInPlace(next[l], path, [make(l)]);
  }
  return next;
}

/** 줄 하나 빼기 — 세 언어 같이. optional 이면 비었을 때 목록 칸 자체를 지운다(빈 목록을 남기지 않는다) */
export function listRemove<T>(draft: L3<T>, path: Path, index: number, optional = false): L3<T> {
  const next = clone(draft);
  for (const l of LOCALES) {
    const list = getIn(next[l], path);
    if (!Array.isArray(list)) continue;
    list.splice(index, 1);
    if (optional && list.length === 0) setInPlace(next[l], path, undefined);
  }
  return next;
}

/** 줄 순서 바꾸기 — 세 언어 같이 */
export function listMove<T>(draft: L3<T>, path: Path, index: number, dir: -1 | 1): L3<T> {
  const next = clone(draft);
  for (const l of LOCALES) {
    const list = getIn(next[l], path);
    if (!Array.isArray(list)) continue;
    const j = index + dir;
    if (index < 0 || j < 0 || j >= list.length) return draft;
    [list[index], list[j]] = [list[j], list[index]];
  }
  return next;
}

/** 선택 묶음(배운 점 · 지표 등) 켜고 끄기 — 세 언어 같이 */
export function toggleGroup<T>(draft: L3<T>, path: Path, make: ((l: Locale) => unknown) | null): L3<T> {
  const next = clone(draft);
  for (const l of LOCALES) setInPlace(next[l], path, make ? make(l) : undefined);
  return next;
}

// ── 서버 문제(422 problems) → 칸 ─────────────────────────────────────────────
// 서버 경로는 두 모양이다:
//   zod 검사     content.ko.work.projects.0.improvements.1.badge   (언어 + 점 번호)
//   세 언어 모양  work.projects[kits].improvements[1].badge          (언어 없음 + [id 또는 번호])
// 둘 다 `work.projects[0].improvements[1].badge` 꼴로 맞춘 뒤, 편집 중인 항목 아래만 떼어 칸 열쇠(keyOf)로 바꾼다.

export function normalizeProblemPath(path: string): { locale?: Locale; path: string } {
  let p = path;
  let locale: Locale | undefined;
  const m = p.match(/^content\.(ko|en|es)\.(.*)$/);
  if (m) {
    locale = m[1] as Locale;
    p = m[2];
  } else p = p.replace(/^content\./, '');
  p = p.replace(/\.(\d+)(?=\.|$)/g, '[$1]');
  return { locale, path: p };
}

export type FieldProblems = { byField: Record<string, (Problem & { locale?: Locale })[]>; all: (Problem & { locale?: Locale })[] };

/**
 * 편집 중인 것(prefix 아래)의 문제를 칸별로. prefix 가 목록 항목이면(`work.projects`) 그 항목 하나 — 다른 항목은 이 저장 전에 이미 검사를 통과했으므로
 * 문제는 이번에 고친 항목에서만 나온다. ids 를 주면 `[id]` 를 화면의 줄 번호 `[n]` 로 바꾼다(오픈소스·영상 목록).
 */
export function problemsUnder(problems: Problem[], prefix: string, opts: { itemList?: boolean; ids?: string[] } = {}): FieldProblems {
  const out: FieldProblems = { byField: {}, all: [] };
  for (const raw of problems) {
    const { locale, path } = normalizeProblemPath(raw.path);
    const entry = { ...raw, locale };
    out.all.push(entry);
    if (!path.startsWith(prefix)) continue;
    let rest = path.slice(prefix.length);
    if (opts.itemList) {
      const head = rest.match(/^\[[^\]]+\]/);
      if (!head) continue;
      rest = rest.slice(head[0].length);
    }
    if (opts.ids) rest = rest.replace(/\[([^\]]+)\]/, (all, x: string) => (/^\d+$/.test(x) ? all : opts.ids!.includes(x) ? `[${opts.ids!.indexOf(x)}]` : all));
    const key = rest.replace(/^\./, '');
    (out.byField[key] ??= []).push(entry);
  }
  return out;
}

// ── 무엇이 바뀌었나(저장 단추 옆 한 줄) ─────────────────────────────────────

/** 처음 값과 지금 값의 맨 위 칸 중 바뀐 것 — `tagline (ko·en)` 꼴 */
export function changedFields(before: L3<unknown>, after: L3<unknown>): string[] {
  const keys = new Map<string, Locale[]>();
  for (const l of LOCALES) {
    const a = (before[l] ?? {}) as Record<string, unknown>;
    const b = (after[l] ?? {}) as Record<string, unknown>;
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (JSON.stringify(a[k]) === JSON.stringify(b[k])) continue;
      keys.set(k, [...(keys.get(k) ?? []), l]);
    }
  }
  return [...keys].map(([k, ls]) => `${k} (${ls.join('·')})`);
}

export const sameL3 = (a: L3<unknown>, b: L3<unknown>) => JSON.stringify(a) === JSON.stringify(b);
