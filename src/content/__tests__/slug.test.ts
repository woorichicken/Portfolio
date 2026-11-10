import { describe, expect, it } from 'vitest';
import { SLUG_PATTERN } from '@/components/admin/editor-model';
import { addItem, editField, parsePath } from '../ops';
import { SlugSchema, validateSite } from '../schema';
import { STATIC_DOCS } from '../static-site';
import type { OtherWork } from '../types';

// 수정 1회차 P2(숫자 slug) — 경로의 `[999]` 는 배열 번호로 읽힌다. 그래서 숫자로만 된 slug 로 추가한 항목은 편집 패널에서 저장하면 400 bad_path 였다.
// 경로 규칙을 바꾸지 않고, 만들 때 막는다: slug·id 는 영문 소문자로 시작(서버 스키마 = 추가 폼 즉석 검사, 같은 규칙).

const other = (slug: string): OtherWork => ({ slug, name: 'x', period: '2026', body: 'x', shot: { src: '/work/design_atlas.jpg', width: 1400, height: 875, alt: 'x' }, detail: { facts: [], paragraphs: ['x'] } });

describe('slug 는 영문 소문자로 시작한다', () => {
  it('서버 스키마 — 숫자로 시작하면 막는다', () => {
    for (const bad of ['999', '2026-work', '1st']) expect(SlugSchema.safeParse(bad).success, bad).toBe(false);
    for (const ok of ['kits', 'cli-manager', 'web3', 'a1-b2']) expect(SlugSchema.safeParse(ok).success, ok).toBe(true);
  });

  it('숫자 slug 로 추가하면 서버 검사(422)에서 막힌다 — 편집 경로 [999] 가 번호로 읽히는 항목이 생기지 않게', () => {
    const next = addItem(STATIC_DOCS, { kind: 'other', item: { ko: other('999'), en: other('999'), es: other('999') } });
    expect(validateSite(next).some((p) => p.path.endsWith('.slug'))).toBe(true);
    // 그 이유 — 경로에서 [999] 는 번호다
    expect(parsePath('others.items[999].name')[2]).toEqual({ index: 999 });
  });

  it('추가 폼의 즉석 검사도 같은 규칙', () => {
    expect(SLUG_PATTERN.test('999')).toBe(false);
    expect(SLUG_PATTERN.test('my-new-work')).toBe(true);
  });

  it('지금 본문(시드)의 id·slug 는 모두 통과한다', () => {
    expect(validateSite(STATIC_DOCS)).toEqual([]);
    // 소문자로 시작하는 slug 는 경로에서 id 로 읽혀 저장된다
    expect(() => editField(STATIC_DOCS, { path: 'others.items[design-atlas].name', locale: 'ko', value: 'x' })).not.toThrow();
  });
});
