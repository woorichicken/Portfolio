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
    apiRef.current?.setPose(lerp(spec.start, spec.end, p));
    el.style.setProperty('--p', p.toFixed(4));
    setStep(Math.min(STEP_COUNT - 1, Math.floor(p * STEP_COUNT)));
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

  const onApi = useCallback((api: FigureApi | null) => {
    apiRef.current = api;
    if (api) update();
  }, [update]);

  return (
    <section ref={sectionRef} className="stage" id="top" aria-labelledby={labelledBy} data-step={step} data-fig={fig} data-motion={reduced ? 'still' : 'scroll'}>
      <div className="stage-pin">
        <div className="stage-figure">
          <FigureFrame key={fig} fig={fig} t={reduced ? spec.rest : spec.start} className="fig-frame" onApi={onApi} />
        </div>
        <div className="stage-copy">
          {head}
          <ol className="stage-steps">
            {steps[fig].map((s, i) => (
              <li key={s} aria-current={i === step ? 'step' : undefined}>{s}</li>
            ))}
          </ol>
          <p className="stage-ticks" aria-hidden="true">
            {steps[fig].map((s, i) => <span key={s} data-on={i <= step ? '' : undefined} />)}
            <b>{String(step + 1).padStart(2, '0')} / {String(STEP_COUNT).padStart(2, '0')}</b>
          </p>
          {foot}
        </div>
      </div>
    </section>
  );
}
