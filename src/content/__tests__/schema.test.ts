import { describe, expect, it } from 'vitest';
import { validateSite, type SiteDocs } from '../schema';
import { STATIC_DOCS } from '../static-site';

const copy = (): SiteDocs => structuredClone(STATIC_DOCS);

describe('validateSite — 세 언어 모양 검사', () => {
  it('지금 저장소 본문은 통과한다(시드가 D1 에 들어가는 조건)', () => {
    expect(validateSite(STATIC_DOCS)).toEqual([]);
  });

  it('한 언어에서 선택 칸이 빠지면 그 칸을 짚는다', () => {
    const d = copy();
    const kits = d.content.en.work.projects.find((p) => p.id === 'kits')!;
    delete (kits as { lesson?: unknown }).lesson;
    const problems = validateSite(d);
    expect(problems.map((p) => p.path)).toContain('work.projects[kits].lesson');
  });

  it('목록 길이가 다르면 막는다', () => {
    const d = copy();
    d.content.es.timeline.items.pop();
    expect(validateSite(d).some((p) => p.path === 'timeline.items' && p.message.includes('길이'))).toBe(true);
  });

  it('사진 파일은 언어마다 같아야 한다', () => {
    const d = copy();
    d.content.en.work.projects[0].cover = { ...d.content.en.work.projects[0].cover, src: '/work/other.jpg' };
    expect(validateSite(d).some((p) => p.path.endsWith('cover.src'))).toBe(true);
  });

  it('프로젝트 로고(logo)는 선택 — 세 언어 같은 사진이면 통과, 언어마다 다르거나 사진이 아니면 막는다', () => {
    const d = copy();
    for (const l of ['ko', 'en', 'es'] as const) d.content[l].work.projects[0].logo = '/media/image/kits-logo-0123456789.png';
    expect(validateSite(d)).toEqual([]);
    d.content.en.work.projects[0].logo = '/media/image/other-0123456789.png';
    expect(validateSite(d).some((p) => p.path.endsWith('logo'))).toBe(true);
    for (const l of ['ko', 'en', 'es'] as const) d.content[l].work.projects[0].logo = '/media/video/x.mp4';
    expect(validateSite(d).some((p) => p.message.includes('로고는'))).toBe(true);
  });

  it('모르는 칸(오타)은 zod 가 거절한다', () => {
    const d = copy();
    (d.content.ko.work.projects[0] as unknown as Record<string, unknown>).taglin = '오타';
    expect(validateSite(d).some((p) => p.path.startsWith('content.ko.work.projects.0'))).toBe(true);
  });

  it('역할이 없는 id 를 가리키면 막는다', () => {
    const d = copy();
    d.roles.design.projects.push('no-such-project');
    const at = d.roles.design.projects.length - 1;
    expect(validateSite(d)).toContainEqual({ path: `roles.design.projects[${at}]`, message: '"no-such-project" 는 큰 프로젝트 id 가 아닙니다' });
  });

  it('숨김이 없는 id 를 가리키면 막는다', () => {
    const d = copy();
    d.hidden = ['ghost'];
    expect(validateSite(d)[0].path).toBe('hidden[0]');
  });
});
