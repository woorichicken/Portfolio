import type { Shot } from './images';

// 세 언어 파일(ko·en·es)이 같은 모양을 갖도록 묶는 타입.
// 한 언어에서 항목을 빠뜨리면 타입체크에서 바로 드러난다.

export type Fact = { label: string; value: string };
export type Metric = { value: string; label: string };
export type Quote = { text: string; who: string };
export type Link = { label: string; href: string };

export type Improvement = {
  title: string;
  before: string;
  after: string;
  metric?: Metric;
};

export type Project = {
  id: string;
  /** 소속 맥락 — 배지로 보인다(예: 라이트소프트 · 고객사) */
  context: string;
  name: string;
  tagline: string;
  summary: string;
  facts: Fact[];
  cover: Shot;
  improvements?: Improvement[];
  metrics?: Metric[];
  quotes?: Quote[];
  lesson?: { title: string; body: string };
  gallery?: Shot[];
  links?: Link[];
};

export type OtherWork = {
  name: string;
  period: string;
  body: string;
  shot: Shot;
  href?: string;
};

export type EarlyWork = {
  name: string;
  tag: string;
  body: string;
  shot: Shot;
  metrics?: Metric[];
  note?: string;
};

export type Content = {
  meta: { title: string; description: string };
  a11y: { skip: string; primaryNav: string; language: string; openImage: string };
  nav: { work: string; process: string; timeline: string; contact: string };
  hero: {
    name: string;
    role: string;
    lead: string;
    keywords: { title: string; body: string }[];
    links: Link[];
  };
  stats: { title: string; items: Metric[] };
  process: {
    title: string;
    body: string;
    stages: { name: string; who: string }[];
    loopBack: string;
    toolsTitle: string;
    tools: string[];
    note: string;
  };
  work: { title: string; intro: string; labels: { before: string; after: string; lesson: string; results: string }; projects: Project[] };
  others: { title: string; intro: string; items: OtherWork[]; contestsTitle: string; contests: string };
  early: {
    title: string;
    intro: string;
    items: EarlyWork[];
    devhoon: { name: string; tag: string; body: string; history: { date: string; text: string }[]; shots: Shot[] };
  };
  timeline: { title: string; items: { date: string; text: string }[] };
  awards: { title: string; items: { date: string; title: string; org: string; body: string }[] };
  contact: { title: string; body: string; email: string; links: Link[]; closing: string };
  footer: { note: string };
  feedback: { title: string; hint: string; placeholder: string; submit: string; cancel: string; wrong: string };
};
