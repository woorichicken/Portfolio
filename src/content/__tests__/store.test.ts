import { beforeEach, describe, expect, it } from 'vitest';
import { addItem, editField, placeInRole, setHidden } from '../ops';
import { validateSite } from '../schema';
import { STATIC_DOCS } from '../static-site';
import { DOC_KEYS, contentSource, listChanges, readSite, undoChange, writeSite } from '../store';
import { FakeD1, asD1 } from './fake-d1';

// 쓰기 · 이력 · 되돌리기를 진짜 SQLite(같은 마이그레이션·트리거)에서 돌린다

let fake: FakeD1;
let db: D1Database;

function seed() {
  const bodies: Record<string, unknown> = { 'content:ko': STATIC_DOCS.content.ko, 'content:en': STATIC_DOCS.content.en, 'content:es': STATIC_DOCS.content.es, roles: STATIC_DOCS.roles, hidden: STATIC_DOCS.hidden };
  for (const key of DOC_KEYS) {
    fake.sqlite.prepare(`INSERT INTO content_doc (key, body, version, updated_at, updated_by) VALUES (?, ?, 1, '2026-11-08T00:00:00.000Z', 'seed')`).run(key, JSON.stringify(bodies[key]));
    fake.sqlite.prepare(`INSERT INTO content_history (change_id, key, version, prev_body, body, action, actor, summary, at) VALUES ('seed-1', ?, 1, NULL, ?, 'seed', 'seed', '시드', '2026-11-08T00:00:00.000Z')`).run(key, JSON.stringify(bodies[key]));
  }
}

const tagline = async () => (await readSite(db)).content.ko.work.projects.find((p) => p.id === 'kits')!.tagline;

beforeEach(() => {
  fake = new FakeD1();
  db = asD1(fake);
  seed();
});

describe('writeSite', () => {
  it('바뀐 문서만 쓰고 버전을 올리고 이력에 직전 값을 남긴다', async () => {
    const base = await readSite(db);
    const r = await writeSite(db, base, editField(base, { path: 'work.projects[kits].tagline', locale: 'ko', value: '하나' }), { action: 'set', actor: 'agent', summary: 's' });
    expect(r.changed).toEqual(['content:ko']);
    expect(r.versions['content:ko']).toBe(2);
    expect(await tagline()).toBe('하나');
    const row = fake.sqlite.prepare('SELECT prev_body, body FROM content_history WHERE change_id = ?').get(r.changeId) as { prev_body: string; body: string };
    expect(JSON.parse(row.prev_body).work.projects[0].tagline).toBe(STATIC_DOCS.content.ko.work.projects[0].tagline);
  });

  it('검사에 걸리면 아무것도 쓰지 않는다', async () => {
    const base = await readSite(db);
    const bad = editField(base, { path: 'work.projects[kits].improvements[0].badge', locale: 'ko', value: 'x' });
    await expect(writeSite(db, base, bad, { action: 'set', actor: 'agent', summary: 's' })).rejects.toMatchObject({ status: 422 });
    expect((await readSite(db)).versions['content:ko']).toBe(1);
  });

  it('읽은 뒤 누가 먼저 쓰면 409 이고, 문서 여러 개 중 하나라도 막히면 전부 안 쓴다', async () => {
    const stale = await readSite(db);
    const fresh = await readSite(db);
    await writeSite(db, fresh, placeInRole(fresh, { role: 'design', id: 'fair', at: 0 }), { action: 'role', actor: 'admin', summary: '먼저' });
    // stale 은 roles v1 을 봤다. ko 와 roles 를 같이 바꾸려 하면 roles 가 막히고 ko 도 되돌아가야 한다
    let next = editField(stale, { path: 'work.projects[kits].tagline', locale: 'ko', value: '나중' });
    next = placeInRole(next, { role: 'design', id: 'cli-manager', at: 0 });
    await expect(writeSite(db, stale, next, { action: 'set', actor: 'agent', summary: '나중' })).rejects.toMatchObject({ status: 409 });
    expect(await tagline()).toBe(STATIC_DOCS.content.ko.work.projects[0].tagline);
    expect((await readSite(db)).roles.design.projects[0]).toBe('fair');
  });
});

describe('수정 1회차 P1 — 본문 출처', () => {
  it('Vercel(VERCEL=1)이면 D1 없이 정적, CONTENT_SOURCE 가 있으면 그게 이긴다', () => {
    const saved = { v: process.env.VERCEL, c: process.env.CONTENT_SOURCE };
    try {
      delete process.env.CONTENT_SOURCE;
      process.env.VERCEL = '1';
      expect(contentSource()).toBe('static');
      delete process.env.VERCEL;
      expect(contentSource()).toBe('d1');
      process.env.CONTENT_SOURCE = 'static';
      expect(contentSource()).toBe('static');
    } finally {
      if (saved.v === undefined) delete process.env.VERCEL; else process.env.VERCEL = saved.v;
      if (saved.c === undefined) delete process.env.CONTENT_SOURCE; else process.env.CONTENT_SOURCE = saved.c;
    }
  });
});

describe('수정 1회차 P2b — 검사에 쓴 다른 문서도 버전을 지킨다', () => {
  it('추가 되돌리기가 읽은 뒤 그 항목을 숨기는 저장이 끼면 되돌리기는 409 이고 D1 은 늘 검사를 통과한다', async () => {
    const shot = { src: '/work/design_atlas.jpg', width: 1400, height: 875, alt: 'x' };
    const item = (name: string) => ({ slug: 'race', name, period: '2026', body: name, shot, detail: { facts: [], paragraphs: [] } });
    const b0 = await readSite(db);
    const add = await writeSite(db, b0, addItem(b0, { kind: 'other', item: { ko: item('가'), en: item('A'), es: item('A') } }), { action: 'add-project', actor: 'agent', summary: '추가' });
    const stale = await readSite(db); // 되돌리기가 읽은 상태 — hidden v1
    const fresh = await readSite(db);
    await writeSite(db, fresh, setHidden(fresh, { hide: ['race'] }), { action: 'hide', actor: 'admin', summary: '숨김' });
    await expect(undoChange(db, stale, add.changeId!, 'agent')).rejects.toMatchObject({ status: 409 });
    expect(validateSite(await readSite(db))).toEqual([]);
  });
});

describe('undoChange', () => {
  async function set(value: string) {
    const base = await readSite(db);
    return writeSite(db, base, editField(base, { path: 'work.projects[kits].tagline', locale: 'ko', value }), { action: 'set', actor: 'agent', summary: value });
  }

  it('기본은 가장 최근 저장 — 여러 번 부르면 한 칸씩 뒤로 간다(되돌리기를 다시 되돌리지 않는다)', async () => {
    await set('A');
    await set('B');
    await undoChange(db, await readSite(db), undefined, 'agent');
    expect(await tagline()).toBe('A');
    await undoChange(db, await readSite(db), undefined, 'agent');
    expect(await tagline()).toBe(STATIC_DOCS.content.ko.work.projects[0].tagline);
    await expect(undoChange(db, await readSite(db), undefined, 'agent')).rejects.toMatchObject({ status: 404 });
  });

  it('되돌리기의 changeId 를 주면 다시 하기가 된다', async () => {
    await set('A');
    const u = await undoChange(db, await readSite(db), undefined, 'agent');
    await undoChange(db, await readSite(db), u.changeId!, 'agent');
    expect(await tagline()).toBe('A');
  });

  it('다시 하기 뒤의 기본 undo 는 그 다시 하기를 무른다(오래된 저장으로 건너뛰지 않는다)', async () => {
    await set('A');
    await set('B');
    const u1 = await undoChange(db, await readSite(db), undefined, 'agent'); // B 를 되돌림 → A
    await undoChange(db, await readSite(db), u1.changeId!, 'agent'); // 다시 하기 → B
    expect(await tagline()).toBe('B');
    await undoChange(db, await readSite(db), undefined, 'agent'); // 다시 B 를 되돌림 → A
    expect(await tagline()).toBe('A');
    await undoChange(db, await readSite(db), undefined, 'agent'); // A 를 되돌림 → 시드
    expect(await tagline()).toBe(STATIC_DOCS.content.ko.work.projects[0].tagline);
  });

  it('그 뒤에 같은 문서가 또 바뀌었으면 막는다 — 뒤의 저장을 조용히 지우지 않는다', async () => {
    const a = await set('A');
    await set('B');
    await expect(undoChange(db, await readSite(db), a.changeId!, 'agent')).rejects.toMatchObject({ status: 409 });
    expect(await tagline()).toBe('B');
  });

  it('시드는 되돌리지 않고, 이력 목록에 되돌린 표시가 남는다', async () => {
    await expect(undoChange(db, await readSite(db), 'seed-1', 'agent')).rejects.toMatchObject({ status: 409 });
    const a = await set('A');
    const u = await undoChange(db, await readSite(db), undefined, 'admin');
    const changes = await listChanges(db, 5);
    expect(changes[0]).toMatchObject({ changeId: u.changeId, action: 'undo', actor: 'admin' });
    expect(changes.find((c) => c.changeId === a.changeId)!.undoneBy).toBe(u.changeId);
  });
});
