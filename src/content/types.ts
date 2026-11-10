import type { Shot } from './images';

// 세 언어 파일(ko·en·es)이 같은 모양을 갖도록 묶는 타입.
// 한 언어에서 항목을 빠뜨리면 타입체크에서 바로 드러난다.

export type Fact = { label: string; value: string };

/** 결과물 종류. 영상은 공개 권리 확인 전이라 지금은 쓰는 곳이 없다 */
export type ArtifactKind = 'video' | 'tool' | 'system' | 'screen';
export type Metric = { value: string; label: string };
export type Quote = { text: string; who: string };
export type Link = { label: string; href: string };

export type Improvement = {
  title: string;
  before: string;
  after: string;
  metric?: Metric;
  /** 제목 위에 작게 붙는 표시(예: 최신 업데이트 · 날짜) */
  badge?: string;
};

/** 상세 페이지(/work/<slug>)에만 나오는 정보. 홈 카드에는 한 줄 요약만 둔다. */
export type Detail = { facts: Fact[]; paragraphs: string[]; links?: Link[] };

export type Project = {
  id: string;
  /** 소속 맥락 — 배지로 보인다(예: 라이트소프트 · 고객사) */
  context: string;
  name: string;
  tagline: string;
  summary: string;
  facts: Fact[];
  cover: Shot;
  /** 「맡은 일」 — 이 프로젝트에서 제가 맡은 부분을 대략 나눈 줄. 상세의 회차 목록이 된다(바꾼 것은 그 아래 특별편) */
  parts?: { title: string; body: string }[];
  improvements?: Improvement[];
  metrics?: Metric[];
  quotes?: Quote[];
  lesson?: { title: string; body: string };
  gallery?: Shot[];
  links?: Link[];
  /** 코드 저장소 주소(GitHub 등) — 있으면 빌보드·상세 머리에 「코드 보기」 단추. 세 언어가 같아야 한다 */
  repo?: string;
};

export type OtherWork = {
  /** 상세 페이지 주소에 쓰는 이름 — 세 언어가 같아야 한다 */
  slug: string;
  name: string;
  period: string;
  body: string;
  shot: Shot;
  detail: Detail;
  /** 코드 저장소 주소 — 있으면 상세 머리에 「코드 보기」 */
  repo?: string;
};

export type EarlyWork = {
  slug: string;
  name: string;
  tag: string;
  body: string;
  shot: Shot;
  metrics?: Metric[];
  note?: string;
  detail: Detail;
};

/** 공개한 저장소 하나 — 역할 화면의 「오픈소스」 행. 카드에서 저장소로 나간다 */
export type OpenSourceRepo = {
  id: string;
  name: string;
  /** 카드 아래 한 줄 — 저장소 설명을 그 언어로 짧게 */
  body: string;
  /** 저장소 주소 — 세 언어가 같아야 한다 */
  repo: string;
  /** 제품 사이트가 따로 있으면 */
  homepage?: string;
};

/** 직접 만든 영상 하나 — 역할 화면의 「만든 영상」 행. 영상·포스터는 R2(/media/…)에 둔다. 자동재생하지 않는다 */
export type Video = {
  id: string;
  title: string;
  body: string;
  /** mp4·webm — /media/… */
  src: string;
  /** 누르기 전에 보이는 대표 장면(jpg) — 첫 장면이 아니라 영상을 대표하는 장면 */
  poster: string;
  width: number;
  height: number;
  /** 이 영상이 소개하는 프로젝트(큰 프로젝트 id · 그 외 slug) — 있으면 카드에서 상세로 간다 */
  project?: string;
};

export type Content = {
  meta: { title: string; description: string };
  a11y: { skip: string; primaryNav: string; language: string; openImage: string; closeImage: string; prevImage: string; nextImage: string; copied: string };
  nav: { work: string; timeline: string; contact: string };
  hero: {
    name: string;
    role: string;
    lead: string;
    keywords: { title: string; body: string }[];
    links: Link[];
    /** 첫 화면 스크롤 문장 셋 — 그림마다(검수대 bench · 기록계 recorder). 내릴수록 한 문장씩 바뀐다 */
    steps: { bench: string[]; recorder: string[] };
  };
  stats: { title: string; items: Metric[] };
  work: {
    title: string;
    intro: string;
    labels: { before: string; after: string; lesson: string; results: string };
    /** 프로젝트 상세(/projects/<id>)의 장 이름과 이동 문구 */
    caseLabels: { back: string; overview: string; design: string; changes: string; voices: string; screens: string; links: string; prev: string; next: string; toc: string };
    projects: Project[];
  };
  others: { title: string; intro: string; items: OtherWork[]; contestsTitle: string; contests: string };
  early: {
    title: string;
    intro: string;
    items: EarlyWork[];
    devhoon: { name: string; tag: string; body: string; history: { date: string; text: string }[]; shots: Shot[] };
  };
  /** 선택 칸 — 없으면 행이 안 나온다. 어느 역할에 보일지는 roles 문서의 openSource · videos */
  openSource?: { items: OpenSourceRepo[] };
  videos?: { items: Video[] };
  timeline: { title: string; items: { date: string; text: string }[] };
  awards: { title: string; items: { date: string; title: string; org: string; body: string }[] };
  contact: { title: string; body: string; email: string; links: Link[]; closing: string };
  detail: { more: string; back: string };
  footer: { note: string };
  feedback: { title: string; hint: string; placeholder: string; submit: string; cancel: string; wrong: string };
};
