import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

// 유닛 테스트용 D1 — node:sqlite 에 진짜 마이그레이션(migrations/0001)을 깐다. 트리거·트랜잭션이 운영 D1(SQLite)과 같게 돈다.
// D1 API 중 store.ts 가 쓰는 것만(prepare · bind · all · first · run · batch).

type Params = (string | number | null)[];

class Statement {
  constructor(private db: DatabaseSync, readonly sql: string, readonly params: Params = []) {}
  bind(...params: Params) {
    return new Statement(this.db, this.sql, params);
  }
  runSync() {
    const stmt = this.db.prepare(this.sql);
    if (/^\s*(SELECT|WITH)/i.test(this.sql)) return { results: stmt.all(...this.params), success: true, meta: {} };
    const r = stmt.run(...this.params);
    return { results: [], success: true, meta: { changes: Number(r.changes) } };
  }
  async all<T>() {
    return { results: this.db.prepare(this.sql).all(...this.params) as T[], success: true, meta: {} };
  }
  async first<T>() {
    return (this.db.prepare(this.sql).get(...this.params) as T | undefined) ?? null;
  }
  async run() {
    return this.runSync();
  }
}

export class FakeD1 {
  readonly sqlite = new DatabaseSync(':memory:');
  constructor() {
    this.sqlite.exec(readFileSync(new URL('../../../migrations/0001_content.sql', import.meta.url), 'utf8'));
  }
  prepare(sql: string) {
    return new Statement(this.sqlite, sql);
  }
  /** D1 batch 처럼 전부 되거나 전부 안 된다 */
  async batch(statements: Statement[]) {
    this.sqlite.exec('BEGIN');
    try {
      const out = statements.map((s) => s.runSync());
      this.sqlite.exec('COMMIT');
      return out;
    } catch (e) {
      this.sqlite.exec('ROLLBACK');
      throw e;
    }
  }
}

export function asD1(fake: FakeD1): D1Database {
  return fake as unknown as D1Database;
}
