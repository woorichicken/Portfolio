// 홈 스크롤 그림의 설정 — 어느 그림을 쓰고, 섹션 머리마다 어느 부품을 보여 줄지 한 곳에 모은다.
// 그림 파일은 public/figures/<bench|recorder>/figure.html 이다(anatomy 로 그린 단독 HTML, 넘겨주기 계약:
// ?t= 로 정지 · window.setPose(t) 결정적 · 큰 부품마다 <g data-part>). 그림이 바뀌면 이 파일의 부품 이름·t 구간만 맞춘다.

export type FigName = 'bench' | 'recorder';
export const FIG_NAMES: FigName[] = ['bench', 'recorder'];
/** 주소에 ?fig= 가 없을 때 — 사용자 결정 2026-10-18 「기본 bench」 */
export const DEFAULT_FIG: FigName = 'bench';

export type FigureSpec = {
  src: string;
  /** 첫 화면을 다 내렸을 때 t — 스크롤 0→끝 이 start→end 로 간다(한 바퀴) */
  start: number;
  end: number;
  /** 움직임을 줄인 화면(prefers-reduced-motion)에서 보여 줄 마지막 정지 화면 */
  rest: number;
};

export const FIGURES: Record<FigName, FigureSpec> = {
  bench: { src: '/figures/bench/figure.html', start: 0, end: 1, rest: 1 },
  recorder: { src: '/figures/recorder/figure.html', start: 0, end: 1, rest: 1 },
};

export type SectionId = 'work' | 'design' | 'timeline';

/** 섹션 머리의 부품 하나 — 섹션을 지나는 동안 t 가 range 안에서 움직인다 */
export type PartSpec = { fig: FigName; part: string; range: [number, number] };

// 변형마다 중심 그림을 바꾸되, 섹션 부품은 두 그림에서 섞는다(사용자: 「섹션마다 부품을 적절히 섞어」).
// 프로젝트 = 일을 싣고 오는 것(대차·종이) · 디자인 엔지니어로서 = 검증(게이지) · 연표 = 기록(기록계 종이·도장)
export const SECTION_PARTS: Record<FigName, Record<SectionId, PartSpec>> = {
  bench: {
    work: { fig: 'bench', part: 'cart', range: [0.05, 0.34] },
    design: { fig: 'bench', part: 'gauge', range: [0.3, 0.64] },
    timeline: { fig: 'recorder', part: 'drum', range: [0.55, 1] },
  },
  recorder: {
    work: { fig: 'recorder', part: 'drum', range: [0.2, 0.6] },
    design: { fig: 'bench', part: 'gauge', range: [0.3, 0.64] },
    timeline: { fig: 'recorder', part: 'stamp', range: [0.7, 0.95] },
  },
};

export function figureUrl(fig: FigName, t: number): string {
  return `${FIGURES[fig].src}?t=${t.toFixed(3)}`;
}
