import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/config';
import { affectedPaths, editField, patchRole } from '../ops';
import { validateSite, type SiteDocs } from '../schema';
import { roleScreen } from '../screen-data';
import { STATIC_DOCS } from '../static-site';

// 2026-11-10 제보 반영 — 오픈소스 행(336f0c01) · 코드 보기(3cea15e9) · 만든 영상 행(2b371c78).
// 새 칸은 모두 선택이다: 배포하는 순간 운영 D1 의 옛 문서(새 칸 없음)가 그대로 통과해야 한다.

const copy = (): SiteDocs => structuredClone(STATIC_DOCS);

/** 새 칸을 모두 뺀 문서 — 배포 직전 운영 D1 의 모양 */
function withoutNewFields(): SiteDocs {
  const d = copy();
  for (const l of LOCALES) {
    delete d.content[l].openSource;
    delete d.content[l].videos;
    for (const p of d.content[l].work.projects) delete p.repo;
    for (const o of d.content[l].others.items) delete o.repo;
  }
  for (const r of Object.values(d.roles)) {
    delete r.openSource;
    delete r.videos;
  }
  return d;
}

describe('새 칸이 없는 옛 문서', () => {
  it('그대로 통과한다(운영 D1 이 배포 순간 깨지지 않는다)', () => {
    expect(validateSite(withoutNewFields())).toEqual([]);
  });

  it('행이 하나도 안 나오고 코드 보기도 없다', () => {
    const d = withoutNewFields();
    for (const role of ['maker', 'design', 'all'] as const) {
      const s = roleScreen(d, 'ko', role);
      expect(s.openSource).toEqual([]);
      expect(s.videos).toEqual([]);
    }
  });
});

describe('세 언어 모양 — 새 칸', () => {
  it('저장소 주소는 언어마다 같아야 한다', () => {
    const d = copy();
    d.content.en.openSource!.items[0].repo = 'https://github.com/someone/else';
    expect(validateSite(d).some((p) => p.path === 'openSource.items[cli-manager].repo')).toBe(true);
  });

  it('영상 포스터·연결 프로젝트도 언어마다 같아야 한다', () => {
    const d = copy();
    d.content.es.videos!.items[0].poster = '/media/image/other.jpg';
    d.content.es.videos!.items[0].project = 'fair';
    const paths = validateSite(d).map((p) => p.path);
    expect(paths).toContain('videos.items[climanager-demo].poster');
    expect(paths).toContain('videos.items[climanager-demo].project');
  });

  it('한 언어에만 오픈소스가 있으면 막는다', () => {
    const d = copy();
    delete d.content.en.openSource;
    expect(validateSite(d).some((p) => p.path === 'openSource')).toBe(true);
  });

  it('repo 를 한 언어에만 넣으면 막는다', () => {
    const d = copy();
    d.content.ko.work.projects.find((p) => p.id === 'kits')!.repo = 'https://github.com/x/y';
    expect(validateSite(d).some((p) => p.path === 'work.projects[kits].repo')).toBe(true);
  });
});

describe('새 칸의 값 검사', () => {
  it('영상은 R2(/media/…mp4·webm)에만 — 저장소 파일·다른 형식은 막는다', () => {
    for (const src of ['/work/demo.mp4', '/media/video/demo.mov', 'https://cdn.example.com/a.mp4']) {
      const d = copy();
      for (const l of LOCALES) d.content[l].videos!.items[0].src = src;
      expect(validateSite(d).some((p) => p.path.endsWith('videos.items.0.src')), src).toBe(true);
    }
  });

  it('영상이 없는 프로젝트를 가리키면 막는다', () => {
    const d = copy();
    for (const l of LOCALES) d.content[l].videos!.items[0].project = 'no-such';
    expect(validateSite(d)).toContainEqual({ path: 'content.videos.items[climanager-demo].project', message: '"no-such" 는 없는 항목입니다 — 큰 프로젝트 id 나 그 외 slug' });
  });

  it('오픈소스 id 가 겹치면 막는다', () => {
    const d = copy();
    for (const l of LOCALES) d.content[l].openSource!.items.push({ ...d.content[l].openSource!.items[0] });
    expect(validateSite(d).some((p) => p.path === 'content.openSource.items' && p.message.includes('cli-manager'))).toBe(true);
  });

  it('저장소 주소는 https 만', () => {
    const d = copy();
    for (const l of LOCALES) d.content[l].openSource!.items[0].repo = 'http://github.com/a/b';
    expect(validateSite(d).some((p) => p.path.endsWith('openSource.items.0.repo'))).toBe(true);
  });
});

describe('역할 화면 — 어느 역할에 보이나는 roles 문서가 정한다', () => {
  it('오픈소스는 maker · all, 영상은 design · all', () => {
    const on = (role: 'design' | 'product' | 'ax' | 'maker' | 'all') => roleScreen(STATIC_DOCS, 'ko', role);
    expect(on('maker').openSource.map((r) => r.id)).toEqual(['cli-manager', 'artifact-dock', 'nightgate', 'framenote', 'climanager-session']);
    expect(on('all').openSource).toHaveLength(5);
    expect(on('design').openSource).toEqual([]);
    expect(on('design').videos.map((v) => v.video.id)).toEqual(['climanager-demo', 'fair-update', 'artifact-dock-promo', 'climanager-orchestrator']);
    expect(on('all').videos).toHaveLength(4);
    expect(on('maker').videos).toEqual([]);
    expect(on('product').openSource).toEqual([]);
    expect(on('product').videos).toEqual([]);
  });

  it('roles 문서에서 켜고 끈다', () => {
    const d = patchRole(patchRole(STATIC_DOCS, 'maker', { openSource: false }), 'ax', { videos: true });
    expect(roleScreen(d, 'ko', 'maker').openSource).toEqual([]);
    expect(roleScreen(d, 'ko', 'ax').videos).toHaveLength(4);
  });

  it('영상 카드는 연결 프로젝트 이름·주소를 단다 — 그 프로젝트를 숨기면 연결만 빠진다', () => {
    const demo = roleScreen(STATIC_DOCS, 'en', 'design').videos[0];
    expect(demo).toMatchObject({ projectSlug: 'cli-manager', projectName: 'CLI Manager' });
    const hidden = { ...copy(), hidden: ['cli-manager'] };
    const after = roleScreen(hidden, 'en', 'design').videos[0];
    expect(after.video.id).toBe('climanager-demo');
    expect(after.projectSlug).toBeUndefined();
  });
});

describe('API 로 넣을 때(apply-prod.sh 와 같은 순서)', () => {
  it('옛 문서에 openSource → videos → repo → 역할 순서로 넣으면 매 단계 통과하고 끝은 시드와 같다', () => {
    let d = withoutNewFields();
    const values = <T,>(pick: (l: (typeof LOCALES)[number]) => T) => Object.fromEntries(LOCALES.map((l) => [l, pick(l)]));
    const steps: ((x: SiteDocs) => SiteDocs)[] = [
      (x) => editField(x, { path: 'openSource', values: values((l) => STATIC_DOCS.content[l].openSource) }),
      (x) => editField(x, { path: 'videos', values: values((l) => STATIC_DOCS.content[l].videos) }),
      (x) => editField(x, { path: 'work.projects[cli-manager].repo', values: values(() => 'https://github.com/woorichicken/CLI_manager') }),
      (x) => patchRole(x, 'maker', { openSource: true }),
      (x) => patchRole(x, 'all', { openSource: true, videos: true }),
      (x) => patchRole(x, 'design', { videos: true }),
    ];
    for (const step of steps) {
      d = step(d);
      expect(validateSite(d)).toEqual([]);
    }
    expect(d).toEqual(STATIC_DOCS);
  });

  it('오픈소스를 넣으면 그 언어의 역할 화면이 다시 그려진다', () => {
    const before = withoutNewFields();
    const after = editField(before, { path: 'openSource', values: { ko: STATIC_DOCS.content.ko.openSource, en: STATIC_DOCS.content.en.openSource, es: STATIC_DOCS.content.es.openSource } });
    const paths = affectedPaths(before, after);
    expect(paths).toContain('/as/maker');
    expect(paths).toContain('/en/as/maker');
  });

  it('repo 를 넣으면 그 상세만이 아니라 빌보드(역할 화면)도 다시 그린다', () => {
    const before = withoutNewFields();
    const after = editField(before, { path: 'work.projects[cli-manager].repo', values: { ko: 'https://github.com/woorichicken/CLI_manager', en: 'https://github.com/woorichicken/CLI_manager', es: 'https://github.com/woorichicken/CLI_manager' } });
    const paths = affectedPaths(before, after);
    expect(paths).toContain('/projects/cli-manager');
    expect(paths).toContain('/as/maker');
  });
});
