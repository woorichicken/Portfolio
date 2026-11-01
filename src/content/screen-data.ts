import type { Locale } from '@/i18n/config';
import { projectArtifacts, standaloneArtifacts, type Artifact } from './artifacts';
import { getContent } from './index';
import type { Shot } from './images';
import { HIDDEN, ROLES, type RoleId } from './roles';
import type { Project } from './types';

// 역할 화면(/as/<역할>)과 상세의 「비슷한 작품」이 쓰는 목록 계산. 화면 컴포넌트는 이 결과만 그린다.

/** 행에 놓이는 카드 한 장 — 큰 프로젝트 · 그 외 · 이전을 같은 모양으로 맞춘다 */
export type TitleCard = {
  slug: string;
  name: string;
  /** 카드 위 작은 줄 — 소속 맥락이나 기간 */
  kicker: string;
  shot: Shot;
  kind: 'project' | 'other' | 'early';
};

export type ArtifactCard = { artifact: Artifact; projectName?: string; projectSlug?: string };

const visible = (id: string) => !HIDDEN.includes(id);

function projectCard(p: Project): TitleCard {
  return { slug: p.id, name: p.name, kicker: p.context, shot: p.cover, kind: 'project' };
}

export function allTitleCards(locale: Locale): TitleCard[] {
  const t = getContent(locale);
  return [
    ...t.work.projects.map(projectCard),
    ...t.others.items.map((o) => ({ slug: o.slug, name: o.name, kicker: o.period, shot: o.shot, kind: 'other' as const })),
    ...t.early.items.map((e) => ({ slug: e.slug, name: e.name, kicker: e.tag, shot: e.shot, kind: 'early' as const })),
  ].filter((c) => visible(c.slug));
}

function pick(cards: TitleCard[], order: string[]): TitleCard[] {
  return order.map((id) => cards.find((c) => c.slug === id)).filter((c): c is TitleCard => Boolean(c) && visible(c!.slug));
}

export type RoleScreen = {
  featured: Project;
  projects: TitleCard[];
  others: TitleCard[];
  early: TitleCard[];
  artifacts: ArtifactCard[];
};

export function roleScreen(locale: Locale, role: RoleId): RoleScreen {
  const t = getContent(locale);
  const def = ROLES[role];
  const cards = allTitleCards(locale);
  const projects = pick(cards, def.projects);
  // 대표작이 숨겨졌으면 그 역할의 첫 프로젝트를 올린다
  const featuredId = visible(def.featured) ? def.featured : projects[0]?.slug;
  const featured = t.work.projects.find((p) => p.id === featuredId) ?? t.work.projects[0];
  const others = pick(cards, def.others);
  // 행에는 프로젝트마다 한 장만 — 같은 이름(PorterX · KITS)이 한 줄에 두 번 나오지 않게(3회차 리뷰 D3).
  // 자료가 있는 첫 장을 고르고, 나머지는 상세의 「화면」 탭과 결과물 화면(/design)에 그대로 있다.
  // 「그 외」 행에 이미 같은 그림이 있으면(디자인 아틀라스) 결과물 행에서는 뺀다 — 한 화면에 같은 그림 두 장을 두지 않는다.
  const shownElsewhere = new Set(others.map((c) => c.shot.src));
  const firstShown = (list: Artifact[]) => list.find((a) => !('example' in a)) ?? list[0];
  const artifacts: ArtifactCard[] = [
    ...(def.standaloneArtifacts
      ? standaloneArtifacts(locale).filter((a) => !('shot' in a && shownElsewhere.has(a.shot.src))).map((artifact) => ({ artifact }))
      : []),
    ...projects.flatMap((p) => {
      const pick1 = firstShown(projectArtifacts(p.slug, locale));
      return pick1 ? [{ artifact: pick1, projectName: p.name, projectSlug: p.slug }] : [];
    }),
  ];
  return {
    featured,
    projects,
    others,
    early: def.early ? cards.filter((c) => c.kind === 'early') : [],
    artifacts,
  };
}

/**
 * 「비슷한 작품」 — 이 항목을 가장 앞에 두는 역할의 목록에서 이웃을 고른다.
 * 그 역할에서 같은 종류(큰 프로젝트끼리, 그 외끼리)를 먼저, 모자라면 다른 종류로 채운다.
 */
export function similarTitles(locale: Locale, slug: string, limit = 6): TitleCard[] {
  const cards = allTitleCards(locale);
  const self = cards.find((c) => c.slug === slug);
  if (!self) return [];
  const roleOrder = (Object.keys(ROLES) as RoleId[])
    .filter((r) => r !== 'all')
    .map((r) => ({ r, list: [...ROLES[r].projects, ...ROLES[r].others] }))
    .filter(({ list }) => list.includes(slug))
    .sort((a, b) => a.list.indexOf(slug) - b.list.indexOf(slug));
  const order = roleOrder.flatMap(({ list }) => list);
  const ranked = [...new Set([...order, ...cards.map((c) => c.slug)])]
    .filter((id) => id !== slug)
    .map((id) => cards.find((c) => c.slug === id))
    .filter((c): c is TitleCard => Boolean(c));
  const sameKind = ranked.filter((c) => (self.kind === 'project') === (c.kind === 'project'));
  const rest = ranked.filter((c) => !sameKind.includes(c));
  return [...sameKind, ...rest].slice(0, limit);
}

/** 이 항목이 어떤 역할에 들어 있는지 — 상세 머리의 「이 역할에서」 표시와 어드민이 쓴다 */
export function rolesOf(slug: string): RoleId[] {
  return (Object.keys(ROLES) as RoleId[]).filter((r) => r !== 'all' && (ROLES[r].projects.includes(slug) || ROLES[r].others.includes(slug) || ROLES[r].featured === slug));
}
