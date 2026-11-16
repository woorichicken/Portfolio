import { describe, expect, it } from 'vitest';
import { EDGE_CACHE_HEADER, IMAGE_EDGE_TTL_SECONDS, edgeCacheKey, isEdgeCacheable, serveWithEdgeCache } from '../edge-cache';

// Cache API 흉내 — 전체(200)를 넣어 두면 Range 요청에 206 으로 잘라 주는 것까지 Cloudflare 와 같게 둔다
class FakeCache {
  store = new Map<string, { body: string; headers: Headers }>();
  async match(req: Request): Promise<Response | undefined> {
    const hit = this.store.get(req.url);
    if (!hit) return undefined;
    const range = req.headers.get('range')?.match(/^bytes=(\d+)-(\d+)$/);
    if (range) {
      const [s, e] = [Number(range[1]), Number(range[2])];
      return new Response(hit.body.slice(s, e + 1), { status: 206, headers: hit.headers });
    }
    return new Response(hit.body, { status: 200, headers: hit.headers });
  }
  async put(key: string, res: Response): Promise<void> {
    this.store.set(key, { body: await res.text(), headers: new Headers(res.headers) });
  }
}

function setup(body = '0123456789') {
  const cache = new FakeCache();
  const pending: Promise<unknown>[] = [];
  let originCalls = 0;
  const origin = async (req: Request) => {
    originCalls += 1;
    const range = req.headers.get('range')?.match(/^bytes=(\d+)-(\d+)$/);
    if (range) return new Response(body.slice(Number(range[1]), Number(range[2]) + 1), { status: 206 });
    return new Response(body, { status: 200, headers: { 'content-type': 'image/jpeg' } });
  };
  const serve = (req: Request) => serveWithEdgeCache(req, origin, cache as unknown as Cache, (p) => pending.push(p));
  return { cache, serve, settle: () => Promise.all(pending), calls: () => originCalls };
}

describe('엣지 캐시 — 사진 최적화·미디어', () => {
  it('사진 최적화와 /media 만 다루고 페이지·API·쓰기는 건드리지 않는다', () => {
    expect(isEdgeCacheable(new Request('https://www.solhun.com/_next/image?url=%2Fwork%2Fa.jpg&w=640&q=75'))).toBe(true);
    expect(isEdgeCacheable(new Request('https://www.solhun.com/media/video/a.mp4'))).toBe(true);
    expect(isEdgeCacheable(new Request('https://www.solhun.com/as/design'))).toBe(false);
    expect(isEdgeCacheable(new Request('https://www.solhun.com/api/content/media'))).toBe(false);
    expect(isEdgeCacheable(new Request('https://www.solhun.com/media/a.jpg', { method: 'POST' }))).toBe(false);
  });

  it('두 번째 요청은 원본(R2·변환)까지 가지 않는다', async () => {
    const t = setup();
    const url = 'https://www.solhun.com/media/image/a.jpg';
    const first = await t.serve(new Request(url));
    expect(first.headers.get(EDGE_CACHE_HEADER)).toBe('MISS');
    expect(await first.text()).toBe('0123456789');
    await t.settle();
    const second = await t.serve(new Request(url));
    expect(second.headers.get(EDGE_CACHE_HEADER)).toBe('HIT');
    expect(await second.text()).toBe('0123456789');
    expect(t.calls()).toBe(1);
  });

  it('영상 넘겨 보기(Range)는 처음엔 원본 구간을 주고, 뒤에서 채운 전체로 다음부터 엣지에서 자른다', async () => {
    const t = setup();
    const url = 'https://www.solhun.com/media/video/a.mp4';
    const first = await t.serve(new Request(url, { headers: { range: 'bytes=2-4' } }));
    expect(first.status).toBe(206);
    expect(await first.text()).toBe('234');
    await t.settle();
    const second = await t.serve(new Request(url, { headers: { range: 'bytes=5-7' } }));
    expect(second.status).toBe(206);
    expect(second.headers.get(EDGE_CACHE_HEADER)).toBe('HIT');
    expect(await second.text()).toBe('567');
    expect(t.calls()).toBe(2); // 첫 구간 + 뒤에서 받은 전체 — 두 번째 넘겨 보기는 원본에 안 간다
  });

  it('사진 최적화는 형식(Accept)마다 따로 두고 하루만 둔다', async () => {
    const t = setup();
    const url = 'https://www.solhun.com/_next/image?url=%2Fwork%2Fa.jpg&w=640&q=75';
    const avif = new Request(url, { headers: { accept: 'image/avif,image/webp,*/*' } });
    const plain = new Request(url, { headers: { accept: '*/*' } });
    expect(edgeCacheKey(avif)).not.toBe(edgeCacheKey(plain));
    await t.serve(avif);
    await t.settle();
    const stored = t.cache.store.get(edgeCacheKey(avif));
    expect(stored?.headers.get('cache-control')).toBe(`public, max-age=${IMAGE_EDGE_TTL_SECONDS}`);
    const other = await t.serve(plain);
    expect(other.headers.get(EDGE_CACHE_HEADER)).toBe('MISS');
  });

  it('실패 응답은 넣지 않는다', async () => {
    const cache = new FakeCache();
    const pending: Promise<unknown>[] = [];
    const res = await serveWithEdgeCache(
      new Request('https://www.solhun.com/media/none.jpg'),
      async () => new Response('없는 파일입니다', { status: 404 }),
      cache as unknown as Cache,
      (p) => pending.push(p),
    );
    await Promise.all(pending);
    expect(res.status).toBe(404);
    expect(cache.store.size).toBe(0);
  });
});
