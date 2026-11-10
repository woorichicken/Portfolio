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
