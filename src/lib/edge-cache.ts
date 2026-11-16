// 엣지 캐시 — 사진 최적화(/_next/image)와 R2 미디어(/media/*) 응답을 그 데이터센터의 Cache API 에 둔다.
//
// 왜: 2026-11-16 실측(제보 f740e315 「속도 개선」 · d264d5d4 「R2 지역」). 한국 요청은 LAX 엣지에서 처리되는데
// R2·D1 은 APAC 에 있다. 그래서 같은 사진을 열 때마다 Worker 가 APAC 의 R2 에서 원본을 읽고 다시 변환했다
// (/_next/image 한 장 1.3~3초 · 캐시 헤더 없음 · cf-cache-status 없음, 6MB 영상 59초). 결과를 엣지에 두면
// 두 번째부터는 R2·변환을 건너뛴다. Cache API 는 데이터센터마다 따로이고 workers.dev 에서는 아무것도 저장하지 않는다. 정적 파일(/work/*.jpg)은 이미 assets 가 엣지에서 준다 — 여기서 다루지 않는다.
//
// Range(영상 넘겨 보기)는 Cache API 가 처리한다: 전체(200)를 넣어 두면 Range 요청에 206 을 알아서 잘라 준다.
// 그래서 Range 로 처음 들어온 요청은 원본에서 그 구간을 바로 주고, 전체 파일은 뒤에서(waitUntil) 채운다.

/** 사진 최적화 결과는 하루만 둔다 — 원본(/work/*.jpg)은 같은 이름으로 바뀔 수 있다 */
export const IMAGE_EDGE_TTL_SECONDS = 60 * 60 * 24;

/** 응답에 붙여 판정에 쓰는 헤더(HIT · MISS) */
export const EDGE_CACHE_HEADER = 'x-edge-cache';

type Origin = (request: Request) => Promise<Response>;
type WaitUntil = (promise: Promise<unknown>) => void;

export function isEdgeCacheable(request: Request): boolean {
  if (request.method !== 'GET') return false;
  const { pathname } = new URL(request.url);
  return pathname === '/_next/image' || pathname.startsWith('/media/');
}

/**
 * 캐시 키. 사진 최적화는 Accept 에 따라 형식이 달라지므로 그 형식을 키에 넣는다(지금 next.config 기본값은 webp 뿐 —
 * avif 를 켜도 키가 갈리도록 미리 둔다).
 * 키 주소는 밖으로 나가지 않는다 — Cache API 안에서만 쓰는 이름이다.
 */
export function edgeCacheKey(request: Request): string {
  const url = new URL(request.url);
  if (url.pathname === '/_next/image') {
    const accept = request.headers.get('accept') ?? '';
    const format = ['image/avif', 'image/webp'].find((f) => accept.includes(f)) ?? 'original';
    url.searchParams.set('__edge_format', format);
  }
  return url.toString();
}

/** 엣지에 넣을 사본 — 사진 최적화 응답은 캐시 헤더가 없거나 10년이라 하루로 맞춘다. 미디어는 원본 헤더(immutable 1년)를 따른다 */
function storable(request: Request, response: Response): Response {
  const copy = new Response(response.body, response);
  if (new URL(request.url).pathname === '/_next/image') {
    copy.headers.set('cache-control', `public, max-age=${IMAGE_EDGE_TTL_SECONDS}`);
  }
  copy.headers.delete(EDGE_CACHE_HEADER);
  // Set-Cookie 가 있으면 Cache API 가 넣기를 거절한다(조용히 캐시가 안 되는 일을 막는다)
  copy.headers.delete('set-cookie');
  return copy;
}

function withHeader(response: Response, value: 'HIT' | 'MISS'): Response {
  const out = new Response(response.body, response);
  out.headers.set(EDGE_CACHE_HEADER, value);
  return out;
}

export async function serveWithEdgeCache(request: Request, origin: Origin, cache: Cache, waitUntil: WaitUntil): Promise<Response> {
  const key = edgeCacheKey(request);
  const range = request.headers.get('range');

  // Range 가 있으면 그 헤더를 실어 묻는다 — 전체가 들어 있으면 Cache API 가 206 으로 잘라 준다
  const lookup = new Request(key, { headers: range ? { range } : {} });
  const hit = await cache.match(lookup);
  if (hit) return withHeader(hit, 'HIT');

  const response = await origin(request);

  if (range) {
    // 이 응답은 구간(206)이라 넣을 수 없다. 전체를 뒤에서 받아 넣어 두면 다음 넘겨 보기부터 엣지에서 나간다.
    if (response.status === 206) {
      const full = new Request(request.url, { headers: { accept: request.headers.get('accept') ?? '*/*' } });
      waitUntil(
        origin(full).then((r) => (r.status === 200 ? cache.put(key, storable(request, r)) : undefined)).catch(() => undefined),
      );
    }
    return withHeader(response, 'MISS');
  }

  if (response.status !== 200) return withHeader(response, 'MISS');
  const [forClient, forCache] = teeResponse(response);
  waitUntil(cache.put(key, storable(request, forCache)).catch(() => undefined));
  return withHeader(forClient, 'MISS');
}

/** 본문을 둘로 나눈다 — 하나는 방문자에게, 하나는 캐시에 */
function teeResponse(response: Response): [Response, Response] {
  if (!response.body) return [response, response.clone()];
  const [a, b] = response.body.tee();
  return [new Response(a, response), new Response(b, response)];
}
