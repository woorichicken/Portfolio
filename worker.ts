// Workers 진입점 — OpenNext 가 만든 worker(.open-next/worker.js) 앞에 엣지 캐시 한 겹을 둔다.
// 캐시 규칙과 이유는 src/lib/edge-cache.ts. 나머지 요청은 그대로 OpenNext 로 간다.
// 이 저장소는 Durable Object 를 묶지 않으므로(wrangler.jsonc) OpenNext 의 DO 클래스는 다시 내보내지 않는다.
// @ts-ignore — opennextjs-cloudflare build 가 만드는 파일이다(타입 검사 때는 없을 수 있다)
import openNext from './.open-next/worker.js';
import { isEdgeCacheable, serveWithEdgeCache } from './src/lib/edge-cache';

type Handler = { fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> };
const next = openNext as Handler;

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    if (!isEdgeCacheable(request)) return next.fetch(request, env, ctx);
    return serveWithEdgeCache(
      request,
      (r) => next.fetch(r, env, ctx),
      (caches as unknown as { default: Cache }).default,
      (p) => ctx.waitUntil(p),
    );
  },
};
