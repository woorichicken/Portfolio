'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { IconChevron } from './icons';

// 가로로 넘기는 줄. 터치 화면은 손가락으로 넘기고(scroll-snap), 마우스 화면은 양옆 화살표로 한 화면씩 넘긴다.
// 화살표는 넘길 것이 있을 때만 보인다 — 끝에 닿으면 그쪽 화살표를 숨긴다.
// 넘기는 움직임은 넷플릭스 실측(2026-11-01 Aside: 줄 transform 0.75초 · cubic-bezier(0.4, 0, 0.2, 1))에 맞춘다.
// 브라우저 기본 부드러운 스크롤은 길이·곡선을 정할 수 없어서 직접 그린다. 「움직임 줄이기」면 바로 옮긴다.
const SLIDE_MS = 750;

/** cubic-bezier(x1, y1, x2, y2) 의 t → 진행률. 곡선 위 x 를 이분법으로 찾는다(16번이면 화면에서 구분이 안 된다) */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 16; i += 1) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}
const STANDARD = bezier(0.4, 0, 0.2, 1);

export default function RowTrack({ children, prevLabel, nextLabel, labelledBy }: { children: ReactNode; prevLabel: string; nextLabel: string; labelledBy: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const slideRef = useRef<number | null>(null);

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

  /** 한 화면만큼 — 지금 다 보이는 카드 수만큼 넘기고, 카드 왼쪽 끝이 여백 선에 딱 맞게 멈춘다(넷플릭스와 같다) */
  function page(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (!items.length) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : items[0].offsetWidth;
    const gap = step - items[0].offsetWidth;
    const perPage = Math.max(1, Math.floor((el.clientWidth - pad * 2 + gap) / step));
    const now = Math.round(el.scrollLeft / step);
    const max = el.scrollWidth - el.clientWidth;
    const target = Math.max(0, Math.min(max, (now + dir * perPage) * step));
    if (slideRef.current) cancelAnimationFrame(slideRef.current);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.scrollLeft = target;
      return;
    }
    const start = el.scrollLeft;
    const t0 = performance.now();
    // 움직이는 동안만 scroll-snap 을 끈다 — 켜 두면 한 칸 옮길 때마다 가까운 카드로 다시 붙어 떨린다
    el.style.scrollSnapType = 'none';
    const frame = (time: number) => {
      const p = Math.min(1, (time - t0) / SLIDE_MS);
      el.scrollLeft = start + (target - start) * STANDARD(p);
      if (p < 1) slideRef.current = requestAnimationFrame(frame);
      else {
        slideRef.current = null;
        el.style.scrollSnapType = '';
      }
    };
    slideRef.current = requestAnimationFrame(frame);
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
