'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import FigureFrame, { type FigureApi } from './FigureFrame';
import { SECTION_PARTS, type SectionId } from './figures';
import { clamp01, lerp, useFigVariant, useReducedMotion } from './hooks';

// 섹션 머리의 부품 판 — 첫 화면 그림의 부품 하나(data-part)가 섹션에 들어설 때 확대되며 다시 나온다.
// 섹션을 지나는 동안에는 그 부품이 정해진 t 구간만큼 움직인다(게이지 바늘이 흔들리고, 종이가 흐르고).
// 장식이라 읽기 순서에서 빠진다(aria-hidden).

/** 판이 화면에 이만큼 들어오면 확대를 시작한다 */
const ENTER_RATIO = 0.35;

export default function PartSlot({ section }: { section: SectionId }) {
  const variant = useFigVariant();
  const reduced = useReducedMotion();
  const spec = SECTION_PARTS[variant][section];
  const ref = useRef<HTMLDivElement>(null);
  const apiRef = useRef<FigureApi | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: ENTER_RATIO });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const update = useCallback(() => {
    const sec = ref.current?.closest('section');
    if (!sec || !apiRef.current) return;
    if (reduced) { apiRef.current.setPose(spec.range[1]); return; }
    // 섹션 머리가 화면 아래에서 들어와 섹션 끝이 위로 나갈 때까지를 0→1 로
    const r = sec.getBoundingClientRect();
    const p = clamp01((window.innerHeight - r.top) / (window.innerHeight + r.height));
    apiRef.current.setPose(lerp(spec.range[0], spec.range[1], p));
  }, [reduced, spec]);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, [inView, update]);

  const onApi = useCallback((api: FigureApi | null) => {
    apiRef.current = api;
    if (api) update();
  }, [update]);

  return (
    <div ref={ref} className="part" data-part-name={spec.part} data-in={inView || reduced ? '' : undefined} aria-hidden="true">
      <FigureFrame
        key={`${spec.fig}-${spec.part}`}
        fig={spec.fig}
        t={spec.range[reduced ? 1 : 0]}
        part={[spec.part, ...(spec.with ?? [])]}
        range={spec.range}
        zoomIn={inView || reduced}
        className="fig-frame"
        lazy
        onApi={onApi}
      />
    </div>
  );
}
