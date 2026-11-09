import { getCloudflareContext } from '@opennextjs/cloudflare';
import { parseRange, resolveRange } from '@/lib/http-range';

// GET /media/<key> — R2(MEDIA)에 올린 사진·영상을 내보낸다. 영상이 넘겨 보기(seek)되도록 Range 요청을 받는다.
// 공개다(본문에 들어간 사진은 원래 공개). 목록·올리기는 /api/content/media 가 인증을 받는다.
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.map(decodeURIComponent).join('/');
  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as Partial<CloudflareEnv>).MEDIA;
  if (!bucket) return new Response('R2 바인딩(MEDIA)이 없습니다', { status: 503 });

  const requested = parseRange(req.headers.get('range'));
  if (requested) {
    // 크기를 먼저 알아야 실제 보낼 구간·헤더를 맞게 쓴다(끝을 넘는 요청은 잘라 내고, 시작이 끝을 넘으면 416)
    const head = await bucket.head(objectKey);
    if (!head) return new Response('없는 파일입니다', { status: 404 });
    const range = resolveRange(requested, head.size);
    if (!range) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${head.size}`, 'accept-ranges': 'bytes' } });
    const object = await bucket.get(objectKey, { range });
    if (!object || !('body' in object)) return new Response('없는 파일입니다', { status: 404 });
    const headers = baseHeaders(object);
    headers.set('content-range', `bytes ${range.offset}-${range.offset + range.length - 1}/${head.size}`);
    headers.set('content-length', String(range.length));
    return new Response(object.body, { status: 206, headers });
  }

  const object = await bucket.get(objectKey);
  if (!object) return new Response('없는 파일입니다', { status: 404 });
  const headers = baseHeaders(object);
  headers.set('content-length', String(object.size));
  return new Response(object.body, { headers });
}

function baseHeaders(object: R2Object): Headers {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  if (!headers.has('cache-control')) headers.set('cache-control', 'public, max-age=31536000, immutable');
  return headers;
}
