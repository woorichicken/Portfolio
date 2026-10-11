import type React from 'react';

// 고객사 화면을 가릴 때 쓰는 커버(제보 89dab0ee). 지금 사이트 첫 화면과 같은 말투로 그린다 —
// 시그널 블루 바탕 + 핑크 글로우 + 흰 와이어 선. 그래야 실제 화면 카드 사이에 섞여도 다른 사이트처럼 보이지 않는다.
// 같은 id 는 늘 같은 그림이어야 해서 id 로 시드를 만든 난수를 쓴다.

const W = 400;
const H = 250;
const LINE = '#fff8f4';

function seedFrom(id: string): number {
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Draw = (r: () => number) => React.JSX.Element[];

// 첫 화면의 정이십면체처럼 「선으로 그린 입체」 — 꼭짓점을 돌려 투영한다
const polyhedron: Draw = (r) => {
  const out: React.JSX.Element[] = [];
  const n = 7;
  const cx = 230 + r() * 60;
  const cy = 125;
  const R = 92;
  const tilt = r() * Math.PI;
  const top = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + tilt;
    return [cx + Math.cos(a) * R, cy - 34 + Math.sin(a) * R * 0.38] as const;
  });
  const bottom = top.map(([x, y], i) => [x + Math.cos(i) * 8, y + 76] as const);
  top.forEach(([x, y], i) => {
    const [nx, ny] = top[(i + 1) % n];
    const [bx, by] = bottom[i];
    out.push(<line key={`t${i}`} x1={x} y1={y} x2={nx} y2={ny} stroke={LINE} strokeWidth={1.6} />);
    out.push(<line key={`v${i}`} x1={x} y1={y} x2={bx} y2={by} stroke={LINE} strokeWidth={1} opacity={0.55} />);
    out.push(<line key={`b${i}`} x1={bx} y1={by} x2={bottom[(i + 1) % n][0]} y2={bottom[(i + 1) % n][1]} stroke={LINE} strokeWidth={1} opacity={0.35} />);
  });
  return out;
};

// 첫 화면 왼쪽 아래의 고리 구(球)처럼 — 기울어진 타원 여러 개
const ringSphere: Draw = (r) => {
  const out: React.JSX.Element[] = [];
  const cx = 210 + r() * 80;
  const cy = 125;
  for (let i = 0; i < 7; i++) {
    out.push(<ellipse key={`h${i}`} cx={cx} cy={cy} rx={96} ry={14 + i * 13} fill="none" stroke={LINE} strokeWidth={i === 3 ? 1.6 : 1} opacity={i === 3 ? 0.95 : 0.45} />);
  }
  for (let i = 0; i < 5; i++) {
    out.push(<ellipse key={`v${i}`} cx={cx} cy={cy} rx={18 + i * 19} ry={96} fill="none" stroke={LINE} strokeWidth={1} opacity={0.3} transform={`rotate(${r() * 24 - 12} ${cx} ${cy})`} />);
  }
  return out;
};

// 겹친 물결 — 흐름·파이프라인
const waves: Draw = (r) => {
  const out: React.JSX.Element[] = [];
  const phase = r() * Math.PI * 2;
  for (let i = 0; i < 8; i++) {
    const y0 = 70 + i * 15;
    let d = `M 20 ${y0}`;
    for (let x = 20; x <= W - 20; x += 10) d += ` L ${x} ${(y0 + Math.sin(x / 42 + phase + i * 0.4) * (8 + i * 2)).toFixed(1)}`;
    out.push(<path key={i} d={d} fill="none" stroke={LINE} strokeWidth={i === 3 ? 1.8 : 1} opacity={i === 3 ? 1 : 0.4} />);
  }
  return out;
};

// 이어진 점 — 사람·도구가 연결되는 그림
const constellation: Draw = (r) => {
  const pts = Array.from({ length: 14 }, () => [40 + r() * (W - 80), 34 + r() * (H - 80)] as const);
  const out: React.JSX.Element[] = [];
  pts.forEach(([x1, y1], i) => pts.slice(i + 1).forEach(([x2, y2], j) => {
    if (Math.hypot(x1 - x2, y1 - y2) < 100) out.push(<line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={LINE} strokeWidth={1} opacity={0.5} />);
  }));
  pts.forEach(([x, y], i) => out.push(<circle key={`p${i}`} cx={x} cy={y} r={i === 0 ? 5 : 2.6} fill={LINE} />));
  return out;
};

const FAMILIES: Draw[] = [polyhedron, ringSphere, constellation, waves];

export default function LabArt({ id, index, label, className }: { id: string; index: number; label?: string; className?: string }) {
  const r = rng(seedFrom(id));
  const glowX = 10 + r() * 30;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label ? `${label} 커버 그림` : '커버 그림'} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`g-${id}`} cx={`${glowX}%`} cy="20%" r="60%">
          <stop offset="0%" stopColor="#f6b3df" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f6b3df" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#4f63ff" />
      <rect width={W} height={H} fill={`url(#g-${id})`} />
      {FAMILIES[index % FAMILIES.length](r)}
      {label && (
        <text x={20} y={H - 20} fill={LINE} fontSize={15} fontWeight={800} letterSpacing={0.5} fontFamily="var(--font-display), sans-serif">
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
