import { expect, test } from '@playwright/test';

// 첫 화면 인트로(제보 33013e08) — 첫 방문에만 · 눌러서 건너뛰기 · 움직임 줄이기면 안 나옴 · 끝난 뒤 키를 삼키지 않음.
// 테스트마다 새 브라우저 문맥이라 localStorage 가 비어 있다 = 첫 방문.
const INTRO = '#intro-sting';
// 인트로 길이 1.2초 + 사라짐 0.35초에 여유를 둔다
const INTRO_DONE_MS = 4_000;

test('첫 방문에 나오고 저절로 사라진 뒤, 다시 오면 안 나온다', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator(INTRO);
  await expect(intro).toHaveAttribute('data-play', /1|done/);
  await expect(intro).toBeHidden({ timeout: INTRO_DONE_MS });
  await expect(intro).toHaveAttribute('data-play', 'done');

  await page.reload();
  await expect(page.locator('.picker-title')).toBeVisible();
  await expect(page.locator(INTRO)).not.toHaveAttribute('data-play', /.*/);
});

test('누르면 바로 건너뛰고, 그 누름이 뒤의 역할 칸으로 가지 않는다', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator(INTRO);
  await expect(intro).toHaveAttribute('data-play', '1');
  // 화면 가운데(역할 칸들이 있는 자리)를 누른다
  const { width, height } = page.viewportSize()!;
  await page.mouse.click(width / 2, height / 2);
  await expect(intro).toHaveAttribute('data-play', 'done');
  await expect(intro).toBeHidden({ timeout: 1_000 });
  await expect(page).toHaveURL(/\/$/);
});

test('끝난 뒤에는 Tab 이 역할 칸으로 간다(키를 삼키지 않는다)', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(INTRO)).toBeHidden({ timeout: INTRO_DONE_MS });
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.classList.contains('picker-tile'))) break;
  }
  expect(await page.evaluate(() => document.activeElement?.classList.contains('picker-tile'))).toBe(true);
});

test('Esc 로 건너뛴다', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator(INTRO);
  await expect(intro).toHaveAttribute('data-play', '1');
  await page.keyboard.press('Escape');
  await expect(intro).toHaveAttribute('data-play', 'done');
  await expect(intro).toBeHidden({ timeout: 1_000 });
});

test('하이드레이션이 인트로보다 늦어도 끝난 뒤 첫 키를 삼키지 않는다', async ({ page }) => {
  // 자바스크립트 청크를 2.5초 붙잡아 하이드레이션을 인트로(약 1.5초) 뒤로 민다
  await page.route('**/_next/static/chunks/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2_500));
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator(INTRO)).toBeHidden({ timeout: INTRO_DONE_MS });
  await expect(page.locator(INTRO)).toHaveAttribute('data-play', 'done', { timeout: 8_000 });
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
});

test.describe('움직임 줄이기', () => {
  test.use({ reducedMotion: 'reduce' });
  test('설정돼 있으면 처음부터 안 나온다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.picker-title')).toBeVisible();
    await expect(page.locator(INTRO)).not.toHaveAttribute('data-play', /.*/);
    await expect(page.locator(INTRO)).toBeHidden();
  });
});
