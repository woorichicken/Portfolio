import { LOCALES, type Locale } from '@/i18n/config';

// 어드민 화면이 콘텐츠 API(/api/content/*)를 부르는 곳 — Admin(배치) · ItemEditor(항목) · ListPanels(오픈소스·영상) · AddProject 가 같이 쓴다.
// 같은 출처라 로그인 쿠키(solhun_admin)가 따라가고, 서버는 쓰기 요청의 Origin 을 확인한다(docs/content-api.md 「인증」).

export type ApiError = { code: string; message: string; problems?: { path: string; message: string }[] };
export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: ApiError };
export type Versions = Record<string, number>;
/** 쓰기 응답(docs/content-api.md 「응답 모양」) */
export type WriteResult = { changeId: string | null; changed: string[]; versions: Versions; revalidated: string[]; summary: string; actor: string; undid?: string };

/** 응답은 늘 { ok, … } 또는 { ok:false, error } */
export async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const isForm = init?.body instanceof FormData;
    // 파일 올리기(FormData)는 브라우저가 경계(boundary)를 붙인 content-type 을 정한다 — 직접 넣으면 서버가 못 읽는다
    const headers = isForm ? { ...init?.headers } : { 'content-type': 'application/json', ...init?.headers };
    const res = await fetch(path, { ...init, headers, credentials: 'same-origin' });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: ApiError } | null;
    if (res.ok && body?.ok) return { ok: true, data: body as T };
    return { ok: false, status: res.status, error: body?.error ?? { code: 'network', message: `응답을 읽지 못했습니다(${res.status})` } };
  } catch {
    return { ok: false, status: 0, error: { code: 'network', message: '서버에 닿지 못했습니다' } };
  }
}

export type Uploaded = { key: string; src: string; contentType: string; size: number; shot: { src: string; width: number; height: number; alt: string } | null };

/** 사진·영상 한 개를 R2 에 올린다(POST /api/content/media). 올리기만으로는 본문이 안 바뀐다 — 돌려받은 src 를 칸에 넣고 「저장」해야 한다 */
export function uploadMedia(file: File, name?: string): Promise<ApiResult<Uploaded>> {
  const form = new FormData();
  form.set('file', file);
  if (name) form.set('name', name);
  return api<Uploaded>('/api/content/media', { method: 'POST', body: form });
}

/** 영상 파일의 가로·세로 — 브라우저가 머리(metadata)만 읽는다. 영상 칸의 width·height 에 넣는다 */
export function videoSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    const done = (r: { width: number; height: number } | null) => {
      URL.revokeObjectURL(url);
      resolve(r);
    };
    v.onloadedmetadata = () => done(v.videoWidth && v.videoHeight ? { width: v.videoWidth, height: v.videoHeight } : null);
    v.onerror = () => done(null);
    v.src = url;
  });
}

/** 파일 이름 → 미디어 이름(키 앞부분) 제안 — 서버가 다시 다듬는다(safeMediaName) */
export function mediaNameOf(file: File): string {
  return file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'upload';
}

// ── 경로 하나 읽고 쓰기 — 편집 패널·오픈소스/영상 탭이 같이 쓴다(수정 1회차) ─────────────────────
// 탭을 옮겨도 쓰던 것을 지키려고 패널을 계속 붙여 두면, 다른 탭이 같은 문서(content:ko …)의 **다른 칸**을 저장해 버전이 올라간다.
// 그대로면 이 패널의 저장이 409 가 된다. 그래서 409 가 나면 그 경로의 서버 값을 다시 읽어 — 처음 읽은 값과 같으면(이 칸은 아무도 안 바꿨다)
// 새 버전으로 한 번 더 보내고, 다르면(누가 같은 칸을 바꿨다) 409 그대로 돌려준다. 남의 저장을 덮지 않는 규칙은 그대로다.


export type PathSnapshot = { values: Record<Locale, unknown>; versions: Versions };

/** 세 언어 문서에서 경로 하나 — 칸이 아직 없으면(404) 그 언어 값은 undefined */
export async function readPath(path: string): Promise<ApiResult<PathSnapshot>> {
  const docs = await Promise.all(LOCALES.map((l) => api<{ value: unknown; version: number }>(`/api/content/doc/${l}?path=${encodeURIComponent(path)}`)));
  const values = {} as Record<Locale, unknown>;
  const versions: Versions = {};
  for (const [i, l] of LOCALES.entries()) {
    const d = docs[i];
    if (d.ok) {
      values[l] = d.data.value;
      versions[`content:${l}`] = d.data.version;
    } else if (d.status === 404 && d.error.code === 'not_found') {
      values[l] = undefined;
      const doc = await api<{ version: number }>(`/api/content/doc/${l}?path=meta`);
      if (!doc.ok) return doc;
      versions[`content:${l}`] = doc.data.version;
    } else return d;
  }
  return { ok: true, data: { values, versions } };
}

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** 경로 하나를 세 언어로 저장(PATCH /field + expect). 409 면 위 규칙대로 한 번만 다시 */
export async function savePath(path: string, values: Record<Locale, unknown>, versions: Versions, base: Record<Locale, unknown>): Promise<ApiResult<WriteResult>> {
  const send = (v: Versions) =>
    api<WriteResult>('/api/content/field', { method: 'PATCH', body: JSON.stringify({ path, values, expect: Object.fromEntries(LOCALES.map((l) => [`content:${l}`, v[`content:${l}`]])) }) });
  const first = await send(versions);
  if (first.ok || first.status !== 409) return first;
  const now = await readPath(path);
  if (!now.ok) return first;
  if (!LOCALES.every((l) => sameJson(now.data.values[l], base[l]))) {
    return { ok: false, status: 409, error: { code: 'conflict', message: '그 사이 다른 곳(에이전트·다른 창)이 같은 칸을 바꿨습니다 — 덮어쓰지 않았습니다. 「바꾼 것 취소」로 새 값을 읽은 뒤 다시 고치세요' } };
  }
  return send(now.data.versions);
}
