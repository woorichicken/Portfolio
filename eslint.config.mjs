import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Next 16 은 `next lint` 를 없앴다 — ESLint CLI(`pnpm lint` = eslint .)로 돈다. eslint-config-next 16 이 플랫 설정을 바로 낸다(FlatCompat 불필요).
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // eslint-config-next 기본값
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Cloudflare(OpenNext·wrangler) 산출물 · 생성 타입 · 테스트 결과
    '.open-next/**',
    '.wrangler/**',
    'cloudflare-env.d.ts',
    'test-results/**',
    'playwright-report/**',
  ]),
]);
