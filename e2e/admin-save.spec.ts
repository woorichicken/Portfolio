import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// 바꾼 흐름만 본다(2026-11-08 D1 이전):
//  1) 어드민 「저장」 → 공개 역할 화면에 바로 반영 → D1 행(roles·hidden)에 같은 값 — 화면 성공과 실제 적재를 따로 확인한다
//  2) 「마지막 저장 되돌리기」 → 화면·D1 둘 다 원래대로
//  3) 에이전트 경로(Bearer · PATCH field) → 상세 페이지 반영 → D1 행 → undo
// 끝나면 D1 은 시작 때와 같은 본문이어야 한다(각 테스트 끝에서 확인). 중간에 실패해 D1 이 바뀐 채 남으면 `pnpm db:seed:local --force` 로 되돌린다.

const PASSWORD = process.env.ADMIN_PASSWORD ?? readFileSync(join(homedir(), '.config/portfolio/feedback-password.txt'), 'utf8').trim();
const TOKEN = readFileSync('.dev.vars', 'utf8').match(/^CONTENT_API_TOKEN=(.+)$/m)![1].trim();
const SHOTS = process.env.E2E_SHOTS_DIR;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: false });
}

/** 로컬 D1 을 wrangler 로 직접 읽는다 — API 를 거치지 않은 「실제 적재」 확인 */
function d1Doc<T>(key: string): { body: T; version: number } {
  const out = execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command', `SELECT body, version FROM content_doc WHERE key = '${key}'`], { encoding: 'utf8' });
  const row = JSON.parse(out)[0].results[0] as { body: string; version: number };
  return { body: JSON.parse(row.body) as T, version: row.version };
}

type Roles = Record<string, { projects: string[]; others: string[]; featured: string }>;
/** 역할 화면 한 줄(row-projects · row-others)의 카드 순서 — 카드 링크의 slug */
const projectOrder = async (page: Page, row: string) =>
  page.locator(`#${row} a.card`).evaluateAll((as) => as.map((a) => a.getAttribute('href')!.split('/').pop()!));

let startKo: unknown;
let startRoles: Roles;
let startHidden: string[];

test.beforeAll(() => {
  startKo = d1Doc('content:ko').body;
  startRoles = d1Doc<Roles>('roles').body;
  startHidden = d1Doc<string[]>('hidden').body;
});

/** 어드민 열기 — 쿠키가 살아 있으면 관문 없이 바로 열린다 */
async function login(page: Page) {
  await page.goto('/admin');
  const gate = page.getByLabel('비밀번호');
  const panel = page.locator('[data-admin-status]');
  await expect(gate.or(panel)).toBeVisible();
  if (await gate.isVisible()) {
    await gate.fill(PASSWORD);
    await shot(page, '01-admin-gate');
    await page.getByRole('button', { name: '열기' }).click();
  }
  await expect(panel).toBeVisible();
}

test('어드민 저장 → 역할 화면 반영 → D1 행 · 되돌리기', async ({ page }) => {
  await page.goto('/as/design');
  expect((await projectOrder(page, 'row-projects')).slice(0, 2)).toEqual(startRoles.design.projects.slice(0, 2));

  await login(page);
  // 디자인 엔지니어 역할에서 2번째(엔씨디지텍)를 맨 위로
  await page.getByRole('group', { name: '보기' }).getByRole('button', { name: '디자인 엔지니어' }).click();
  const second = startRoles.design.projects[1];
  await page.locator(`li[data-admin-item="${second}"]`).getByRole('button', { name: /위로$/ }).click();
  await expect(page.getByRole('heading', { name: /바꾼 것 있음/ })).toBeVisible();
  await shot(page, '02-admin-changed');
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.locator('[data-admin-status="saved"]')).toContainText('저장했습니다');
  await shot(page, '03-admin-saved');

  // 화면: 공개 역할 화면의 첫 카드가 바뀌었다
  await page.goto('/as/design');
  const publicAfter = await projectOrder(page, 'row-projects');
  expect(publicAfter[0]).toBe(second);
  await shot(page, '04-public-after-save');
  // D1: roles 문서에 같은 순서가 적재됐다
  const roles = d1Doc<Roles>('roles');
  expect(roles.body.design.projects[0]).toBe(second);

  // 숨김 — 「그 외」 줄에서 빠진다
  await login(page);
  const hideId = startRoles.design.others.find((o) => !startHidden.includes(o))!;
  await page.locator(`li[data-admin-item="${hideId}"]`).getByRole('button', { name: /숨기기$/ }).click();
  await page.getByRole('button', { name: '저장', exact: true }).click();
  await expect(page.locator('[data-admin-status="saved"]')).toContainText('저장했습니다');
  await page.goto('/as/design');
  expect(await projectOrder(page, 'row-others')).not.toContain(hideId);
  expect(d1Doc<string[]>('hidden').body).toContain(hideId);

  // 되돌리기 두 번 — 숨김 → 순서 순서로 한 칸씩
  await login(page);
  for (let i = 0; i < 2; i += 1) {
    await page.getByRole('button', { name: '마지막 저장 되돌리기' }).click();
    await expect(page.locator('[data-admin-status="saved"]')).toContainText('되돌렸습니다');
  }
  await shot(page, '05-admin-undone');
  await page.goto('/as/design');
  expect((await projectOrder(page, 'row-projects')).slice(0, 2)).toEqual(startRoles.design.projects.slice(0, 2));
  expect(await projectOrder(page, 'row-others')).toContain(hideId);
  expect(d1Doc<Roles>('roles').body).toEqual(startRoles);
  expect(d1Doc<string[]>('hidden').body).toEqual(startHidden);
});

test('에이전트(Bearer) 칸 고치기 → 상세 페이지 반영 → D1 행 → undo', async ({ page, request }) => {
  const marker = `E2E 에이전트 수정 ${Date.now()}`;
  const auth = { authorization: `Bearer ${TOKEN}` };
  const res = await request.patch('/api/content/field', { headers: auth, data: { path: 'work.projects[kits].summary', locale: 'ko', value: marker } });
  const body = await res.json();
  expect(res.status(), JSON.stringify(body)).toBe(200);
  // 상세에만 보이는 칸이라 그 페이지 하나만 다시 그린다
  expect(body.revalidated).toEqual(['/projects/kits']);

  await page.goto('/projects/kits');
  await expect(page.getByText(marker)).toBeVisible();
  await shot(page, '06-agent-detail-after');
  const ko = d1Doc<{ work: { projects: { id: string; summary: string }[] } }>('content:ko');
  expect(ko.body.work.projects.find((p) => p.id === 'kits')!.summary).toBe(marker);

  // 토큰 없이는 못 쓴다
  expect((await request.patch('/api/content/field', { data: { path: 'hero.lead', locale: 'ko', value: 'x' } })).status()).toBe(401);
  // 세 언어 모양을 깨는 쓰기는 422 + 문제 칸
  const bad = await request.patch('/api/content/field', { headers: auth, data: { path: 'work.projects[kits].improvements[0].badge', locale: 'ko', value: 'x' } });
  expect(bad.status()).toBe(422);
  expect((await bad.json()).error.problems[0].path).toBe('work.projects[kits].improvements[0].badge');

  const undo = await request.post('/api/content/undo', { headers: auth, data: {} });
  expect(undo.status()).toBe(200);
  await page.goto('/projects/kits');
  await expect(page.getByText(marker)).toHaveCount(0);
  expect(d1Doc('content:ko').body).toEqual(startKo);
});
