import { expect, test } from '@playwright/test';

// 2026-11-10 제보 반영 — 오픈소스 행(336f0c01 · /as/maker) · 코드 보기(3cea15e9 · .project-head) · 만든 영상 행(2b371c78 · /as/design).
// 로컬 Workers 에 붙는다(D1 에 새 칸이 들어간 뒤): pnpm db:seed:local --force && pnpm cf:build && pnpm e2e:workers
// 또는 운영 모양 문서 + 배치 폴더 fb/apply-prod.sh 를 로컬에 돌린 뒤 — 결과는 시드와 같다(fb/REPORT.md).

const CLI_REPO = 'https://github.com/woorichicken/CLI_manager';

test('/as/maker 오픈소스 행 — 저장소 5개, 카드에서 GitHub 저장소·사이트로 나간다', async ({ page }) => {
  await page.goto('/as/maker');
  const row = page.locator('#row-opensource');
  await expect(row.getByRole('heading', { name: '오픈소스' })).toBeVisible();
  const cards = row.locator('article.oss');
  await expect(cards).toHaveCount(5);
  const expected = ['CLI_manager', 'artifact-dock', 'nightgate', 'framenote', 'climanager-session'];
  for (const [i, repo] of expected.entries()) {
    const code = cards.nth(i).getByRole('link', { name: /^코드 보기/ });
    await expect(code).toHaveAttribute('href', `https://github.com/woorichicken/${repo}`);
    await expect(code).toHaveAttribute('target', '_blank');
  }
  // 사이트가 있는 저장소만 「사이트」 링크
  await expect(cards.nth(1).getByRole('link', { name: /^사이트/ })).toHaveAttribute('href', 'https://artifact-dock.solhun.com');
  await expect(cards.nth(4).getByRole('link', { name: /^사이트/ })).toHaveCount(0);
  // 다른 역할(product)에는 없다 — roles 문서가 정한다
  await page.goto('/as/product');
  await expect(page.locator('#row-opensource')).toHaveCount(0);
});

test('코드 보기 — /projects/cli-manager 머리와 /as/maker 빌보드', async ({ page }) => {
  await page.goto('/projects/cli-manager');
  const head = page.locator('.title-actions');
  await expect(head.getByRole('link', { name: /^사이트 열기/ })).toBeVisible();
  await expect(head.getByRole('link', { name: /^코드 보기/ })).toHaveAttribute('href', CLI_REPO);
  await page.goto('/as/maker');
  await expect(page.locator('.billboard-actions').getByRole('link', { name: /^코드 보기/ })).toHaveAttribute('href', CLI_REPO);
  // repo 가 없는 항목에는 없다
  await page.goto('/projects/kits');
  await expect(page.getByRole('link', { name: /^코드 보기/ })).toHaveCount(0);
  // 영어 문구
  await page.goto('/en/projects/cli-manager');
  await expect(page.locator('.title-actions').getByRole('link', { name: /^View code/ })).toHaveAttribute('href', CLI_REPO);
});

test('/as/design 만든 영상 행 — 자동재생 없이 포스터, 영상은 Range 206 으로 받는다', async ({ page, request }) => {
  await page.goto('/as/design');
  const row = page.locator('#row-videos');
  await expect(row.getByRole('heading', { name: '만든 영상' })).toBeVisible();
  const videos = row.locator('video');
  await expect(videos).toHaveCount(4);
  for (let i = 0; i < 4; i += 1) {
    const v = videos.nth(i);
    await expect(v).toHaveAttribute('controls', '');
    await expect(v).toHaveAttribute('preload', 'none');
    await expect(v).not.toHaveAttribute('autoplay', /.*/);
    const poster = (await v.getAttribute('poster'))!;
    const src = (await v.locator('source').getAttribute('src'))!;
    expect(src).toMatch(/^\/media\/video\/.+\.mp4$/);
    // 포스터 — 사진으로 온다
    const p = await request.get(poster);
    expect(p.status(), poster).toBe(200);
    expect(p.headers()['content-type']).toBe('image/jpeg');
    // 영상 — 앞 1KB 를 Range 로: 206 · mp4 · 실제 MP4 상자(ftyp)
    const r = await request.get(src, { headers: { range: 'bytes=0-1023' } });
    expect(r.status(), src).toBe(206);
    expect(r.headers()['content-type']).toBe('video/mp4');
    expect(r.headers()['content-range']).toMatch(/^bytes 0-1023\/\d+$/);
    expect((await r.body()).subarray(4, 8).toString('latin1')).toBe('ftyp');
  }
  // 누르기 전에는 영상 본문을 받지 않는다(preload="none") — 화면을 연 동안 /media/video 요청이 없어야 한다
  const fetched: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/media/video/')) fetched.push(req.url());
  });
  await page.reload();
  await expect(row.locator('video').first()).toBeVisible();
  await page.waitForTimeout(1000);
  expect(fetched).toEqual([]);
  // 영상이 소개하는 프로젝트로 가는 링크
  await expect(row.getByRole('link', { name: '프로젝트 보기 · FAIR' })).toHaveAttribute('href', '/projects/fair');
  // 1인 제작자 화면에는 영상 행이 없다
  await page.goto('/as/maker');
  await expect(page.locator('#row-videos')).toHaveCount(0);
});

test('영상 재생 — 브라우저가 mp4(H.264)를 풀 수 있으면 실제로 재생해 본다', async ({ page }) => {
  await page.goto('/as/design');
  const video = page.locator('#row-videos video').first();
  const canPlay = await video.evaluate((v: HTMLVideoElement) => v.canPlayType('video/mp4; codecs="avc1.640028"'));
  test.skip(!canPlay, `이 브라우저(Playwright Chromium)는 H.264 를 못 푼다 — canPlayType="${canPlay}". Range 206 · ftyp 는 위 테스트가 본다`);
  await video.evaluate(async (v: HTMLVideoElement) => {
    v.muted = true;
    await v.play();
  });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 10_000 }).toBeGreaterThan(0.2);
});
