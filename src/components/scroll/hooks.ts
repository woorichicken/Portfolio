'use client';

import { useSyncExternalStore } from 'react';
import { DEFAULT_FIG, FIG_NAMES, type FigName } from './figures';

// 홈은 정적으로 미리 그려 두는 페이지라 서버는 ?fig= 를 모른다. 서버는 기본 그림으로 그리고,
// 브라우저에서 주소를 읽어 바꾼다(useSyncExternalStore 가 하이드레이션 뒤에 한 번 더 그린다).
function readFig(): FigName {
  const q = new URLSearchParams(window.location.search).get('fig');
  return FIG_NAMES.includes(q as FigName) ? (q as FigName) : DEFAULT_FIG;
}
function onPopState(cb: () => void) {
  window.addEventListener('popstate', cb);
  return () => window.removeEventListener('popstate', cb);
}
export function useFigVariant(): FigName {
  return useSyncExternalStore(onPopState, readFig, () => DEFAULT_FIG);
}

const REDUCE = '(prefers-reduced-motion: reduce)';
function onMotionChange(cb: () => void) {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
/** 움직임을 줄여 달라고 한 화면이면 true — 스크롤에 묶인 움직임을 끄고 마지막 정지 화면을 보여 준다 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(onMotionChange, () => window.matchMedia(REDUCE).matches, () => false);
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
