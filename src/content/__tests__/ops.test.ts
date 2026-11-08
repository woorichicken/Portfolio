import { describe, expect, it } from 'vitest';
import { OpError, addItem, affectedPaths, editField, placeInRole, removeFromRole, setHidden } from '../ops';
import { validateSite } from '../schema';
import { STATIC_DOCS } from '../static-site';
import type { OtherWork } from '../types';

const base = STATIC_DOCS;

function other(slug: string, name: string): OtherWork {
  return { slug, name, period: '2026', body: `${name} 한 줄`, shot: { src: '/work/design_atlas.jpg', width: 1400, height: 875, alt: name }, detail: { facts: [], paragraphs: ['문단'] } };
}

describe('editField', () => {
  it('한 언어만 바꾸고 원본은 건드리지 않는다', () => {
    const next = editField(base, { path: 'work.projects[kits].tagline', locale: 'ko', value: '새 한 줄' });
    expect(next.content.ko.work.projects.find((p) => p.id === 'kits')!.tagline).toBe('새 한 줄');
    expect(next.content.en.work.projects.find((p) => p.id === 'kits')!.tagline).toBe(base.content.en.work.projects.find((p) => p.id === 'kits')!.tagline);
    expect(base.content.ko.work.projects.find((p) => p.id === 'kits')!.tagline).not.toBe('새 한 줄');
    expect(validateSite(next)).toEqual([]);
  });

  it('선택 칸을 한 언어에만 넣으면 검사가 막고, 세 언어를 같이 넣으면 통과한다', () => {
    const one = editField(base, { path: 'work.projects[kits].improvements[0].badge', locale: 'ko', value: '최신' });
    expect(validateSite(one).length).toBeGreaterThan(0);
    const all = editField(base, { path: 'work.projects[kits].improvements[0].badge', values: { ko: '최신', en: 'Latest', es: 'Último' } });
    expect(validateSite(all)).toEqual([]);
  });

  it('없는 id 는 404', () => {
    expect(() => editField(base, { path: 'work.projects[nope].tagline', locale: 'ko', value: 'x' })).toThrowError(OpError);
  });
});

describe('addItem · 역할 배치 · 숨김', () => {
  const item = { ko: other('new-thing', '새 작업'), en: other('new-thing', 'New thing'), es: other('new-thing', 'Cosa nueva') };

  it('세 언어로 추가하고 역할에 넣는다', () => {
    const next = addItem(base, { kind: 'other', item, roles: [{ role: 'design', at: 0 }] });
    expect(next.content.es.others.items.at(-1)!.slug).toBe('new-thing');
    expect(next.roles.design.others[0]).toBe('new-thing');
    expect(validateSite(next)).toEqual([]);
  });

  it('한 언어가 빠지거나 id 가 겹치면 막는다', () => {
    expect(() => addItem(base, { kind: 'other', item: { ...item, es: undefined } as never })).toThrowError(/세 언어/);
    expect(() => addItem(base, { kind: 'other', item: { ko: other('kits', 'x'), en: other('kits', 'x'), es: other('kits', 'x') } })).toThrowError(/이미 있습니다/);
  });

  it('역할 안에서 옮기고, 대표작은 빼지 못한다', () => {
    const moved = placeInRole(base, { role: 'design', id: 'fair', at: 0 });
    expect(moved.roles.design.projects[0]).toBe('fair');
    expect(moved.roles.design.projects.filter((x) => x === 'fair')).toHaveLength(1);
    expect(() => removeFromRole(base, { role: 'design', id: 'kits' })).toThrowError(/대표작/);
  });

  it('숨기기·보이기', () => {
    const hidden = setHidden(base, { hide: ['motion-meme'] });
    expect(hidden.hidden).toEqual(['motion-meme']);
    expect(setHidden(hidden, { show: ['motion-meme'] }).hidden).toEqual([]);
  });
});

describe('affectedPaths — 저장 뒤 다시 그릴 페이지', () => {
  it('상세에만 보이는 칸이면 그 상세 하나만', () => {
    const next = editField(base, { path: 'work.projects[kits].summary', locale: 'en', value: 'new summary' });
    expect(affectedPaths(base, next)).toEqual(['/en/projects/kits']);
  });

  it('카드·빌보드에 보이는 칸이면 그 언어 전체 + llms.txt(ko·en)', () => {
    const paths = affectedPaths(base, editField(base, { path: 'work.projects[kits].tagline', locale: 'ko', value: 'x' }));
    expect(paths).toContain('/as/design');
    expect(paths).toContain('/llms.txt');
    expect(paths.some((p) => p.startsWith('/en'))).toBe(false);
  });

  it('역할 순서가 바뀌면 세 언어 전부', () => {
    const paths = affectedPaths(base, placeInRole(base, { role: 'design', id: 'fair', at: 0 }));
    expect(paths).toEqual(expect.arrayContaining(['/as/design', '/en/as/design', '/es/projects/kits']));
  });

  it('항목이 늘면 sitemap 도', () => {
    const next = addItem(base, { kind: 'other', item: { ko: other('n2', '가'), en: other('n2', 'A'), es: other('n2', 'A') } });
    expect(affectedPaths(base, next)).toEqual(expect.arrayContaining(['/sitemap.xml', '/projects/n2', '/es/projects/n2']));
  });
});
