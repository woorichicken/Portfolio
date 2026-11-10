import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// E2E 공용 — 로컬 D1 을 wrangler 로 직접 읽는다(API 를 거치지 않은 「실제 적재」 확인). admin-editor.spec.ts 가 쓴다.
// (admin-save.spec.ts 는 같은 함수를 안에 따로 갖고 있다 — 그 스펙은 이번에 바꾸지 않았다)

export const PASSWORD = process.env.ADMIN_PASSWORD ?? readFileSync(join(homedir(), '.config/portfolio/feedback-password.txt'), 'utf8').trim();
export const TOKEN = readFileSync('.dev.vars', 'utf8').match(/^CONTENT_API_TOKEN=(.+)$/m)![1].trim();

export function d1Doc<T>(key: string): { body: T; version: number } {
  const out = execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command', `SELECT body, version FROM content_doc WHERE key = '${key}'`], { encoding: 'utf8' });
  const row = JSON.parse(out)[0].results[0] as { body: string; version: number };
  return { body: JSON.parse(row.body) as T, version: row.version };
}

export function d1Changes(limit = 5): { change_id: string; actor: string; summary: string; undone_by: string | null }[] {
  const out = execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', '--json', '--command', `SELECT change_id, actor, summary, undone_by FROM content_history GROUP BY change_id ORDER BY MAX(id) DESC LIMIT ${limit}`], { encoding: 'utf8' });
  return JSON.parse(out)[0].results;
}
