'use client';

import { useEffect, useState } from 'react';

// 프로젝트 상세의 왼쪽 목차. 스크롤을 따라 붙어 있고(CSS sticky), 화면 위쪽에 들어온 장을 굵게 표시한다.
export default function CaseToc({ items, label }: { items: { id: string; label: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    // 마지막 장(배운 점)은 짧아서 화면 위쪽까지 못 올라온다 — 바닥에 닿았으면 마지막 장을 켠다.
    // 관찰자 콜백이 스크롤 이벤트보다 늦게 와서 덮어쓰므로, 두 곳 모두 바닥 여부를 먼저 본다.
    const last = items[items.length - 1]?.id;
    const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const io = new IntersectionObserver(
      (entries) => {
        if (last && atBottom()) { setActive(last); return; }
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-20% 0px -66% 0px' },
    );
    els.forEach((e) => io.observe(e));
    const onScroll = () => { if (last && atBottom()) setActive(last); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [items]);
  return (
    <nav className="lab-toc" aria-label={label}>
      <ol>
        {items.map((i) => (
          <li key={i.id}><a href={`#${i.id}`} aria-current={active === i.id ? 'true' : undefined}>{i.label}</a></li>
        ))}
      </ol>
    </nav>
  );
}
