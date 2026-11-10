import type { Locale } from '@/i18n/config';
import type { Shot } from './images';
import type { SiteDocs } from './schema';
import type { Content, Detail, Project } from './types';

// 본문 읽기 도우미. 본문은 D1 에서 읽은 문서 묶음(SiteDocs — store.ts 의 getSite())을 받는다.
// 예전에는 ko·en·es.ts 를 바로 import 했다. 지금 그 파일들은 시드와 D1 없는 빌드(Vercel)에서만 쓴다(static-site.ts).

export function getContent(docs: SiteDocs, locale: Locale): Content {
  return docs.content[locale];
}

/** 상세 페이지 하나에 필요한 것. 「그 외」와 「이전」 항목을 같은 모양으로 맞춘다. */
export type WorkEntry = { slug: string; name: string; meta: string; body: string; shot: Shot; detail: Detail; repo?: string };

export function getWorkEntries(docs: SiteDocs, locale: Locale): WorkEntry[] {
  const t = getContent(docs, locale);
  return [
    ...t.others.items.map((o) => ({ slug: o.slug, name: o.name, meta: o.period, body: o.body, shot: o.shot, detail: o.detail, repo: o.repo })),
    ...t.early.items.map((e) => ({ slug: e.slug, name: e.name, meta: e.tag, body: e.body, shot: e.shot, detail: e.detail })),
  ];
}

export function getWorkEntry(docs: SiteDocs, locale: Locale, slug: string): WorkEntry | undefined {
  return getWorkEntries(docs, locale).find((w) => w.slug === slug);
}

/** 「그 외」·「이전」 주소. 언어와 무관하게 같다 — 한국어 목록을 기준으로 만든다 */
export function workSlugs(docs: SiteDocs): string[] {
  return getWorkEntries(docs, 'ko').map((w) => w.slug);
}

/** 큰 프로젝트 주소. 「그 외」·「이전」 slug 와 겹치지 않는다(schema.ts referenceProblems 가 막는다) */
export function projectIds(docs: SiteDocs): string[] {
  return getContent(docs, 'ko').work.projects.map((p) => p.id);
}

export function getProject(docs: SiteDocs, locale: Locale, id: string): Project | undefined {
  return getContent(docs, locale).work.projects.find((p) => p.id === id);
}
