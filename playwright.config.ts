import { defineConfig, devices } from '@playwright/test';

// E2E 는 서버 두 종류에 붙는다 — 모드마다 모으는 스펙이 다르다(2026-11-08 수정 2회차: 정적 스펙이 Workers 실행에 섞여 실패했다).
//   Workers(기본, 로컬 D1/R2): pnpm cf:build && pnpm e2e:workers   = scripts/with-workers.sh playwright test --workers=1
//   정적(D1 없음 · 지금 Vercel): CONTENT_SOURCE=static pnpm build && pnpm e2e:static   = scripts/with-static.sh … (E2E_MODE=static)
// 정적 스펙은 파일 이름을 *.static.spec.ts 로 둔다.
const STATIC = process.env.E2E_MODE === 'static';

export default defineConfig({
  testDir: 'e2e',
  testMatch: STATIC ? '**/*.static.spec.ts' : '**/*.spec.ts',
  testIgnore: STATIC ? [] : '**/*.static.spec.ts',
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? (STATIC ? 'http://127.0.0.1:3437' : 'http://127.0.0.1:8797'),
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  },
});
