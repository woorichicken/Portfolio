import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { PASSWORD, TOKEN, d1Changes, d1Doc } from './d1';

// 어드민 「실제로 관리하는 화면」(2026-11-10) — 바뀐 흐름 전부. 화면의 성공과 D1 의 실제 적재를 따로 확인하고, 끝에서 D1 이 시작과 같은지 본다.
// 데이터에 기대지 않게 짰다 — 시드든 운영 스냅숏(seed --from)이든 돈다:
//   pnpm db:seed:local --force --from <운영 스냅숏 폴더> && pnpm cf:build && scripts/with-workers.sh playwright test e2e/admin-editor.spec.ts --workers=1
// 중간에 실패해 D1 이 바뀐 채 남으면 같은 seed 명령으로 되돌린다.

type Project = { id: string; summary: string; cover: { src: string }; improvements?: { badge?: string }[] };
type Content = { work: { projects: Project[] }; others: { items: { slug: string }[] }; openSource?: { items: { id: string }[] }; videos?: { items: { id: string; src: string }[] } };
type Roles = Record<string, { others: string[]; openSource?: boolean; videos?: boolean }>;

const FIX = join(process.cwd(), 'e2e/fixtures');
const SHOTS = process.env.E2E_SHOTS_DIR;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: join(SHOTS, `${name}.png`) });
}

const docs = () => ({ ko: d1Doc<Content>('content:ko').body, en: d1Doc<Content>('content:en').body, es: d1Doc<Content>('content:es').body, roles: d1Doc<Roles>('roles').body, hidden: d1Doc<string[]>('hidden').body });
let start: ReturnType<typeof docs>;
test.beforeAll(() => {
  start = docs();
});
test.afterAll(() => {
  // 모든 흐름이 되돌리기·빼기로 끝난다 — D1 본문이 시작과 같아야 한다
  expect(docs()).toEqual(start);
});

async function login(page: Page) {
  await page.goto('/admin');
  const gate = page.getByLabel('비밀번호');
  const panel = page.locator('[data-admin-status]');
  await expect(gate.or(panel)).toBeVisible();
  if (await gate.isVisible()) {
    await gate.fill(PASSWORD);
    await page.getByRole('button', { name: '열기' }).click();
  }
  await expect(panel).toBeVisible();
}

async function openEditor(page: Page, id: string) {
  await login(page);
  await page.locator(`li[data-admin-item="${id}"] .admin-item-name`).click();
  const sheet = page.locator(`[data-admin-editor="${id}"]`);
  await expect(sheet.locator('[data-field="summary"], [data-field="body"]').first()).toBeVisible();
  return sheet;
}

/** 「최근 저장」 탭에서 그 저장(아직 안 되돌린 것 중 summary 가 맞는 첫 줄)을 화면의 단추로 되돌린다 */
async function undoFromHistory(page: Page, summary: RegExp) {
  await login(page);
  await page.getByRole('tab', { name: '최근 저장' }).click();
  const row = page.locator('.admin-changes li:not([data-undone])').filter({ has: page.locator('.admin-change-summary', { hasText: summary }) }).filter({ has: page.getByRole('button', { name: '되돌리기' }) }).first();
  const id = await row.getAttribute('data-change');
  await row.getByRole('button', { name: '되돌리기' }).click();
  await expect(page.locator('[data-history-status="saved"]')).toContainText('되돌렸습니다');
  await expect(page.locator(`.admin-changes li[data-change="${id}"]`)).toHaveAttribute('data-undone', '');
}

const kits = (c: Content) => c.work.projects.find((p) => p.id === 'kits')!;

test('항목 편집 — 요약 세 언어 저장 → 세 언어 상세에 새 글 → D1 → 최근 저장(사람)에서 되돌리기', async ({ page }) => {
  const mark = { ko: `E2E 요약 ${Date.now()}`, en: `E2E summary ${Date.now()}`, es: `E2E resumen ${Date.now()}` };
  const sheet = await openEditor(page, 'kits');
  for (const l of ['ko', 'en', 'es'] as const) await sheet.locator(`textarea[data-field="summary"][data-locale="${l}"]`).fill(mark[l]);
  await expect(page.locator('[data-editor-status]')).toContainText('summary (ko·en·es)');
  await shot(page, 'editor-dirty');
  await sheet.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.locator('[data-editor-status="saved"]')).toContainText('저장했습니다 — 고침 work.projects[kits] — summary (ko·en·es)');
  // 「사이트에서 보기」 — 세 언어 상세 주소가 그대로 링크다
  const links = sheet.locator('.admin-sheet-foot [data-site-link]');
  await expect(links).toHaveCount(3);
  const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(['/projects/kits', '/en/projects/kits', '/es/projects/kits']);
  await shot(page, 'editor-saved');

  // 화면 — 공개 상세 세 곳
  for (const [l, href] of [['ko', hrefs[0]], ['en', hrefs[1]], ['es', hrefs[2]]] as const) {
    await page.goto(href!);
    await expect(page.locator('.title-summary')).toHaveText(mark[l]);
  }
  // D1 — 세 문서에 같은 값
  expect(kits(d1Doc<Content>('content:ko').body).summary).toBe(mark.ko);
  expect(kits(d1Doc<Content>('content:en').body).summary).toBe(mark.en);
  expect(kits(d1Doc<Content>('content:es').body).summary).toBe(mark.es);
  expect(d1Changes(1)[0]).toMatchObject({ actor: 'admin', summary: '고침 work.projects[kits] — summary (ko·en·es)', undone_by: null });

  // 에이전트 저장도 같은 목록에 「에이전트」로 보인다 → 그것부터 되돌리고, 사람 저장을 되돌린다
  const agent = await page.request.patch('/api/content/field', { headers: { authorization: `Bearer ${TOKEN}` }, data: { path: 'work.projects[kits].tagline', locale: 'en', value: `agent ${Date.now()}` } });
  expect(agent.status()).toBe(200);
  await login(page);
  await page.getByRole('tab', { name: '최근 저장' }).click();
  const rows = page.locator('.admin-changes li');
  await expect(rows.nth(0).locator('.admin-actor')).toHaveText('에이전트');
  await expect(rows.nth(1).locator('.admin-actor')).toHaveText('사람(어드민)');
  await shot(page, 'history-actors');
  await undoFromHistory(page, /tagline \(en\)/);
  await undoFromHistory(page, /summary \(ko·en·es\)/);
  await expect(page.locator('[data-history-status="saved"] ~ .admin-site-links [data-site-link="/projects/kits"]')).toHaveCount(1);
  await shot(page, 'history-undone');

  await page.goto('/projects/kits');
  await expect(page.locator('.title-summary')).toHaveText(kits(start.ko).summary.replace(/\*\*/g, ''));
  expect(kits(d1Doc<Content>('content:ko').body)).toEqual(kits(start.ko));
});

test('422 — 배지를 한 언어만 채우면 그 칸 옆에 · https 가 아닌 repo 도 그 칸 옆에 · D1 은 그대로', async ({ page }) => {
  const before = d1Doc<Content>('content:ko').version;
  const sheet = await openEditor(page, 'kits');
  const badgeKo = sheet.locator('input[data-field="improvements[0].badge"][data-locale="ko"]');
  const had = Boolean(kits(start.ko).improvements?.[0]?.badge);
  // 없으면 ko 에만 넣고, 있으면 ko 만 비운다 — 어느 쪽이든 세 언어 모양이 어긋난다
  await badgeKo.fill(had ? '' : '최신');
  const save = sheet.getByRole('button', { name: '저장', exact: true });
  await save.click();
  await expect(page.locator('[data-editor-status="error"]')).toContainText('저장하지 않았습니다');
  const badgeProblem = sheet.locator('div[data-field="improvements[0].badge"] .admin-field-problems');
  await expect(badgeProblem).toContainText(had ? '에만 있는 칸' : 'ko 에만 있는 칸');
  await badgeProblem.scrollIntoViewIfNeeded();
  await shot(page, 'editor-422');
  // 배지는 되돌리고 repo 를 https 가 아니게 — 이번엔 칸 검사(zod)에서 막혀 repo 칸 옆에(세 언어 각각)
  await sheet.getByRole('button', { name: '바꾼 것 취소' }).click();
  await sheet.locator('input[data-field="repo"]').fill('http://github.com/woorichicken/kits');
  await save.click();
  const repoProblem = sheet.locator('div[data-field="repo"] .admin-field-problems li');
  await expect(repoProblem).toHaveCount(3);
  await expect(repoProblem.first()).toContainText('https://');
  expect(d1Doc<Content>('content:ko').version).toBe(before);
  // 고치면 문제가 사라진다 — 취소하고 닫는다(저장 없음)
  await sheet.getByRole('button', { name: '바꾼 것 취소' }).click();
  await expect(sheet.locator('.admin-field-problems')).toHaveCount(0);
  await sheet.locator('.admin-sheet-foot').getByRole('button', { name: '닫기', exact: true }).click();
  await expect(page.locator('[data-admin-editor]')).toHaveCount(0);
});

test('사진 — 표지 파일 올리기 → 상세에 새 src → D1 → 되돌리기', async ({ page }) => {
  const sheet = await openEditor(page, 'kits');
  await sheet.locator('div[data-field="cover"] input[type="file"]').first().setInputFiles(join(FIX, 'e2e-cover.jpg'));
  const src = sheet.locator('[data-shot-src="cover"]');
  await expect(src).toHaveText(/^\/media\/image\/e2e-cover-[0-9a-f]{10}\.jpg$/);
  const newSrc = (await src.textContent())!;
  await sheet.locator('input[data-field="cover.alt"][data-locale="ko"]').fill('E2E 표지');
  await sheet.locator('input[data-field="cover.alt"][data-locale="en"]').fill('E2E cover');
  await sheet.locator('input[data-field="cover.alt"][data-locale="es"]').fill('Portada E2E');
  await shot(page, 'editor-cover-uploaded');
  await sheet.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.locator('[data-editor-status="saved"]')).toContainText('cover');

  await page.goto('/projects/kits');
  await expect(page.locator('a.title-hero-media')).toHaveAttribute('href', newSrc);
  await expect(page.locator('a.title-hero-media img')).toHaveAttribute('alt', 'E2E 표지');
  // 사진 자체가 R2 에서 나온다
  const img = await page.request.get(newSrc);
  expect(img.status()).toBe(200);
  expect(img.headers()['content-type']).toBe('image/jpeg');
  for (const l of ['ko', 'en', 'es']) expect(kits(d1Doc<Content>(`content:${l}`).body).cover.src).toBe(newSrc);

  await undoFromHistory(page, /work\.projects\[kits\] — cover/);
  await page.goto('/projects/kits');
  await expect(page.locator('a.title-hero-media')).toHaveAttribute('href', kits(start.ko).cover.src);
});

test('오픈소스 행 — 저장소 추가 → 역할 화면에 카드 → D1 → 빼기 → 없어짐', async ({ page }) => {
  const role = Object.entries(start.roles).find(([, r]) => r.openSource)?.[0];
  test.skip(!role, '오픈소스 행이 켜진 역할이 없다');
  const count0 = start.ko.openSource?.items.length ?? 0;
  await login(page);
  await page.getByRole('tab', { name: '오픈소스' }).click();
  const panel = page.locator('[data-rows-panel="openSource"]');
  await panel.getByRole('button', { name: '+ 저장소 추가' }).click();
  const row = panel.locator('.admin-rows > li').last();
  await row.locator('input[data-field$=".id"]').fill('e2e-repo');
  for (const [l, v] of [['ko', 'E2E 저장소'], ['en', 'E2E repo'], ['es', 'Repo E2E']]) await row.locator(`input[data-field$=".name"][data-locale="${l}"]`).fill(v);
  for (const [l, v] of [['ko', 'E2E 설명'], ['en', 'E2E body'], ['es', 'Cuerpo E2E']]) await row.locator(`textarea[data-field$=".body"][data-locale="${l}"]`).fill(v);
  await row.locator('input[data-field$=".repo"]').fill('https://github.com/woorichicken/e2e-repo');
  await shot(page, 'oss-added');
  await panel.getByRole('button', { name: '오픈소스 저장' }).click();
  await expect(page.locator('[data-rows-status="saved"]')).toContainText('저장했습니다 — 고침 openSource — items (ko·en·es)');
  await expect(panel.locator(`[data-site-link="/as/${role}"]`)).toHaveCount(1);

  await page.goto(`/as/${role}`);
  const cards = page.locator('#row-opensource article.oss');
  await expect(cards).toHaveCount(count0 + 1);
  await expect(cards.last().getByRole('link', { name: /^GitHub 보러가기/ })).toHaveAttribute('href', 'https://github.com/woorichicken/e2e-repo');
  expect(d1Doc<Content>('content:es').body.openSource!.items.at(-1)!.id).toBe('e2e-repo');

  // 빼기 → 저장
  await login(page);
  await page.getByRole('tab', { name: '오픈소스' }).click();
  await panel.locator('.admin-rows > li[data-row="e2e-repo"]').getByRole('button', { name: '빼기' }).click();
  await panel.getByRole('button', { name: '오픈소스 저장' }).click();
  await expect(page.locator('[data-rows-status="saved"]')).toContainText('저장했습니다');
  await page.goto(`/as/${role}`);
  await expect(page.locator('#row-opensource article.oss')).toHaveCount(count0);
  expect(d1Doc<Content>('content:ko').body.openSource).toEqual(start.ko.openSource);
});

test('만든 영상 행 — 역할 켜고 끄기 · mp4·포스터 올려 한 줄 추가 → 화면 → 빼기', async ({ page }) => {
  const off = Object.entries(start.roles).find(([, r]) => !r.videos)?.[0];
  const on = Object.entries(start.roles).find(([, r]) => r.videos)?.[0];
  test.skip(!off || !on, '켜진 역할·꺼진 역할이 둘 다 있어야 한다');
  await login(page);
  await page.getByRole('tab', { name: '만든 영상' }).click();
  const panel = page.locator('[data-rows-panel="videos"]');

  // 켜기 → 그 역할 화면에 행 → D1
  await panel.locator(`input[data-role-toggle="${off}"]`).check();
  await expect(page.locator('[data-rows-status="saved"]')).toContainText('켰습니다');
  await page.goto(`/as/${off}`);
  await expect(page.locator('#row-videos')).toHaveCount((start.ko.videos?.items.length ?? 0) > 0 ? 1 : 0);
  expect(d1Doc<Roles>('roles').body[off!].videos).toBe(true);
  // 끄기
  await login(page);
  await page.getByRole('tab', { name: '만든 영상' }).click();
  await panel.locator(`input[data-role-toggle="${off}"]`).uncheck();
  await expect(page.locator('[data-rows-status="saved"]')).toContainText('껐습니다');
  await page.goto(`/as/${off}`);
  await expect(page.locator('#row-videos')).toHaveCount(0);
  expect(d1Doc<Roles>('roles').body[off!].videos).toBe(false);
  // 켜고 끈 두 저장을 되돌려 roles 문서를 처음 모양(칸 없음)으로 — 「최근 저장」의 저장마다 되돌리기
  await undoFromHistory(page, /videos=false/);
  await undoFromHistory(page, /videos=true/);
  expect(d1Doc<Roles>('roles').body).toEqual(start.roles);

  // 영상 한 줄 — 파일 올리기(가로·세로는 브라우저가 읽는다)
  await login(page);
  await page.getByRole('tab', { name: '만든 영상' }).click();
  const n0 = start.ko.videos?.items.length ?? 0;
  await panel.getByRole('button', { name: '+ 영상 추가' }).click();
  const row = panel.locator('.admin-rows > li').last();
  await row.locator('input[data-field$=".id"]').fill('e2e-clip');
  for (const [l, v] of [['ko', 'E2E 영상'], ['en', 'E2E clip'], ['es', 'Clip E2E']]) {
    await row.locator(`input[data-field$=".title"][data-locale="${l}"]`).fill(v);
    await row.locator(`textarea[data-field$=".body"][data-locale="${l}"]`).fill(`${v} 설명`);
  }
  // 올리기 전에 저장하면 영상 경로 문제가 그 칸 옆에
  await panel.getByRole('button', { name: '만든 영상 저장' }).click();
  await expect(row.locator('div[data-field$=".src"] .admin-field-problems')).toContainText('영상 경로');
  await row.locator('div[data-field$=".src"] input[type="file"]').setInputFiles(join(FIX, 'e2e-clip.mp4'));
  await expect(row.locator('[data-video-src]')).toHaveText(/^\/media\/video\/e2e-clip-[0-9a-f]{10}\.mp4 · 320×180$/);
  await row.locator('div[data-field$=".poster"] input[type="file"]').setInputFiles(join(FIX, 'e2e-poster.jpg'));
  await expect(row.locator('div[data-field$=".poster"] code')).toHaveText(/^\/media\/image\/e2e-poster-[0-9a-f]{10}\.jpg$/);
  await shot(page, 'video-uploaded');
  await panel.getByRole('button', { name: '만든 영상 저장' }).click();
  await expect(page.locator('[data-rows-status="saved"]')).toContainText('저장했습니다');

  await page.goto(`/as/${on}`);
  const videos = page.locator('#row-videos video');
  await expect(videos).toHaveCount(n0 + 1);
  const src = (await videos.last().locator('source').getAttribute('src'))!;
  expect(src).toMatch(/^\/media\/video\/e2e-clip-/);
  const res = await page.request.get(src, { headers: { range: 'bytes=0-15' } });
  expect(res.status()).toBe(206);
  const saved = d1Doc<Content>('content:en').body.videos!.items.at(-1)!;
  expect(saved).toMatchObject({ id: 'e2e-clip', src, width: 320, height: 180 });

  // 빼기
  await login(page);
  await page.getByRole('tab', { name: '만든 영상' }).click();
  await panel.locator('.admin-rows > li[data-row="e2e-clip"]').getByRole('button', { name: '빼기' }).click();
  await panel.getByRole('button', { name: '만든 영상 저장' }).click();
  await expect(page.locator('[data-rows-status="saved"]')).toContainText('저장했습니다');
  await page.goto(`/as/${on}`);
  await expect(page.locator('#row-videos video')).toHaveCount(n0);
});

test('프로젝트 추가(그 외) — 잘못된 slug · 있는 slug 409 · 추가 → 상세·역할 화면 → D1 → 되돌리기로 404', async ({ page }) => {
  const slug = `e2e-other-${Date.now().toString(36)}`;
  await login(page);
  await page.getByRole('tab', { name: '프로젝트 추가' }).click();
  const panel = page.locator('[data-add-panel]');
  const slugInput = panel.getByLabel('slug(주소)');
  await slugInput.fill('Bad Slug');
  await expect(panel.locator('div[data-field="slug"] .admin-field-problems')).toContainText('소문자');
  // 이미 있는 slug — 서버 409(add-project 와 같은 검사)
  await slugInput.fill(start.ko.others.items[0].slug);
  for (const [l, v] of [['ko', 'E2E 새 작업'], ['en', 'E2E new work'], ['es', 'Trabajo nuevo E2E']]) {
    await panel.locator(`input[data-field="name"][data-locale="${l}"]`).fill(v);
    await panel.locator(`textarea[data-field="body"][data-locale="${l}"]`).fill(`${v} 한 줄`);
    await panel.locator(`input[data-field="shot.alt"][data-locale="${l}"]`).fill(`${v} 사진`);
    await panel.locator(`textarea[data-field="detail.paragraphs[0]"][data-locale="${l}"]`).fill(`${v} 상세 문단`);
  }
  await panel.locator('input[data-add-role="design"]').check();
  await panel.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.locator('[data-add-status="error"]')).toContainText('이미 있습니다');

  await slugInput.fill(slug);
  await shot(page, 'add-filled');
  await panel.getByRole('button', { name: '추가', exact: true }).click();
  await expect(page.locator('[data-add-status="saved"]')).toContainText(`추가했습니다 — 추가 other ${slug} → design`);
  await expect(panel.locator(`[data-site-link="/projects/${slug}"]`)).toHaveCount(1);

  await page.goto(`/projects/${slug}`);
  await expect(page.getByRole('heading', { name: 'E2E 새 작업' }).first()).toBeVisible();
  await expect(page.getByText('E2E 새 작업 상세 문단')).toBeVisible();
  await page.goto('/en/projects/' + slug);
  await expect(page.getByText('E2E new work 상세 문단')).toBeVisible();
  await page.goto('/as/design');
  expect(await page.locator('#row-others a.card').evaluateAll((as) => as.map((a) => a.getAttribute('href')!.split('/').pop()))).toContain(slug);
  expect(d1Doc<Content>('content:ko').body.others.items.at(-1)!.slug).toBe(slug);
  expect(d1Doc<Roles>('roles').body.design.others.at(-1)).toBe(slug);
  // 목록에도 새 항목이 생긴다(서버가 /admin 을 다시 그림)
  await login(page);
  await expect(page.locator(`li[data-admin-item="${slug}"]`)).toHaveCount(1);

  await undoFromHistory(page, new RegExp(`추가 other ${slug}`));
  expect((await page.request.get(`/projects/${slug}`)).status()).toBe(404);
});
