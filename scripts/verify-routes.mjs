#!/usr/bin/env node
// 두 주소(예: 운영 www.solhun.com 과 로컬 Workers)의 경로별 응답을 나란히 재서 같은지 본다.
// Workers 로 옮긴 뒤 리다이렉트·언어판·sitemap·robots·llms.txt·구조화 데이터·피드백 관문이 그대로인지 확인하는 용도.
//
//   node scripts/verify-routes.mjs --a https://www.solhun.com --b http://localhost:8787
//   node scripts/verify-routes.mjs --b http://localhost:8787          # 한쪽만 재기
//   … --cli-manager 1                                                  # CLI Manager 옛 경로(빌드 env CLI_MANAGER_ROUTES=1)까지
//
// 종료코드: 0 = 모든 경로가 기대값 · 1 = 하나라도 다름 · 2 = 인자 오류

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => (cur.startsWith('--') ? [...acc, [cur.slice(2), arr[i + 1]]] : acc), []),
);
const bases = [args.a, args.b].filter(Boolean).map((u) => u.replace(/\/$/, ''));
if (bases.length === 0) {
  console.error('사용법: node scripts/verify-routes.mjs [--a <기준 주소>] --b <비교 주소>');
  process.exit(2);
}

// 각 경로에서 무엇을 기대하나. location 은 리다이렉트 목적지(호스트를 뺀 경로)
const CHECKS = [
  { path: '/', status: 200, has: ['<html lang="ko"', '"@type":"Person"', '어떤 SOLHUN을 볼까요?'] },
  { path: '/en', status: 200, has: ['<html lang="en"', '"@type":"Person"', 'hrefLang="es"'] },
  { path: '/es', status: 200, has: ['<html lang="es"', '"@type":"Person"'] },
  { path: '/as/design', status: 200, has: ['row-artifacts'] },
  { path: '/as/all', status: 200, has: [] },
  { path: '/en/as/product', status: 200, has: ['<html lang="en"'] },
  { path: '/projects/kits', status: 200, has: ['KITS'] },
  { path: '/es/projects/fair', status: 200, has: ['<html lang="es"'] },
  { path: '/admin', status: 200, has: ['noindex'] },
  { path: '/?feedback', status: 200, has: [] },
  { path: '/design', status: 308, location: '/as/design#row-artifacts' },
  { path: '/en/design', status: 308, location: '/en/as/design#row-artifacts' },
  { path: '/ko', status: 404 },
  { path: '/as/nope', status: 404 },
  { path: '/projects/nope', status: 404 },
  { path: '/sitemap.xml', status: 200, has: ['<urlset', '/projects/kits', 'hreflang="es"'] },
  { path: '/robots.txt', status: 200, has: ['Sitemap:', 'Disallow: /admin'] },
  { path: '/llms.txt', status: 200, has: ['# 정경훈', '## 주요 프로젝트'] },
];

// 운영 빌드는 CLI_MANAGER_ROUTES=1 이다(docs/DEPLOY.md 3절). 그 빌드끼리 비교할 때만 --cli-manager 1 로 켠다
if (args['cli-manager'] === '1') {
  CHECKS.push(
    { path: '/changelog', status: 301, location: '/changelog' },
    { path: '/privacy', status: 200, has: [] },
    // 슬래시가 든 하위 경로도 308 이어야 한다(한 칸에 받으면 500 — next.config.ts 주석)
    { path: '/api/roadmaps/x', status: 308, location: '/api/roadmaps/x' },
  );
}

async function probe(base, check) {
  const res = await fetch(base + check.path, { redirect: 'manual' });
  const text = res.status === 200 ? await res.text() : '';
  const location = res.headers.get('location')?.replace(/^https?:\/\/[^/]+/, '') ?? '';
  const missing = (check.has ?? []).filter((s) => !text.includes(s));
  const ok = res.status === check.status && missing.length === 0 && (!check.location || location === check.location);
  return { status: res.status, location, missing, ok, bytes: text.length, type: res.headers.get('content-type') ?? '' };
}

let failed = 0;
console.log(['경로', ...bases.map((b) => b.replace(/^https?:\/\//, ''))].join(' | '));
for (const check of CHECKS) {
  const results = [];
  for (const base of bases) {
    try {
      results.push(await probe(base, check));
    } catch (e) {
      results.push({ ok: false, status: 'ERR', location: '', missing: [String(e.message)] });
    }
  }
  const cells = results.map((r) => `${r.ok ? '✓' : '✗'} ${r.status}${r.location ? ` → ${r.location}` : ''}${r.missing.length ? ` 없음: ${r.missing.join(', ')}` : ''}`);
  if (results.some((r) => !r.ok)) failed += 1;
  console.log([check.path, ...cells].join(' | '));
}
console.log(failed === 0 ? `\n전부 기대값 (${CHECKS.length}경로)` : `\n기대와 다른 경로 ${failed}개`);
process.exit(failed === 0 ? 0 : 1);
