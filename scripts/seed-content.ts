// 저장소의 본문(src/content/{ko,en,es}.ts · roles.ts)을 D1 에 넣는다. 여러 번 돌려도 같다(멱등).
//
//   pnpm db:seed:local                 # 비어 있는 문서만 넣는다(이미 있으면 그대로 — 어드민·API 로 고친 것을 덮지 않는다)
//   pnpm db:seed:local --force         # TS 파일과 다른 문서를 TS 파일 값으로 덮는다(덮기 전 값은 이력에 남아 되돌릴 수 있다)
//   pnpm db:seed:local --dry-run       # SQL 만 만들고 실행하지 않는다
//   pnpm db:seed:local --force --from <폴더>   # TS 파일 대신 폴더의 ko·en·es·roles·hidden.json 을 넣는다 — 운영 문서로 로컬을 맞출 때
//                                      #   (폴더 만들기: for d in ko en es roles hidden; do pnpm -s content get --doc $d --target prod > <폴더>/$d.json; done)
//
// 원격(운영) D1 은 이 스크립트로 넣지 않는다 — 토큰을 받은 뒤 docs/content-api.md 「토큰 받은 뒤 할 일」 순서대로.
// 넣기 전에 zod 검사(src/content/schema.ts)를 돌려서, 모양이 틀린 본문은 D1 에 들어가지 않는다.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateSite, type SiteDocs } from '../src/content/schema';
import { STATIC_DOCS } from '../src/content/static-site';

const argv = process.argv.slice(2);
const args = new Set(argv);
const fromDir = args.has('--from') ? argv[argv.indexOf('--from') + 1] : undefined;
if (args.has('--from') && !fromDir) {
  console.error('--from 뒤에 폴더를 주세요(ko.json · en.json · es.json · roles.json · hidden.json)');
  process.exit(2);
}
const force = args.has('--force');
const dryRun = args.has('--dry-run');
if (args.has('--remote')) {
  console.error('이 스크립트는 원격 D1 에 쓰지 않습니다 — docs/content-api.md 「토큰 받은 뒤 할 일」을 보세요');
  process.exit(2);
}

// --from: 운영에서 받은 문서로 — 새 코드가 운영 문서를 그대로 받는지(선택 칸만 더했는지) 로컬에서 볼 때 쓴다
const read = (name: string) => JSON.parse(readFileSync(join(fromDir!, `${name}.json`), 'utf8'));
const SOURCE: SiteDocs = fromDir ? { content: { ko: read('ko'), en: read('en'), es: read('es') }, roles: read('roles'), hidden: read('hidden') } : STATIC_DOCS;
const problems = validateSite(SOURCE);
if (problems.length) {
  console.error(`검사 실패 ${problems.length}건 — D1 에 넣지 않았습니다`);
  for (const p of problems.slice(0, 20)) console.error(`  ${p.path}: ${p.message}`);
  process.exit(1);
}

const docs: Record<string, unknown> = {
  'content:ko': SOURCE.content.ko,
  'content:en': SOURCE.content.en,
  'content:es': SOURCE.content.es,
  roles: SOURCE.roles,
  hidden: SOURCE.hidden,
};

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const at = new Date().toISOString();
const changeId = `seed-${at.replace(/[-:.TZ]/g, '').slice(0, 14)}`;
const lines: string[] = [];
for (const [key, value] of Object.entries(docs)) {
  const body = q(JSON.stringify(value));
  // 1) 처음 넣는 문서 — 이력(prev 없음) + 본문. 이미 있으면 둘 다 아무것도 안 한다
  lines.push(
    `INSERT INTO content_history (change_id, key, version, prev_body, body, action, actor, summary, at) SELECT ${q(changeId)}, ${q(key)}, 1, NULL, ${body}, 'seed', 'seed', '저장소 TS 파일에서 처음 넣음', ${q(at)} WHERE NOT EXISTS (SELECT 1 FROM content_doc WHERE key = ${q(key)});`,
    `INSERT INTO content_doc (key, body, version, updated_at, updated_by) VALUES (${q(key)}, ${body}, 1, ${q(at)}, 'seed') ON CONFLICT(key) DO NOTHING;`,
  );
  // 2) --force — 값이 다를 때만 덮고, 덮기 전 값을 이력에 남긴다
  if (force) {
    lines.push(
      `INSERT INTO content_history (change_id, key, version, prev_body, body, action, actor, summary, at) SELECT ${q(changeId)}, key, version + 1, body, ${body}, 'seed', 'seed', ${q(fromDir ? `${fromDir} 의 JSON 으로 다시 덮음(--force --from)` : '저장소 TS 파일로 다시 덮음(--force)')}, ${q(at)} FROM content_doc WHERE key = ${q(key)} AND body != ${body};`,
      `UPDATE content_doc SET body = ${body}, version = version + 1, updated_at = ${q(at)}, updated_by = 'seed' WHERE key = ${q(key)} AND body != ${body};`,
    );
  }
}

const dir = join(process.cwd(), '.wrangler', 'seed');
mkdirSync(dir, { recursive: true });
const file = join(dir, `${changeId}${force ? '-force' : ''}.sql`);
writeFileSync(file, lines.join('\n') + '\n');
const bytes = Object.values(docs).map((d) => Buffer.byteLength(JSON.stringify(d)));
console.log(`SQL ${file} — 문서 ${bytes.length}개, 가장 큰 문서 ${Math.max(...bytes)} 바이트(D1 SQL 문 한 개 상한 100KB 의 절반 아래여야 --force 가 돈다)`);
if (dryRun) process.exit(0);

execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', `--file=${file}`], { stdio: 'inherit' });
const out = execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command', 'SELECT key, version, updated_by, length(body) AS bytes FROM content_doc ORDER BY key'], { encoding: 'utf8' });
const rows = JSON.parse(out)[0].results as { key: string; version: number; updated_by: string; bytes: number }[];
console.table(rows);
if (rows.length !== bytes.length) {
  console.error(`D1 문서가 ${rows.length}개입니다(기대 ${bytes.length}) — 마이그레이션부터: pnpm db:migrate:local`);
  process.exit(1);
}
