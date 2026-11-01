'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { IconChevron } from './icons';

// 가로로 넘기는 줄. 터치 화면은 손가락으로 넘기고(scroll-snap), 마우스 화면은 양옆 화살표로 한 화면씩 넘긴다.
// 화살표는 넘길 것이 있을 때만 보인다 — 끝에 닿으면 그쪽 화살표를 숨긴다.
const PAGE_RATIO = 0.88;

export default function RowTrack({ children, prevLabel, nextLabel, labelledBy }: { children: ReactNode; prevLabel: string; nextLabel: string; labelledBy: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft >= max - 4;
    // 끝에 닿아 화살표가 사라지기 전에 초점을 반대쪽 화살표로 옮긴다 — 안 그러면 초점이 body 로 사라진다(U09)
    if (end && !start && document.activeElement === nextRef.current) prevRef.current?.focus();
    if (start && !end && document.activeElement === prevRef.current) nextRef.current?.focus();
    setEdges({ start, end });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    // 키보드로 카드에 들어오면 그 카드가 다 보이게 당긴다 — 반쯤 가려진 채 초점이 가지 않게(U08)
    function onFocusIn(e: FocusEvent) {
      const item = (e.target as Element | null)?.closest('li');
      if (!item || !el) return;
      const box = el.getBoundingClientRect();
      const r = item.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      if (r.left < box.left + pad || r.right > box.right - pad) item.scrollIntoView({ inline: 'start', block: 'nearest' });
    }
    el.addEventListener('focusin', onFocusIn);
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      el.removeEventListener('focusin', onFocusIn);
      observer.disconnect();
    };
  }, [measure]);

  function page(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * PAGE_RATIO, behavior: 'smooth' });
  }

  return (
    <div className="row-body">
      <button ref={prevRef} type="button" className="row-arrow" data-dir="prev" aria-label={prevLabel} disabled={edges.start} onClick={() => page(-1)}>
        <IconChevron dir="left" />
      </button>
      <ul className="row-track" ref={trackRef} aria-labelledby={labelledBy}>
        {children}
      </ul>
      <button ref={nextRef} type="button" className="row-arrow" data-dir="next" aria-label={nextLabel} disabled={edges.end} onClick={() => page(1)}>
        <IconChevron dir="right" />
      </button>
    </div>
  );
}
