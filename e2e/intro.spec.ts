import { expect, test, type Page } from '@playwright/test';

// 첫 화면 인트로(제보 33013e08 → 2026-11-18 시네마틱 스팅 v7 영상).
// 첫 방문에만 · 소리 없이 자동재생 + 소리 켜기 · 건너뛰기(단추·화면 누르기·Esc) · 끝나면 나무늘보 원이 로고 자리로 날아감 ·
// 움직임 줄이기면 마지막 장면 한 장 · 재방문엔 영상을 받지도 않는다.
// 테스트마다 새 브라우저 문맥이라 localStorage 가 비어 있다 = 첫 방문.
const INTRO = '#intro-sting';
const VIDEO = `${INTRO} video`;
// 영상 7초 + 날아가기 0.7초 + 걷힘 0.25초에 시작 지연 여유
const INTRO_DONE_MS = 15_000;
const INTRO_MEDIA = /\/intro\/solhun-sting-v7\.(mp4|webm)$/;

/** data-play 가 거쳐 간 상태를 모은다 — 「날아갔다(fly)」는 0.7초라 기다려서는 놓친다 */
async function recordPlayStates(page: Page) {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __introStates: string[] }).__introStates = seen;
    new MutationObserver((records) => {
      for (const r of records) {
        const v = (r.target as Element).getAttribute('data-play');
        if (v && seen[seen.length - 1] !== v) seen.push(v);
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-play'] });
  });
}

const playStates = (page: Page) => page.evaluate(() => (window as unknown as { __introStates: string[] }).__introStates);

test('첫 방문에 소리 없이 재생되고, 끝나면 로고 자리로 날아가 걷힌 뒤, 다시 오면 영상을 받지도 않는다', async ({ page }) => {
  await recordPlayStates(page);
  await page.goto('/');
  const intro = page.locator(INTRO);
  await expect(intro).toHaveAttribute('data-play', '1');
  // 실제로 재생 중인가(멈춘 첫 프레임이 아니다) · 소리는 꺼져 있다
  await expect.poll(() => page.locator(VIDEO).evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 5_000 }).toBeGreaterThan(0.3);
  expect(await page.locator(VIDEO).evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);

  await expect(intro).toBeHidden({ timeout: INTRO_DONE_MS });
  expect(await playStates(page)).toEqual(['1', 'fly', 'done']);

  const mediaRequests: string[] = [];
  page.on('request', (r) => {
    if (INTRO_MEDIA.test(new URL(r.url()).pathname)) mediaRequests.push(r.url());
  });
  await page.reload();
  await expect(page.locator('.picker-title')).toBeVisible();
  await expect(page.locator(INTRO)).not.toHaveAttribute('data-play', /.*/);
  expect(mediaRequests).toEqual([]);
});

test('날아간 나무늘보 원이 왼쪽 위 로고 그림 자리에 앉는다', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator(INTRO)).toHaveAttribute('data-play', 'fly', { timeout: INTRO_DONE_MS });
  // 날아가기를 마지막 순간에 멈춰 세운다(끝나면 바로 걷혀 그림이 사라지므로 시간으로 기다리면 놓친다) —
  // 그 자리에서 원의 가운데가 로고 그림 가운데와 2px 안에서 만나는지 본다
  await page.locator(`${INTRO} .intro-end`).evaluate((img) => {
    const flight = img.getAnimations()[0];
    flight.pause();
    flight.currentTime = Number(flight.effect!.getTiming().duration);
  });
  const [end, mark] = await Promise.all([
    page.locator(`${INTRO} .intro-end`).evaluate((img) => {
      const r = img.getBoundingClientRect();
      // 원 가운데는 이미지 안 (233, 262) / (466, 492)
      return { x: r.left + (r.width * 233) / 466, y: r.top + (r.height * 262) / 492 };
    }),
    page.locator('.picker-top .wordmark img').evaluate((img) => {
      const r = img.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }),
  ]);
  expect(Math.abs(end.x - mark.x)).toBeLessThan(2);
  expect(Math.abs(end.y - mark.y)).toBeLessThan(2);
});

test('소리 켜기를 누르면 소리가 켜지고 인트로는 계속된다', async ({ page }) => {
  await page.goto('/');
  const sound = page.locator(`${INTRO} .intro-sound`);
  await expect(sound).toHaveText('소리 켜기');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await expect(sound).toHaveText('소리 끄기');
  expect(await page.locator(VIDEO).evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);
  await expect(page.locator(INTRO)).toHaveAttribute('data-play', '1');
  // 초점이 소리 단추에 있을 때 Enter 는 그 단추의 일이다 — 인트로를 끄지 않는다
  await page.keyboard.press('Enter');
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator(INTRO)).toHaveAttribute('data-play', '1');
});

test('화면을 누르면 바로 건너뛰고, 그 누름이 뒤의 역할 칸으로 가지 않는다', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator(INTRO);
  await expect(intro).toHaveAttribute('data-play', '1');
  const { width, height } = page.viewportSize()!;
  await page.mouse.click(width / 2, height / 2);
  await expect(intro).toHaveAttribute('data-play', 'done');
  await expect(intro).toBeHidden({ timeout: 1_000 });
  await expect(page).toHaveURL(/\/$/);
  expect(await page.locator(VIDEO).evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('건너뛰기 단추(키보드)와 Esc 로 건너뛴다', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator(INTRO);
  await expect(intro).toHaveAttribute('data-play', '1');
  await page.locator(`${INTRO} .intro-skip`).focus();
  await page.keyboard.press('Enter');
  await expect(intro).toHaveAttribute('data-play', 'done');

  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(intro).toHaveAttribute('data-play', '1');
  await page.keyboard.press('Escape');
  await expect(intro).toHaveAttribute('data-play', 'done');
  await expect(intro).toBeHidden({ timeout: 1_000 });
});

test('끝난 뒤에는 Tab 이 역할 칸으로 간다(키를 삼키지 않는다)', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Escape');
  await expect(page.locator(INTRO)).toBeHidden({ timeout: 1_000 });
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.classList.contains('picker-tile'))) break;
  }
  expect(await page.evaluate(() => document.activeElement?.classList.contains('picker-tile'))).toBe(true);
});

test('하이드레이션이 늦어도 인트로는 제때 끝난다(재생 제어가 인라인 스크립트에 있다)', async ({ page }) => {
  // 자바스크립트 청크를 붙잡아 하이드레이션을 인트로 뒤로 민다
  // .js 만 붙잡는다 — CSS 까지 붙잡으면 화면 그리기 자체가 멈춰 인트로가 아니라 브라우저를 시험하게 된다
  await page.route((url) => url.pathname.startsWith('/_next/static/chunks/') && url.pathname.endsWith('.js'), async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 9_000));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'commit' });
  await expect(page.locator(INTRO)).toHaveAttribute('data-play', '1');
  await page.keyboard.press('Escape');
  await expect(page.locator(INTRO)).toHaveAttribute('data-play', 'done');
});

test('영상을 못 받으면 오래 막지 않고 첫 화면을 보여 준다', async ({ page }) => {
  await page.route(INTRO_MEDIA, (route) => route.abort());
  await page.goto('/');
  await expect(page.locator(INTRO)).toBeHidden({ timeout: 5_000 });
  await expect(page.locator('.picker-title')).toBeVisible();
});

test.describe('움직임 줄이기', () => {
  test.use({ reducedMotion: 'reduce' });
  test('영상 대신 마지막 장면 한 장을 잠깐 보여 주고 걷힌다 — 영상은 받지 않는다', async ({ page }) => {
    const mediaRequests: string[] = [];
    page.on('request', (r) => {
      if (INTRO_MEDIA.test(new URL(r.url()).pathname)) mediaRequests.push(r.url());
    });
    await page.goto('/');
    await expect(page.locator(INTRO)).toHaveAttribute('data-play', 'still');
    await expect(page.locator(`${INTRO} .intro-end`)).toBeVisible();
    await expect(page.locator(INTRO)).toBeHidden({ timeout: 4_000 });
    expect(mediaRequests).toEqual([]);
  });
});
