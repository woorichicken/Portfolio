import { defineConfig, devices } from '@playwright/test';

// E2E 는 로컬 Workers 런타임(wrangler dev · 로컬 D1/R2)에 붙는다. 서버는 scripts/with-workers.sh 가 띄우고 닫는다:
//   pnpm cf:build && heavy-run -- scripts/with-workers.sh pnpm exec playwright test e2e/admin-save.spec.ts --workers=1
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8797',
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  },
});
