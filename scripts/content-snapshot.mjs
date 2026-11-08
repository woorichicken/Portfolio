#!/usr/bin/env node
// 빌드 직전에 D1 의 본문 문서를 파일 하나로 뜬다 — `next build` 가 미리 그리는 페이지는 이 파일을 읽는다.
//
//   node scripts/content-snapshot.mjs --local     # 로컬 D1(.wrangler/state) — pnpm cf:build 가 부른다
//   node scripts/content-snapshot.mjs --remote    # 운영 D1 — Workers Builds 의 빌드 명령에서만(토큰 필요)
//
// 왜 빌드에서 D1 을 바로 읽지 않나: next build 는 여러 프로세스에서 동시에 페이지를 모으는데, 각자 wrangler 로컬 D1(miniflare)을 열면
// `internal error; reference = …` 로 죽는다(2026-11-08 실측 — 한 프로세스에서는 정상). 한 번 떠서 파일로 주면 빌드가 결정적이다.
// 런타임(Workers)은 이 파일을 쓰지 않는다 — 요청마다 D1 을 읽고, 저장하면 그 페이지만 다시 그린다(src/content/store.ts).

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const target = process.argv.includes('--remote') ? '--remote' : '--local';
const SNAPSHOT_PATH = join(process.cwd(), '.wrangler', 'content-snapshot.json');

let out;
try {
  out = execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', target, '--json', '--command', 'SELECT key, body, version, updated_at FROM content_doc'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
} catch (e) {
  console.error(`D1(${target}) 를 읽지 못했습니다 — ${target === '--local' ? 'pnpm db:migrate:local && pnpm db:seed:local 을 먼저' : '토큰·database_id 를 확인'}`);
  process.exit(1);
}
const rows = JSON.parse(out)[0]?.results ?? [];
const KEYS = ['content:ko', 'content:en', 'content:es', 'roles', 'hidden'];
const missing = KEYS.filter((k) => !rows.some((r) => r.key === k));
if (missing.length) {
  console.error(`D1 에 문서가 없습니다: ${missing.join(', ')} — 시드를 먼저(pnpm db:seed:local)`);
  process.exit(1);
}
mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
writeFileSync(SNAPSHOT_PATH, JSON.stringify({ takenAt: new Date().toISOString(), target, rows }));
console.log(`스냅숏 ${SNAPSHOT_PATH} — ${rows.map((r) => `${r.key} v${r.version}`).join(' · ')}`);
