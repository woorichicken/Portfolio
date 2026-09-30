import type { Locale } from '@/i18n/config';
import ko from './ko';
import en from './en';
import es from './es';
import type { Shot } from './images';
import type { Content, Detail } from './types';

const CONTENT: Record<Locale, Content> = { ko, en, es };

export function getContent(locale: Locale): Content {
  return CONTENT[locale];
}

/** 상세 페이지 하나에 필요한 것. 「그 외」와 「이전」 항목을 같은 모양으로 맞춘다. */
export type WorkEntry = { slug: string; name: string; meta: string; body: string; shot: Shot; detail: Detail };

export function getWorkEntries(locale: Locale): WorkEntry[] {
  const t = getContent(locale);
  return [
    ...t.others.items.map((o) => ({ slug: o.slug, name: o.name, meta: o.period, body: o.body, shot: o.shot, detail: o.detail })),
    ...t.early.items.map((e) => ({ slug: e.slug, name: e.name, meta: e.tag, body: e.body, shot: e.shot, detail: e.detail })),
  ];
}

export function getWorkEntry(locale: Locale, slug: string): WorkEntry | undefined {
  return getWorkEntries(locale).find((w) => w.slug === slug);
}

/** 주소는 언어와 무관하게 같다 — 한국어 목록을 기준으로 만든다 */
export const WORK_SLUGS = getWorkEntries('ko').map((w) => w.slug);
