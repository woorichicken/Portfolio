'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { IconChevron } from './icons';

// 가로로 넘기는 줄. 터치 화면은 손가락으로 넘기고(scroll-snap), 마우스 화면은 양옆 화살표로 한 화면씩 넘긴다.
// 화살표는 넘길 것이 있을 때만 보인다 — 끝에 닿으면 그쪽 화살표를 숨긴다.
const PAGE_RATIO = 0.88;

export default function RowTrack({ children, prevLabel, nextLabel, labelledBy }: { children: ReactNode; prevLabel: string; nextLabel: string; labelledBy: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [measure]);

  function page(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * PAGE_RATIO, behavior: 'smooth' });
  }

  return (
    <>
      <button type="button" className="row-arrow" data-dir="prev" aria-label={prevLabel} disabled={edges.start} onClick={() => page(-1)}>
        <IconChevron dir="left" />
      </button>
      <ul className="row-track" ref={trackRef} aria-labelledby={labelledBy}>
        {children}
      </ul>
      <button type="button" className="row-arrow" data-dir="next" aria-label={nextLabel} disabled={edges.end} onClick={() => page(1)}>
        <IconChevron dir="right" />
      </button>
    </>
  );
}
