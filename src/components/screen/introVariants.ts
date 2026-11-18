// 첫 화면 인트로 영상의 가로판·세로판 — IntroSting(화면)과 e2e/intro.spec.ts(날아가기 위치 검사)가 같이 읽는다.
// 좌표는 전부 탐구 세션(6c00b625)이 Remotion 소스에서 계산해 알려 준 값이다(알파 경계와 일치, 2026-11-18).
// 세로판은 잘라 쓴 게 아니라 1080×1920 에 다시 배치해 렌더한 것이다 — 휴대폰에서 가로판은 SOLHUN 글자가 155px 밖에 안 됐다.

export type IntroVariant = {
  /** 영상 프레임 크기 */
  frame: { width: number; height: number };
  /** H.264 가 없는 브라우저(일부 리눅스 Firefox·오픈소스 Chromium)는 WebM(VP9·Opus)을 쓴다 */
  mp4: string;
  webm: string;
  /** 마지막 장면 정지 그림 — 움직임 줄이기에서 영상 대신, 그리고 끝에서 로고 자리로 날아가는 그림 */
  endSrc: string;
  /** 그 그림이 마지막 프레임에서 놓인 왼쪽 위 · 크기 */
  endBox: { x: number; y: number; width: number; height: number };
  /** 그림 안에서 나무늘보 원의 가운데 · 지름 — 날아가서 로고 자리에 맞출 기준 */
  circle: { cx: number; cy: number; d: number };
};

export const INTRO_VARIANTS: { landscape: IntroVariant; portrait: IntroVariant } = {
  landscape: {
    frame: { width: 1920, height: 1080 },
    mp4: '/intro/solhun-sting-v7.mp4',
    webm: '/intro/solhun-sting-v7.webm',
    endSrc: '/intro/solhun-sting-v7-end.webp',
    endBox: { x: 727, y: 351, width: 466, height: 492 },
    circle: { cx: 233, cy: 259, d: 465 },
  },
  portrait: {
    frame: { width: 1080, height: 1920 },
    mp4: '/intro/solhun-sting-v7-portrait.mp4',
    webm: '/intro/solhun-sting-v7-portrait.webm',
    endSrc: '/intro/solhun-sting-v7-portrait-end.webp',
    endBox: { x: 276, y: 747, width: 528, height: 556 },
    circle: { cx: 264, cy: 292, d: 528 },
  },
};

/** 세로로 긴 화면(높이 ≥ 폭)이면 세로판 — 휴대폰 세로·태블릿 세로·정사각 창 */
export const INTRO_PORTRAIT_QUERY = '(orientation: portrait)';
