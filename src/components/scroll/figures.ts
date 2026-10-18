// 홈 스크롤 그림의 설정 — 어느 그림을 쓰고, 섹션 머리마다 어느 부품을 보여 줄지 한 곳에 모은다.
// 그림 파일은 public/figures/<bench|recorder>/figure.html 이다(anatomy 로 그린 단독 HTML, 넘겨주기 계약:
// ?t= 로 정지 · window.setPose(t) 결정적 · 큰 부품마다 <g data-part>). 그림이 바뀌면 이 파일의 부품 이름·t 구간만 맞춘다.
//
// 출처(2026-10-18, task-anatomy-brand-1018 의 사본 · 원본은 brand 저장소):
//   bench    — brand 브랜치 feat/anatomy-bumper-bench-261018 커밋 37c6871 · brand-kit/videos/anatomy-bumper-bench/figure/figure.html
//   recorder — brand 브랜치 feat/anatomy-bumper-recorder-261018 커밋 a3831eb · brand-kit/videos/anatomy-bumper-recorder/figure/figure.html
// t 구간·부품 이름은 각 그림의 README(같은 브랜치) 표를 옮겼다.

export type FigName = 'bench' | 'recorder';
export const FIG_NAMES: FigName[] = ['bench', 'recorder'];
/** 주소에 ?fig= 가 없을 때 — 사용자 결정 2026-10-18 「기본 bench」 */
export const DEFAULT_FIG: FigName = 'bench';

export type FigureSpec = {
  src: string;
  /** 그림 주소에 덧붙이는 것(예: 카드 글자 없이 그림만) */
  query?: string;
  /** 첫 화면을 다 내렸을 때 t — 스크롤 0→끝 이 start→end 로 간다(그림의 「한 번 딱 동작」 인트로 구간) */
  start: number;
  end: number;
  /** 문장 2·3 으로 넘어가는 t — 그림의 동작 단계에 맞춘다 */
  steps: [number, number];
  /** 움직임을 줄인 화면(prefers-reduced-motion)에서 보여 줄 마지막 정지 화면 — 그림 README 가 정한 값 */
  rest: number;
};

export const FIGURES: Record<FigName, FigureSpec> = {
  // 검수대: 0~0.107 대차가 들어와 쿵(직접 돌려 봄) → 0.133~0.267 게이지가 두 번 잰다(한 번 더 확인) → 0.28~0.413 근거 표 → 0.5 다 된 자세
  bench: { src: '/figures/bench/figure.html', start: 0, end: 0.5, steps: [0.12, 0.275], rest: 0.5 },
  // 기록계: 0~0.04 종이가 흐름(운영에 붙임) → 0.04 크게 튐(흔들림 기록) → 0.121 도장 쿵(깨진 곳 표시) → 0.2 종이가 느려진다.
  // 움직임 줄임은 README 대로 t=1(도장 자국이 남은 잔잔한 상태)
  recorder: { src: '/figures/recorder/figure.html', query: 'bare=1', start: 0, end: 0.2, steps: [0.038, 0.118], rest: 1 },
};

export type SectionId = 'work' | 'design' | 'timeline';

/** 섹션 머리의 부품 하나 — 섹션을 지나는 동안 t 가 range 안에서 움직인다. with 는 같이 진하게 둘 작은 부품 */
export type PartSpec = { fig: FigName; part: string; with?: string[]; range: [number, number] };

// 변형마다 중심 그림의 부품을 쓰고, 한 섹션은 다른 그림에서 빌려 섞는다(사용자: 「섹션마다 부품을 적절히 섞어」).
// 프로젝트 = 일을 실어 오는 대차 / 깨진 자리를 찍는 도장 · 디자인 엔지니어로서 = 검증(게이지) · 연표 = 쌓인 기록(감는 드럼).
// 기록지(paper)는 기계 폭을 다 덮는 납작한 부품이라 판에 넣으면 거의 안 커지고 옅어서(2026-10-18 캡처) 쓰지 않았다.
// 크게 움직이는 부품은 range 를 좁게 잡는다 — range 동안 지나간 자리를 다 담도록 확대하므로, 길게 움직이면 부품이 작아진다.
export const SECTION_PARTS: Record<FigName, Record<SectionId, PartSpec>> = {
  bench: {
    // 대차 위 동전(눈만 마크 각인)이 그림의 주인공이라 같이 둔다
    work: { fig: 'bench', part: 'cart', with: ['coin'], range: [0.085, 0.14] },
    design: { fig: 'bench', part: 'gauge', range: [0.133, 0.267] },
    timeline: { fig: 'recorder', part: 'drum', range: [0.2, 0.6] },
  },
  recorder: {
    work: { fig: 'recorder', part: 'stamp', range: [0.1, 0.2] },
    design: { fig: 'bench', part: 'gauge', range: [0.133, 0.267] },
    timeline: { fig: 'recorder', part: 'drum', range: [0.2, 0.6] },
  },
};

/**
 * 그림 주소 — 그림마다 하나로 고정한다. 첫 화면과 섹션 판이 같은 그림을 여러 번 싣는데, ?t= 값이 다르면 주소가 달라
 * 브라우저가 같은 파일(검수대 385KB)을 따로 받는다. ?t=0 은 「멈춰 있으라」는 뜻으로만 쓰고, 실제 자세는 싣고 나서 setPose 로 준다
 * (틀은 자세를 맞추기 전까지 보이지 않는다 — FigureFrame 의 data-ready).
 */
export function figureUrl(fig: FigName): string {
  const { src, query } = FIGURES[fig];
  return `${src}?t=0${query ? `&${query}` : ''}`;
}
