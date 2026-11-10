import type { Locale } from '@/i18n/config';

// 어드민 편집기가 그릴 칸 목록 — 종류(큰 프로젝트 · 그 외 · 이전 · 오픈소스 · 영상)마다.
// 칸 이름은 src/content/types.ts 가 정본이다. 여기서 빠진 칸은 편집기에 안 나올 뿐 지워지지 않는다(저장은 항목을 통째로 보내므로 그대로 실려 간다).
//
//   text   — 글자. same 이면 세 언어 같은 값(입력 하나), 아니면 ko·en·es 나란히. long 이면 여러 줄. optional 이면 비우면 칸을 지운다
//   number — 숫자(늘 세 언어 같음)
//   shot   — 사진 { src·width·height(세 언어 같음) · alt·caption(언어마다) } + 파일 올리기
//   list   — 목록. 줄 추가·빼기·순서는 세 언어 같이. item 이 'text' 면 글자 목록(상세 문단), 'shot' 이면 사진 목록(갤러리)
//   group  — 묶음(배운 점 · 지표). optional 이면 켜고 끄기

export type Spec =
  | { t: 'text'; key: string; label: string; long?: boolean; same?: boolean; optional?: boolean; hint?: string; readOnly?: boolean }
  | { t: 'number'; key: string; label: string }
  | { t: 'shot'; key: string; label: string }
  | { t: 'list'; key: string; label: string; item: Spec[] | 'text' | 'shot'; optional?: boolean; long?: boolean; blank?: (l: Locale) => unknown; rowLabel?: string }
  | { t: 'group'; key: string; label: string; fields: Spec[]; optional?: boolean; blank?: (l: Locale) => unknown };

const BOLD_HINT = '**굵게** 는 그대로 씁니다';
const REPO_HINT = 'https:// 로 시작 · 세 언어 같은 주소 · 비우면 「GitHub 보러가기」가 빠집니다';

const facts: Spec = { t: 'list', key: 'facts', label: '사실(라벨 · 값)', rowLabel: '사실', item: [{ t: 'text', key: 'label', label: '라벨' }, { t: 'text', key: 'value', label: '값' }], blank: () => ({ label: '', value: '' }) };
const metrics: Spec = { t: 'list', key: 'metrics', label: '지표', rowLabel: '지표', optional: true, item: [{ t: 'text', key: 'value', label: '값' }, { t: 'text', key: 'label', label: '설명' }], blank: () => ({ value: '', label: '' }) };
const links: Spec = { t: 'list', key: 'links', label: '링크', rowLabel: '링크', optional: true, item: [{ t: 'text', key: 'label', label: '글' }, { t: 'text', key: 'href', label: '주소', hint: 'https:// · mailto: · / 로 시작' }], blank: () => ({ label: '', href: 'https://' }) };
const detail: Spec = {
  t: 'group',
  key: 'detail',
  label: '상세 페이지',
  fields: [facts, { t: 'list', key: 'paragraphs', label: '상세 문단', rowLabel: '문단', item: 'text', long: true, blank: () => '' }, links],
};

export const PROJECT_SPEC: Spec[] = [
  { t: 'text', key: 'id', label: 'id(주소)', same: true, readOnly: true },
  { t: 'text', key: 'name', label: '이름' },
  { t: 'text', key: 'context', label: '맥락(배지)' },
  { t: 'text', key: 'tagline', label: '한 줄(빌보드)', long: true, hint: BOLD_HINT },
  { t: 'text', key: 'summary', label: '요약(상세 머리)', long: true, hint: BOLD_HINT },
  { t: 'text', key: 'repo', label: 'GitHub 보러가기(repo)', same: true, optional: true, hint: REPO_HINT },
  facts,
  { t: 'shot', key: 'cover', label: '표지 사진' },
  { t: 'list', key: 'parts', label: '맡은 일', rowLabel: '맡은 일', optional: true, item: [{ t: 'text', key: 'title', label: '제목' }, { t: 'text', key: 'body', label: '내용', long: true, hint: BOLD_HINT }], blank: () => ({ title: '', body: '' }) },
  {
    t: 'list',
    key: 'improvements',
    label: '바꾼 것',
    rowLabel: '바꾼 것',
    optional: true,
    item: [
      { t: 'text', key: 'badge', label: '배지(선택)', optional: true, hint: '세 언어 모두 채우거나 모두 비웁니다' },
      { t: 'text', key: 'title', label: '제목' },
      { t: 'text', key: 'before', label: '전', long: true },
      { t: 'text', key: 'after', label: '후', long: true, hint: BOLD_HINT },
      { t: 'group', key: 'metric', label: '지표', optional: true, fields: [{ t: 'text', key: 'value', label: '값' }, { t: 'text', key: 'label', label: '설명' }], blank: () => ({ value: '', label: '' }) },
    ],
    blank: () => ({ title: '', before: '', after: '' }),
  },
  metrics,
  { t: 'group', key: 'lesson', label: '배운 점', optional: true, fields: [{ t: 'text', key: 'title', label: '제목' }, { t: 'text', key: 'body', label: '내용', long: true, hint: BOLD_HINT }], blank: () => ({ title: '', body: '' }) },
  { t: 'list', key: 'quotes', label: '인용', rowLabel: '인용', optional: true, item: [{ t: 'text', key: 'text', label: '말', long: true }, { t: 'text', key: 'who', label: '누구' }], blank: () => ({ text: '', who: '' }) },
  { t: 'list', key: 'gallery', label: '갤러리 사진', rowLabel: '사진', optional: true, item: 'shot' },
  links,
];

export const OTHER_SPEC: Spec[] = [
  { t: 'text', key: 'slug', label: 'slug(주소)', same: true, readOnly: true },
  { t: 'text', key: 'name', label: '이름' },
  { t: 'text', key: 'period', label: '기간' },
  { t: 'text', key: 'body', label: '한 줄(카드 아래)', long: true, hint: BOLD_HINT },
  { t: 'text', key: 'repo', label: 'GitHub 보러가기(repo)', same: true, optional: true, hint: REPO_HINT },
  { t: 'shot', key: 'shot', label: '사진' },
  detail,
];

export const EARLY_SPEC: Spec[] = [
  { t: 'text', key: 'slug', label: 'slug(주소)', same: true, readOnly: true },
  { t: 'text', key: 'name', label: '이름' },
  { t: 'text', key: 'tag', label: '태그' },
  { t: 'text', key: 'body', label: '한 줄', long: true },
  { t: 'shot', key: 'shot', label: '사진' },
  metrics,
  { t: 'text', key: 'note', label: '덧붙임(선택)', long: true, optional: true },
  detail,
];

export const OSS_ITEM_SPEC: Spec[] = [
  { t: 'text', key: 'id', label: 'id', same: true, hint: '영문 소문자로 시작 · 소문자·숫자·하이픈' },
  { t: 'text', key: 'name', label: '이름' },
  { t: 'text', key: 'body', label: '설명', long: true },
  { t: 'text', key: 'repo', label: '저장소 주소', same: true, hint: 'https://github.com/…' },
  { t: 'text', key: 'homepage', label: '사이트(선택)', same: true, optional: true, hint: 'https:// · 비우면 「사이트」 링크가 빠집니다' },
];

export const VIDEO_ITEM_SPEC: Spec[] = [
  { t: 'text', key: 'id', label: 'id', same: true, hint: '영문 소문자로 시작 · 소문자·숫자·하이픈' },
  { t: 'text', key: 'title', label: '제목' },
  { t: 'text', key: 'body', label: '설명', long: true },
];

export const SPEC_BY_KIND = { project: PROJECT_SPEC, other: OTHER_SPEC, early: EARLY_SPEC } as const;

/** 「그 외」 새 항목의 빈 틀 — 사진은 올리기 전까지 자리 사진(디자인 아틀라스)을 쓴다. 저장 전에 바꾼다 */
export function blankOther(slug: string) {
  return { slug, name: '', period: String(new Date().getFullYear()), body: '', shot: { src: '/work/design_atlas.jpg', width: 1400, height: 875, alt: '' }, detail: { facts: [] as { label: string; value: string }[], paragraphs: [''] } };
}
