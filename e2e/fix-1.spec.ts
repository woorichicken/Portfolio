import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// 수정 1회차(Codex 교차 검수 2026-11-08 17:40)의 P2 세 건 — 옛 코드에서 실패하는 것을 먼저 확인했다(REPORT.md 「수정 1회차」).
// 로컬 Workers 에 붙는다: pnpm cf:build && pnpm e2e:workers

const TOKEN = readFileSync('.dev.vars', 'utf8').match(/^CONTENT_API_TOKEN=(.+)$/m)![1].trim();
const auth = { authorization: `Bearer ${TOKEN}` };

function other(slug: string, name: string) {
  return { slug, name, period: '2026', body: `${name} 한 줄`, shot: { src: '/work/design_atlas.jpg', width: 1400, height: 875, alt: name }, detail: { facts: [], paragraphs: ['문단'] } };
}

test('P2a 추가를 되돌리면 그 상세 주소의 캐시도 무효가 된다(404)', async ({ request }) => {
  const slug = `fix1-gone-${Date.now()}`;
  const add = await request.post('/api/content/projects', {
    headers: auth,
    data: { kind: 'other', item: { ko: other(slug, '가'), en: other(slug, 'A'), es: other(slug, 'A') } },
  });
  expect(add.status(), await add.text()).toBe(200);
  // 한 번 방문해 캐시에 올린다
  expect((await request.get(`/projects/${slug}`)).status()).toBe(200);
  const undo = await request.post('/api/content/undo', { headers: auth, data: { changeId: (await add.json()).changeId } });
  expect(undo.status(), await undo.text()).toBe(200);
  expect((await undo.json()).revalidated).toContain(`/projects/${slug}`);
  expect((await request.get(`/projects/${slug}`)).status()).toBe(404);
});

test('P2c Range 끝이 파일 크기를 넘으면 실제로 보낸 만큼만 헤더에 적는다', async ({ request }) => {
  const up = await request.post('/api/content/media', {
    headers: auth,
    multipart: { file: { name: 'range.png', mimeType: 'image/png', buffer: readFileSync('src/app/icon.png') }, name: 'fix1-range' },
  });
  expect(up.status(), await up.text()).toBe(201);
  const { src, size } = await up.json();
  const res = await request.get(src, { headers: { range: `bytes=0-${size + 1000}` } });
  const body = await res.body();
  expect(res.status()).toBe(206);
  expect(body.length).toBe(size);
  expect(res.headers()['content-range']).toBe(`bytes 0-${size - 1}/${size}`);
  // Content-Length 는 Workers 런타임이 스트림 본문에서 빼기도 한다(로컬 실측) — 있으면 실제 길이여야 한다
  const length = res.headers()['content-length'];
  if (length !== undefined) expect(length).toBe(String(size));
  // 시작이 파일 끝을 넘으면 416
  expect((await request.get(src, { headers: { range: `bytes=${size + 10}-` } })).status()).toBe(416);
});

test('P2d undo 본문 JSON 이 깨지면 400 이고 아무것도 되돌리지 않는다', async ({ request }) => {
  const marker = `fix1-undo-${Date.now()}`;
  const set = await request.patch('/api/content/field', { headers: auth, data: { path: 'work.projects[kits].summary', locale: 'ko', value: marker } });
  expect(set.status()).toBe(200);
  // 문자열을 data 로 주면 Playwright 가 JSON 문자열("…")로 감싸 보낸다 — 원문 그대로 보내려고 Buffer 로 준다
  const bad = await request.post('/api/content/undo', { headers: { ...auth, 'content-type': 'application/json' }, data: Buffer.from('{"changeId": "x"') });
  expect(bad.status()).toBe(400);
  // JSON 이지만 객체가 아닌 것도 400(예전에는 changeId 없음 → 가장 최근 저장을 되돌렸다)
  const notObject = await request.post('/api/content/undo', { headers: { ...auth, 'content-type': 'application/json' }, data: Buffer.from('"20261108-x"') });
  expect(notObject.status()).toBe(400);
  const now = await request.get('/api/content/doc/ko?path=work.projects[kits].summary', { headers: auth });
  expect((await now.json()).value).toBe(marker);
  // 빈 본문은 여전히 「가장 최근 저장」 되돌리기 — 정리도 이걸로
  const empty = await request.post('/api/content/undo', { headers: auth });
  expect(empty.status(), await empty.text()).toBe(200);
  expect((await empty.json()).undid).toBe((await set.json()).changeId);
});
