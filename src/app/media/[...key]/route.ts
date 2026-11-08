import { getCloudflareContext } from '@opennextjs/cloudflare';

// GET /media/<key> — R2(MEDIA)에 올린 사진·영상을 내보낸다. 영상이 넘겨 보기(seek)되도록 Range 요청을 받는다.
// 공개다(본문에 들어간 사진은 원래 공개). 목록·올리기는 /api/content/media 가 인증을 받는다.
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.map(decodeURIComponent).join('/');
  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as Partial<CloudflareEnv>).MEDIA;
  if (!bucket) return new Response('R2 바인딩(MEDIA)이 없습니다', { status: 503 });

  const range = parseRange(req.headers.get('range'));
  const object = await bucket.get(objectKey, range ? { range } : undefined);
  if (!object) return new Response('없는 파일입니다', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  if (!headers.has('cache-control')) headers.set('cache-control', 'public, max-age=31536000, immutable');
  if (range && 'body' in object) {
    const { offset, length } = resolved(range, object.size);
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set('content-length', String(length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set('content-length', String(object.size));
  return new Response('body' in object ? object.body : null, { headers });
}

type Range = { offset: number; length?: number } | { suffix: number };

/** "bytes=100-199" · "bytes=100-" · "bytes=-500" 만 받는다(여러 구간은 받지 않는다) */
function parseRange(header: string | null): Range | undefined {
  const m = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (!m[1] && !m[2])) return undefined;
  if (!m[1]) return { suffix: Number(m[2]) };
  const offset = Number(m[1]);
  return m[2] ? { offset, length: Number(m[2]) - offset + 1 } : { offset };
}

function resolved(range: Range, size: number) {
  if ('suffix' in range) return { offset: Math.max(0, size - range.suffix), length: Math.min(size, range.suffix) };
  return { offset: range.offset, length: range.length ?? size - range.offset };
}
