import { getCloudflareContext } from '@opennextjs/cloudflare';
import { OpError } from '@/content/ops';
import { authorize, ok, openStore, route } from '@/lib/content-api';
import { imageSize, safeMediaName } from '@/lib/image-size';

// POST /api/content/media (multipart: file, name?) — 사진·영상을 R2(MEDIA)에 올리고 media 표에 적는다.
//   응답의 shot 을 그대로 본문 칸(cover · gallery[n] · shot)에 넣으면 된다 — alt 는 언어마다 채운다.
// GET /api/content/media — 올린 것 목록(최근 순)
// 올리기는 본문을 바꾸지 않는다(그래서 되돌리기 대상도 아니다). 본문에 넣는 순간부터 이력에 남는다.
export const dynamic = 'force-dynamic';

const TYPES: Record<string, { ext: string; max: number }> = {
  'image/jpeg': { ext: 'jpg', max: 10 * 1024 * 1024 },
  'image/png': { ext: 'png', max: 10 * 1024 * 1024 },
  'image/webp': { ext: 'webp', max: 10 * 1024 * 1024 },
  'image/gif': { ext: 'gif', max: 10 * 1024 * 1024 },
  // Workers 요청 본문 상한(무료 100MB) 안에서 넉넉히 — 더 긴 영상은 R2 에 직접 올린다(docs/content-api.md)
  'video/mp4': { ext: 'mp4', max: 90 * 1024 * 1024 },
  'video/webm': { ext: 'webm', max: 90 * 1024 * 1024 },
};

async function media(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as Partial<CloudflareEnv>).MEDIA;
  if (!bucket) throw new OpError(503, 'no_r2', 'R2 바인딩(MEDIA)이 없습니다 — wrangler.jsonc 의 r2_buckets 를 확인하세요');
  return bucket;
}

export const POST = route(async (req) => {
  const actor = await authorize(req);
  const { db } = await openStore();
  const form = await req.formData().catch(() => {
    throw new OpError(400, 'bad_request', 'multipart/form-data 로 file 을 보내세요(curl -F file=@사진.jpg)');
  });
  const file = form.get('file');
  if (!(file instanceof File)) throw new OpError(400, 'bad_request', 'file 칸이 없습니다');
  const type = TYPES[file.type];
  if (!type) throw new OpError(415, 'unsupported', `올릴 수 없는 형식: ${file.type || '모름'} — ${Object.keys(TYPES).join(' · ')}`);
  if (file.size > type.max) throw new OpError(413, 'too_large', `너무 큽니다: ${(file.size / 1048576).toFixed(1)}MB (상한 ${type.max / 1048576}MB)`);
  const name = safeMediaName(String(form.get('name') ?? file.name.replace(/\.[^.]+$/, '')));
  const bytes = new Uint8Array(await file.arrayBuffer());
  const size = file.type.startsWith('image/') ? imageSize(bytes) : null;
  if (file.type.startsWith('image/') && !size) throw new OpError(422, 'invalid', '사진 크기를 읽지 못했습니다 — 파일이 깨졌거나 형식이 확장자와 다릅니다');
  const now = new Date();
  const key = `${now.toISOString().slice(0, 7)}/${name}-${crypto.randomUUID().slice(0, 6)}.${type.ext}`;
  await (await media()).put(key, bytes, { httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' } });
  await db
    .prepare('INSERT INTO media (key, content_type, size, width, height, uploaded_at, uploaded_by) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
    .bind(key, file.type, file.size, size?.width ?? null, size?.height ?? null, now.toISOString(), actor)
    .run();
  const src = `/media/${key}`;
  return ok({ key, src, contentType: file.type, size: file.size, shot: size ? { src, width: size.width, height: size.height, alt: '' } : null }, { status: 201 });
});

export const GET = route(async (req) => {
  await authorize(req);
  const { db } = await openStore();
  const { results } = await db.prepare('SELECT key, content_type, size, width, height, uploaded_at, uploaded_by FROM media ORDER BY uploaded_at DESC LIMIT 200').all();
  return ok({ media: results.map((m) => ({ ...m, src: `/media/${(m as { key: string }).key}` })) });
});
