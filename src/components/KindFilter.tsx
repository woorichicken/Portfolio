'use client';

import { useState, type ReactNode } from 'react';

// 결과물 화면(/design)의 종류 거르기 — 칩을 누르면 다른 종류의 칸을 숨긴다.
// 칸 목록은 서버에서 그대로 그리고, 숨기는 일만 CSS 한 줄로 한다(칸마다 상태를 들고 있지 않아도 된다).
export default function KindFilter({ kinds, allLabel, label, children }: { kinds: { key: string; label: string }[]; allLabel: string; label: string; children: ReactNode }) {
  const [kind, setKind] = useState('all');
  return (
    <div className="lab-filter">
      <div className="seg" role="group" aria-label={label}>
        <button type="button" aria-pressed={kind === 'all'} onClick={() => setKind('all')}>{allLabel}</button>
        {kinds.map((k) => (
          <button key={k.key} type="button" aria-pressed={kind === k.key} onClick={() => setKind(k.key)}>{k.label}</button>
        ))}
      </div>
      {children}
      <style>{kind === 'all' ? '' : `.lab-filter [data-kind]:not([data-kind="${kind}"]) { display: none; }`}</style>
    </div>
  );
}
