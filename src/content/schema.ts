import { z } from 'zod';
import { LOCALES, type Locale } from '@/i18n/config';
import type { Shot } from './images';
import { ROLE_IDS, type RoleDef, type RoleId } from './roles';
import { SLUG_MESSAGE, SLUG_RE } from './slug';
import type { Content } from './types';

// types.ts 의 모양을 그대로 옮긴 zod 스키마. D1 에 쓰기 전에 매번 이걸로 검사한다.
// 예전에는 세 언어 파일이 같은 타입이라 타입체크가 빠진 칸을 잡았다 — D1 로 옮기면 타입체크가 못 보므로 이 검사가 그 일을 대신한다.
// 스키마와 types.ts 가 어긋나면 아래 `_SchemaMatchesTypes` 가 타입체크에서 깨진다(둘을 같이 고친다).

// strictObject: 모르는 칸이 들어오면 거절한다 — 오타 난 칸 이름이 조용히 무시되지 않게
const text = z.string();

export const ShotSchema = z.strictObject({
  src: z.string().regex(/^\/(work|media)\//, '사진 경로는 /work/… 또는 /media/… 여야 합니다'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: text,
  caption: text.optional(),
  modalCaption: text.optional(),
});

const FactSchema = z.strictObject({ label: text, value: text });
const MetricSchema = z.strictObject({ value: text, label: text });
const QuoteSchema = z.strictObject({ text, who: text });
const LinkSchema = z.strictObject({ label: text, href: z.string().regex(/^(https?:\/\/|mailto:|\/)/, '링크는 https://, mailto: 또는 / 로 시작합니다') });

/** 바깥 주소(저장소 · 제품 사이트) — https 만 */
const HttpsUrlSchema = z.string().regex(/^https:\/\/[^\s]+$/, '주소는 https:// 로 시작합니다');

const ImprovementSchema = z.strictObject({
  title: text,
  before: text,
  after: text,
  metric: MetricSchema.optional(),
  badge: text.optional(),
});

const DetailSchema = z.strictObject({ facts: z.array(FactSchema), paragraphs: z.array(text), links: z.array(LinkSchema).optional() });

/** 주소에 들어가는 이름 — 소문자·숫자·하이픈 */
export const SlugSchema = z.string().regex(SLUG_RE, SLUG_MESSAGE);

export const ProjectSchema = z.strictObject({
  id: SlugSchema,
  context: text,
  name: text,
  tagline: text,
  summary: text,
  facts: z.array(FactSchema),
  cover: ShotSchema,
  parts: z.array(z.strictObject({ title: text, body: text })).optional(),
  improvements: z.array(ImprovementSchema).optional(),
  metrics: z.array(MetricSchema).optional(),
  quotes: z.array(QuoteSchema).optional(),
  lesson: z.strictObject({ title: text, body: text }).optional(),
  gallery: z.array(ShotSchema).optional(),
  links: z.array(LinkSchema).optional(),
  repo: HttpsUrlSchema.optional(),
});

export const OtherWorkSchema = z.strictObject({ slug: SlugSchema, name: text, period: text, body: text, shot: ShotSchema, detail: DetailSchema, repo: HttpsUrlSchema.optional() });

export const OpenSourceRepoSchema = z.strictObject({ id: SlugSchema, name: text, body: text, repo: HttpsUrlSchema, homepage: HttpsUrlSchema.optional() });

export const VideoSchema = z.strictObject({
  id: SlugSchema,
  title: text,
  body: text,
  // 영상은 R2 에만 둔다 — 저장소(public/)에 넣으면 배포 묶음이 커진다
  src: z.string().regex(/^\/media\/[^\s]+\.(mp4|webm)$/, '영상 경로는 /media/….mp4 또는 .webm 입니다(pnpm content media 로 올린 주소)'),
  poster: z.string().regex(/^\/(work|media)\/[^\s]+\.(jpg|jpeg|png|webp)$/, '포스터는 /work/… 또는 /media/… 사진입니다'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  project: SlugSchema.optional(),
});

export const EarlyWorkSchema = z.strictObject({
  slug: SlugSchema,
  name: text,
  tag: text,
  body: text,
  shot: ShotSchema,
  metrics: z.array(MetricSchema).optional(),
  note: text.optional(),
  detail: DetailSchema,
});

export const ContentSchema = z.strictObject({
  meta: z.strictObject({ title: text, description: text }),
  a11y: z.strictObject({ skip: text, primaryNav: text, language: text, openImage: text, closeImage: text, prevImage: text, nextImage: text, copied: text }),
  nav: z.strictObject({ work: text, timeline: text, contact: text }),
  hero: z.strictObject({
    name: text,
    role: text,
    lead: text,
    keywords: z.array(z.strictObject({ title: text, body: text })),
    links: z.array(LinkSchema),
    steps: z.strictObject({ bench: z.array(text), recorder: z.array(text) }),
  }),
  stats: z.strictObject({ title: text, items: z.array(MetricSchema) }),
  work: z.strictObject({
    title: text,
    intro: text,
    labels: z.strictObject({ before: text, after: text, lesson: text, results: text }),
    caseLabels: z.strictObject({ back: text, overview: text, design: text, changes: text, voices: text, screens: text, links: text, prev: text, next: text, toc: text }),
    projects: z.array(ProjectSchema),
  }),
  others: z.strictObject({ title: text, intro: text, items: z.array(OtherWorkSchema), contestsTitle: text, contests: text }),
  early: z.strictObject({
    title: text,
    intro: text,
    items: z.array(EarlyWorkSchema),
    devhoon: z.strictObject({
      name: text,
      tag: text,
      body: text,
      history: z.array(z.strictObject({ date: text, text })),
      shots: z.array(ShotSchema),
    }),
  }),
  openSource: z.strictObject({ items: z.array(OpenSourceRepoSchema) }).optional(),
  videos: z.strictObject({ items: z.array(VideoSchema) }).optional(),
  timeline: z.strictObject({ title: text, items: z.array(z.strictObject({ date: text, text })) }),
  awards: z.strictObject({ title: text, items: z.array(z.strictObject({ date: text, title: text, org: text, body: text })) }),
  contact: z.strictObject({ title: text, body: text, email: z.string().email(), links: z.array(LinkSchema), closing: text }),
  detail: z.strictObject({ more: text, back: text }),
  footer: z.strictObject({ note: text }),
  feedback: z.strictObject({ title: text, hint: text, placeholder: text, submit: text, cancel: text, wrong: text }),
});

const LocalizedSchema = z.strictObject({ ko: text, en: text, es: text });

export const RoleDefSchema = z.strictObject({
  name: LocalizedSchema,
  blurb: LocalizedSchema,
  rowTitle: LocalizedSchema,
  featured: SlugSchema,
  projects: z.array(SlugSchema),
  others: z.array(SlugSchema),
  early: z.boolean(),
  standaloneArtifacts: z.boolean(),
  openSource: z.boolean().optional(),
  videos: z.boolean().optional(),
});

export const RolesSchema = z.strictObject(Object.fromEntries(ROLE_IDS.map((r) => [r, RoleDefSchema])) as Record<RoleId, typeof RoleDefSchema>);
export const HiddenSchema = z.array(SlugSchema);

// ── 스키마 ↔ types.ts 가 같은지 컴파일 때 확인 ───────────────────────────────
// 서로 대입 가능한지가 아니라 「같은 타입」인지 본다 — 선택 칸 이름이 하나 틀려도 잡힌다
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
export type _SchemaMatchesTypes = [
  Assert<Equals<z.infer<typeof ContentSchema>, Content>>,
  Assert<Equals<z.infer<typeof ShotSchema>, Shot>>,
  Assert<Equals<z.infer<typeof RoleDefSchema>, RoleDef>>,
];

// ── 사이트 전체(D1 문서 다섯 개)를 한 번에 검사 ────────────────────────────────

export type Roles = Record<RoleId, RoleDef>;
export type SiteDocs = { content: Record<Locale, Content>; roles: Roles; hidden: string[] };

export type Problem = { path: string; message: string };

/**
 * 세 언어가 같은 칸을 가졌는지 — 글자는 달라도 되고, 모양(칸 이름·목록 길이·항목 id·사진 파일·숫자)은 같아야 한다.
 * 목록 항목은 id/slug 가 같은 순서로 있어야 하고, 선택 칸(metric·badge 등)은 세 언어 모두 있거나 모두 없어야 한다.
 */
export function shapeProblems(content: Record<Locale, Content>): Problem[] {
  const [base, ...rest] = LOCALES;
  const problems: Problem[] = [];
  for (const other of rest) compareShape(content[base], content[other], '', base, other, problems);
  return problems;
}

/** 언어마다 같아야 하는 글자 칸 — 주소·사진·영상 파일·저장소 */
const SAME_ACROSS_LOCALES = new Set(['id', 'slug', 'src', 'width', 'height', 'repo', 'homepage', 'poster', 'project']);

function compareShape(a: unknown, b: unknown, path: string, la: Locale, lb: Locale, out: Problem[]) {
  const where = path || '(전체)';
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return void out.push({ path: where, message: `${la} 와 ${lb} 중 한쪽만 목록입니다` });
    if (a.length !== b.length) return void out.push({ path: where, message: `목록 길이가 다릅니다 — ${la} ${a.length}개 · ${lb} ${b.length}개` });
    // 항목에 id/slug 가 있으면 번호 대신 그걸로 적는다 — API 경로(work.projects[kits].…)와 같은 모양이라 그대로 고치러 갈 수 있다
    a.forEach((item, i) => {
      const id = item && typeof item === 'object' ? ((item as { id?: string }).id ?? (item as { slug?: string }).slug) : undefined;
      compareShape(item, b[i], `${path}[${id ?? i}]`, la, lb, out);
    });
    return;
  }
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    for (const k of ka) if (!kb.includes(k)) out.push({ path: `${path}.${k}`.replace(/^\./, ''), message: `${la} 에만 있는 칸입니다 — ${lb} 에도 넣어 주세요` });
    for (const k of kb) if (!ka.includes(k)) out.push({ path: `${path}.${k}`.replace(/^\./, ''), message: `${lb} 에만 있는 칸입니다 — ${la} 에도 넣어 주세요` });
    for (const k of ka) {
      if (!kb.includes(k)) continue;
      const va = (a as Record<string, unknown>)[k];
      const vb = (b as Record<string, unknown>)[k];
      const sub = `${path}.${k}`.replace(/^\./, '');
      if (SAME_ACROSS_LOCALES.has(k) && va !== vb) out.push({ path: sub, message: `언어마다 같아야 합니다 — ${la} "${String(va)}" · ${lb} "${String(vb)}"` });
      else compareShape(va, vb, sub, la, lb, out);
    }
    return;
  }
  if (typeof a !== typeof b) out.push({ path: where, message: `${la} 와 ${lb} 의 값 종류가 다릅니다` });
}

/** id 가 겹치지 않는지, 역할·숨김이 있는 항목만 가리키는지 */
export function referenceProblems(docs: SiteDocs): Problem[] {
  const problems: Problem[] = [];
  const ko = docs.content.ko;
  const projectIds = ko.work.projects.map((p) => p.id);
  const otherSlugs = [...ko.others.items.map((o) => o.slug), ...ko.early.items.map((e) => e.slug)];
  const all = [...projectIds, ...otherSlugs];
  const seen = new Set<string>();
  for (const id of all) {
    if (seen.has(id)) problems.push({ path: 'content', message: `id "${id}" 가 두 번 나옵니다 — 큰 프로젝트·그 외·이전을 통틀어 하나여야 주소가 겹치지 않습니다` });
    seen.add(id);
  }
  for (const [role, def] of Object.entries(docs.roles)) {
    if (!projectIds.includes(def.featured)) problems.push({ path: `roles.${role}.featured`, message: `대표작 "${def.featured}" 는 큰 프로젝트 id 가 아닙니다` });
    def.projects.forEach((id, i) => {
      if (!projectIds.includes(id)) problems.push({ path: `roles.${role}.projects[${i}]`, message: `"${id}" 는 큰 프로젝트 id 가 아닙니다` });
    });
    def.others.forEach((id, i) => {
      if (!otherSlugs.includes(id)) problems.push({ path: `roles.${role}.others[${i}]`, message: `"${id}" 는 「그 외」·「이전」 slug 가 아닙니다` });
    });
    for (const list of ['projects', 'others'] as const) {
      const dup = def[list].filter((id, i) => def[list].indexOf(id) !== i);
      if (dup.length) problems.push({ path: `roles.${role}.${list}`, message: `같은 항목이 두 번 있습니다: ${dup.join(', ')}` });
    }
  }
  // 오픈소스·영상 — 목록 안에서 id 가 하나씩, 영상의 project 는 있는 항목을 가리킨다
  for (const [list, items] of [['openSource', ko.openSource?.items ?? []], ['videos', ko.videos?.items ?? []]] as const) {
    const ids = items.map((x) => x.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dup.length) problems.push({ path: `content.${list}.items`, message: `id 가 두 번 나옵니다: ${dup.join(', ')}` });
  }
  (ko.videos?.items ?? []).forEach((v) => {
    if (v.project && !all.includes(v.project)) problems.push({ path: `content.videos.items[${v.id}].project`, message: `"${v.project}" 는 없는 항목입니다 — 큰 프로젝트 id 나 그 외 slug` });
  });
  docs.hidden.forEach((id, i) => {
    if (!all.includes(id)) problems.push({ path: `hidden[${i}]`, message: `"${id}" 는 없는 항목입니다` });
  });
  return problems;
}

function zodProblems(prefix: string, error: z.ZodError): Problem[] {
  return error.issues.map((issue) => ({ path: [prefix, ...issue.path.map(String)].join('.'), message: issue.message }));
}

/** 쓰기 직전에 부른다 — 문제가 하나라도 있으면 D1 에 쓰지 않는다 */
export function validateSite(docs: SiteDocs): Problem[] {
  const problems: Problem[] = [];
  for (const locale of LOCALES) {
    const r = ContentSchema.safeParse(docs.content[locale]);
    if (!r.success) problems.push(...zodProblems(`content.${locale}`, r.error));
  }
  const roles = RolesSchema.safeParse(docs.roles);
  if (!roles.success) problems.push(...zodProblems('roles', roles.error));
  const hidden = HiddenSchema.safeParse(docs.hidden);
  if (!hidden.success) problems.push(...zodProblems('hidden', hidden.error));
  // 모양이 틀린 문서로 아래 비교를 돌리면 엉뚱한 오류가 쏟아진다 — 스키마부터 맞춘다
  if (problems.length) return problems;
  return [...shapeProblems(docs.content), ...referenceProblems(docs)];
}
