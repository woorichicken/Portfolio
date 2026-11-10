import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

// 수정 1회차 P1 — D1 없는 정적 배포(지금 운영 Vercel)에서도 어드민이 예전처럼 돼야 한다:
// 비밀번호(브라우저 해시) → 목록 · 순서 바꾸면 변경안 코드 · 코멘트(이 브라우저에만).
// 정적 빌드에 붙는다: CONTENT_SOURCE=static pnpm build && pnpm e2e:static (기본 Workers 실행에는 안 모인다 — playwright.config.ts)

const PASSWORD = process.env.ADMIN_PASSWORD ?? readFileSync(join(homedir(), '.config/portfolio/feedback-password.txt'), 'utf8').trim();

test('정적 배포 어드민 — 로그인 · 변경안 · 코멘트', async ({ page }) => {
  // Vercel 에는 Cloudflare 컨텍스트·세션 비밀이 없어 /api/content/* 가 실패한다. 로컬 next start 는 wrangler 프록시가 .dev.vars 를 읽어
  // API 가 살아 있으므로(옛 코드가 로컬에선 통과했다) 브라우저에서 Vercel 처럼 실패하게 막아 재현한다.
  await page.route('**/api/content/**', (r) =>
    r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, error: { code: 'internal', message: 'Vercel 재현' } }) }),
  );
  await page.goto('/admin');
  await page.getByLabel('비밀번호').fill(PASSWORD);
  await page.getByRole('button', { name: '열기' }).click();
  await expect(page.getByRole('heading', { name: '어드민', level: 1 })).toBeVisible();
  await expect(page.locator('#diff-title')).toContainText('변경안');
  // 2026-11-10 편집 기능(탭 · 항목 편집 · 오픈소스/영상 · 추가 · 최근 저장)은 저장할 곳이 없는 정적 모드에서 숨긴다
  await expect(page.getByRole('tablist', { name: '관리' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /편집$/ })).toHaveCount(0);
  await expect(page.locator('.admin-item-name')).toHaveCount(0);

  await page.getByRole('group', { name: '보기' }).getByRole('button', { name: '디자인 엔지니어' }).click();
  await page.locator('li[data-admin-item="ncdigitec"]').getByRole('button', { name: /위로$/ }).click();
  await expect(page.locator('.admin-diff pre')).toContainText('"ncdigitec"');
  await expect(page.getByRole('button', { name: '변경안 복사' })).toBeEnabled();

  await page.locator('li[data-admin-item="kits"]').getByRole('button', { name: /코멘트/ }).click();
  await page.locator('#c-kits').fill('정적 배포 코멘트 확인');
  await page.getByRole('button', { name: '남기기' }).click();
  await expect(page.locator('.admin-comments li')).toContainText('정적 배포 코멘트 확인');

  // 쓰기 API 는 정적 배포에서 503 no_db 로 깔끔히 거절한다(500 이 아니라)
  const res = await page.request.get('/api/content');
  expect(res.status()).toBe(503);
  expect((await res.json()).error.code).toBe('no_db');
});
