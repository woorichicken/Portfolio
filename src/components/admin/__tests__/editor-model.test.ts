import { describe, expect, it } from 'vitest';
import { describeEdit, editField } from '@/content/ops';
import { validateSite } from '@/content/schema';
import { STATIC_DOCS } from '@/content/static-site';
import { LOCALES } from '@/i18n/config';
import { changedFields, getIn, keyOf, listAdd, listMove, listRemove, normalizeProblemPath, problemsUnder, setAll, setAllOptional, setOne, setOptionalText, toggleGroup, type L3 } from '../editor-model';

// 어드민 편집기의 순수 함수 — 서버 검사(validateSite)와 같이 돌려 「화면이 보내는 모양이 서버를 통과하나」 · 「서버 문제가 맞는 칸에 붙나」를 본다.

const kitsOf = (): L3<Record<string, unknown>> =>
  Object.fromEntries(LOCALES.map((l) => [l, structuredClone(STATIC_DOCS.content[l].work.projects.find((p) => p.id === 'kits')!)])) as unknown as L3<Record<string, unknown>>;

/** 화면이 저장할 때 보내는 것과 같은 요청을 서버 함수에 그대로 */
const saveItem = (draft: L3<unknown>) => editField(STATIC_DOCS, { path: 'work.projects[kits]', values: draft });

describe('경로 · 값 바꾸기', () => {
  it('keyOf 는 서버 경로 모양', () => {
    expect(keyOf(['improvements', 0, 'badge'])).toBe('improvements[0].badge');
    expect(keyOf(['items', 2])).toBe('items[2]');
    expect(keyOf(['detail', 'paragraphs', 1])).toBe('detail.paragraphs[1]');
  });

  it('한 언어 · 세 언어 · 원본은 그대로', () => {
    const d = kitsOf();
    const one = setOne(d, 'en', ['tagline'], 'New line');
    expect(one.en.tagline).toBe('New line');
    expect(one.ko.tagline).toBe(d.ko.tagline);
    expect(d.en.tagline).not.toBe('New line');
    const all = setAll(d, ['repo'], 'https://github.com/x/y');
    expect(LOCALES.map((l) => all[l].repo)).toEqual(['https://github.com/x/y', 'https://github.com/x/y', 'https://github.com/x/y']);
    expect(setAllOptional(all, ['repo'], '  ').ko.repo).toBeUndefined();
  });

  it('목록 줄 추가·빼기·순서는 세 언어 같이 — 그대로 저장하면 서버 검사를 통과한다', () => {
    let d = kitsOf();
    const n = (d.ko.facts as unknown[]).length;
    d = listAdd(d, ['facts'], (l) => ({ label: `라벨 ${l}`, value: `값 ${l}` }));
    expect(LOCALES.map((l) => (d[l].facts as unknown[]).length)).toEqual([n + 1, n + 1, n + 1]);
    d = listMove(d, ['facts'], n, -1);
    expect((getIn(d.es, ['facts', n - 1]) as { label: string }).label).toBe('라벨 es');
    expect(validateSite(saveItem(d))).toEqual([]);
    d = listRemove(d, ['facts'], n - 1);
    expect(LOCALES.map((l) => (d[l].facts as unknown[]).length)).toEqual([n, n, n]);
  });

  it('선택 목록은 다 빼면 칸을 지운다(빈 목록을 남기지 않는다)', () => {
    let d = kitsOf();
    const quotes = (d.ko.quotes as unknown[]).length;
    for (let i = 0; i < quotes; i += 1) d = listRemove(d, ['quotes'], 0, true);
    expect(LOCALES.map((l) => 'quotes' in d[l])).toEqual([false, false, false]);
    expect(validateSite(saveItem(d))).toEqual([]);
  });

  it('선택 묶음 켜고 끄기 — 세 언어 같이', () => {
    let d = kitsOf();
    d = toggleGroup(d, ['improvements', 0, 'metric'], null);
    expect(LOCALES.some((l) => getIn(d[l], ['improvements', 0, 'metric']) !== undefined)).toBe(false);
    d = toggleGroup(d, ['improvements', 0, 'metric'], () => ({ value: '1', label: 'x' }));
    expect(validateSite(saveItem(d))).toEqual([]);
  });
});

describe('서버 문제(422) → 칸', () => {
  it('경로 두 모양을 맞춘다', () => {
    expect(normalizeProblemPath('content.ko.work.projects.0.improvements.1.badge')).toEqual({ locale: 'ko', path: 'work.projects[0].improvements[1].badge' });
    expect(normalizeProblemPath('work.projects[kits].repo')).toEqual({ locale: undefined, path: 'work.projects[kits].repo' });
    expect(normalizeProblemPath('content.videos.items[a].project')).toEqual({ locale: undefined, path: 'videos.items[a].project' });
  });

  it('배지를 한 언어만 채우면(세 언어 모양) — 서버가 막고, 그 배지 칸에 붙는다', () => {
    const d = setOptionalText(kitsOf(), 'ko', ['improvements', 0, 'badge'], '최신');
    const problems = validateSite(saveItem(d));
    expect(problems.length).toBeGreaterThan(0);
    const mapped = problemsUnder(problems, 'work.projects', { itemList: true });
    expect(mapped.byField['improvements[0].badge']?.length).toBeGreaterThan(0);
    // 비우면 칸이 지워져 다시 통과한다
    expect(validateSite(saveItem(setOptionalText(d, 'ko', ['improvements', 0, 'badge'], '')))).toEqual([]);
  });

  it('https 가 아닌 repo(zod) — 언어별 문제가 repo 칸에 붙는다', () => {
    const d = setAll(kitsOf(), ['repo'], 'http://github.com/x');
    const mapped = problemsUnder(validateSite(saveItem(d)), 'work.projects', { itemList: true });
    expect(mapped.byField.repo?.map((p) => p.locale).sort()).toEqual(['en', 'es', 'ko']);
  });

  it('오픈소스 목록 — [id] 도 [번호] 도 화면 줄 번호로', () => {
    const problems = [
      { path: 'content.ko.openSource.items.1.repo', message: 'https' },
      { path: 'openSource.items[nightgate].repo', message: '언어마다 같아야' },
      { path: 'content.openSource.items', message: 'id 두 번' },
    ];
    const m = problemsUnder(problems, 'openSource', { ids: ['cli', 'nightgate'] });
    expect(m.byField['items[1].repo']?.length).toBe(2);
    expect(m.byField.items?.length).toBe(1);
    expect(m.all.length).toBe(3);
  });
});

describe('무엇이 바뀌었나', () => {
  it('화면 — 바뀐 칸과 언어', () => {
    const d = setOne(setOne(kitsOf(), 'ko', ['tagline'], 'a'), 'en', ['tagline'], 'b');
    expect(changedFields(kitsOf(), setAll(d, ['repo'], 'https://x.y'))).toEqual(['tagline (ko·en)', 'repo (ko·en·es)']);
  });

  it('서버 이력 한 줄(describeEdit) — 항목 통째 저장이면 바뀐 칸 이름까지', () => {
    const d = setOne(kitsOf(), 'ko', ['summary'], '새 요약');
    const edit = { path: 'work.projects[kits]', values: d };
    expect(describeEdit(STATIC_DOCS, editField(STATIC_DOCS, edit), edit)).toBe('고침 work.projects[kits] — summary (ko)');
    // 칸 하나 고치기는 예전 모양 그대로
    const one = { path: 'hero.lead', locale: 'en' as const, value: 'x' };
    expect(describeEdit(STATIC_DOCS, editField(STATIC_DOCS, one), one)).toBe('고침 hero.lead (en)');
    // 없던 목록을 새로 넣으면 (새로)
    const oss = { path: 'openSource', values: { ko: { items: [] }, en: { items: [] }, es: { items: [] } } };
    const noOss = structuredClone(STATIC_DOCS);
    for (const l of LOCALES) delete noOss.content[l].openSource;
    expect(describeEdit(noOss, editField(noOss, oss), oss)).toBe('고침 openSource — (새로) (ko·en·es)');
  });
});
