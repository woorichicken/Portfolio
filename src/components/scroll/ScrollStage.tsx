'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import FigureFrame, { type FigureApi } from './FigureFrame';
import { FIGURES, type FigName } from './figures';
import { clamp01, lerp, useFigVariant, useReducedMotion } from './hooks';

// 홈 첫 화면 — 화면에 붙어 있는(sticky) 무대에서, 내리는 만큼 그림이 한 바퀴 돌고 짧은 문장 셋이 단계마다 바뀐다.
// 스크롤 0→무대 끝 을 그림의 t(start→end)로 옮겨 setPose 에 넘긴다. 영상은 프레임→t, 웹은 스크롤→t 로 같은 함수를 쓴다.
// 움직임을 줄인 화면에서는 무대를 붙이지 않고 마지막 정지 화면(rest)과 문장 셋을 한꺼번에 보여 준다.

const STEP_COUNT = 3;

export default function ScrollStage({ steps, head, foot, labelledBy }: {
  /** 그림마다 문장 셋 */
  steps: Record<FigName, string[]>;
  /** 문장 위(이름·역할) · 아래(링크) */
  head: ReactNode;
  foot: ReactNode;
  labelledBy: string;
}) {
  const fig = useFigVariant();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const apiRef = useRef<FigureApi | null>(null);
  const [step, setStep] = useState(0);
  const spec = FIGURES[fig];

  const update = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (reduced) {
      apiRef.current?.setPose(spec.rest);
      setStep(STEP_COUNT - 1);
      return;
    }
    // 무대가 화면에 붙어 있는 동안(섹션 높이 - 화면 높이)이 한 바퀴다
    const run = el.offsetHeight - window.innerHeight;
    const p = run > 0 ? clamp01(-el.getBoundingClientRect().top / run) : 0;
    const t = lerp(spec.start, spec.end, p);
    apiRef.current?.setPose(t);
    el.style.setProperty('--p', p.toFixed(4));
    // 문장은 스크롤 비율이 아니라 그림의 동작 단계(t)에 맞춰 바꾼다 — 대차가 멈춘 뒤에 「한 번 더 확인」이 나오게
    setStep(t >= spec.steps[1] ? 2 : t >= spec.steps[0] ? 1 : 0);
  }, [reduced, spec]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [update]);

  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;

    const distance = spec.end - spec.start;
    const breakpointOffset = 0.02;
    const stops = [
      0,
      clamp01((spec.steps[0] - spec.start) / distance + breakpointOffset),
      clamp01((spec.steps[1] - spec.start) / distance + breakpointOffset),
      1,
    ];
    let targetProgress: number | null = null;
    let targetDeadline = 0;
    let unlockAt = 0;
    let settleTimer: number | undefined;
    let touchStartY: number | null = null;
    let touchConsumed = false;

    const currentProgress = () => {
      const run = el.offsetHeight - window.innerHeight;
      return run > 0 ? clamp01(-el.getBoundingClientRect().top / run) : 0;
    };

    const settleAtTarget = () => {
      if (targetProgress === null) return;
      if (performance.now() >= targetDeadline || Math.abs(currentProgress() - targetProgress) < 0.015) {
        targetProgress = null;
        unlockAt = performance.now() + 220;
        return;
      }
      settleTimer = window.setTimeout(settleAtTarget, 50);
    };

    const moveOneStop = (direction: 'forward' | 'backward', event: WheelEvent | KeyboardEvent | TouchEvent) => {
      const rect = el.getBoundingClientRect();
      const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0;
      const stageIsVisible = rect.top <= headerHeight + window.innerHeight * 0.2
        && rect.bottom > headerHeight + window.innerHeight * 0.2;
      if (!stageIsVisible) return false;

      if (targetProgress !== null || performance.now() < unlockAt) {
        event.preventDefault();
        return true;
      }

      const current = currentProgress();
      const next = direction === 'forward'
        ? stops.find((stop) => stop > current + 0.015)
        : stops.slice().reverse().find((stop) => stop < current - 0.015);
      if (next === undefined) return false;

      event.preventDefault();
      targetProgress = next;
      targetDeadline = performance.now() + 2500;
      const run = el.offsetHeight - window.innerHeight;
      const top = window.scrollY + rect.top + run * next;
      window.scrollTo({ top, behavior: 'smooth' });
      settleTimer = window.setTimeout(settleAtTarget, 50);
      return true;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < 4) return;
      moveOneStop(event.deltaY > 0 ? 'forward' : 'backward', event);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('a, button, input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || (event.code === 'Space' && !event.shiftKey)) {
        moveOneStop('forward', event);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp' || (event.code === 'Space' && event.shiftKey)) {
        moveOneStop('backward', event);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches.length === 1 ? event.touches[0].clientY : null;
      touchConsumed = targetProgress !== null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY === null || event.touches.length !== 1) return;
      if (touchConsumed) {
        event.preventDefault();
        return;
      }
      const delta = touchStartY - event.touches[0].clientY;
      if (Math.abs(delta) < 24) return;
      touchConsumed = moveOneStop(delta > 0 ? 'forward' : 'backward', event);
    };

    const onTouchEnd = () => {
      touchStartY = null;
      touchConsumed = false;
    };

    const onHashChange = () => {
      targetProgress = null;
      unlockAt = 0;
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    };

    // One wheel/touch gesture advances one illustration beat; page links and scrolling outside this stage stay native.
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('hashchange', onHashChange);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
    };
  }, [reduced, spec]);

  const onApi = useCallback((api: FigureApi | null) => {
    apiRef.current = api;
    if (api) update();
  }, [update]);

  return (
    <section ref={sectionRef} className="stage" id="top" aria-labelledby={labelledBy} data-step={step} data-fig={fig} data-motion={reduced ? 'still' : 'scroll'}>
      <div className="stage-pin">
        <div className="stage-figure">
          <FigureFrame key={fig} fig={fig} t={reduced ? spec.rest : spec.start} className="fig-frame" lineByWidth onApi={onApi} />
        </div>
        <div className="stage-copy">
          {head}
          <ol className="stage-steps">
            {steps[fig].map((s, i) => (
              <li key={s} aria-current={i === step ? 'step' : undefined}>{s}</li>
            ))}
          </ol>
          {foot}
        </div>
      </div>
    </section>
  );
}
