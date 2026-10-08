import type React from 'react';
// 프로젝트마다 다른 추상 커버(SVG). 고객사 화면을 홈에 올리지 않아도 카드의 무게를 맞추려고 만든다(제보 89dab0ee).
// 같은 id 는 항상 같은 그림이 나와야 해서 id 로 시드를 만든 난수를 쓴다 — Math.random 을 쓰면 빌드마다 바뀐다.

const W = 400;
const H = 250;
const INK = '#c9cff7';
const SIGNAL = '#6f80ff';

function seedFrom(id: string): number {
  let h = 2166136261;
  for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

// mulberry32 — 짧고 분포가 고른 시드 난수
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dots(r: () => number) {
  const out: React.JSX.Element[] = [];
  const step = 16;
  const cx = 80 + r() * 240;
  const cy = 40 + r() * 170;
  for (let x = step; x < W; x += step) {
    for (let y = step; y < H; y += step) {
      const d = Math.hypot(x - cx, y - cy) / 260;
      const rad = Math.max(0, 3.2 * (1 - d) + (r() - 0.5) * 0.6);
      if (rad > 0.5) out.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={rad.toFixed(2)} fill={INK} />);
    }
  }
  out.push(<circle key="accent" cx={cx} cy={cy} r={6} fill={SIGNAL} />);
  return out;
}

function bars(r: () => number) {
  const out: React.JSX.Element[] = [];
  let x = 40;
  const mid = 120 + r() * 160;
  while (x < W - 40) {
    const near = 1 - Math.min(1, Math.abs(x - mid) / 160);
    const gap = 3 + (1 - near) * 14 + r() * 3;
    out.push(<rect key={x} x={x} y={70} width={near > 0.85 ? 2 : 1} height={110} fill={INK} opacity={0.35 + near * 0.65} />);
    x += gap;
  }
  out.push(<rect key="accent" x={mid} y={60} width={2} height={130} fill={SIGNAL} />);
  return out;
}

function rings(r: () => number) {
  const out: React.JSX.Element[] = [];
  const cx = 120 + r() * 160;
  const cy = 125;
  for (let i = 1; i <= 11; i++) {
    out.push(<circle key={i} cx={cx} cy={cy} r={i * 14} fill="none" stroke={INK} strokeWidth={1} opacity={1 - i * 0.07} strokeDasharray={i % 3 === 0 ? '2 5' : undefined} />);
  }
  const a = r() * Math.PI * 2;
  out.push(<circle key="accent" cx={cx + Math.cos(a) * 84} cy={cy + Math.sin(a) * 84} r={5} fill={SIGNAL} />);
  return out;
}

function blocks(r: () => number) {
  const out: React.JSX.Element[] = [];
  const size = 14;
  const cols = 18;
  const rows = 7;
  const x0 = (W - cols * size) / 2;
  const y0 = (H - rows * size) / 2;
  for (let c = 0; c < cols; c++) {
    for (let row = 0; row < rows; row++) {
      // 왼쪽은 꽉 차고 오른쪽으로 갈수록 성기다 — 「쌓여 가는 일」의 느낌
      if (r() < 1 - c / cols + 0.08) out.push(<rect key={`${c}-${row}`} x={x0 + c * size} y={y0 + row * size} width={size - 3} height={size - 3} fill={INK} />);
    }
  }
  out.push(<rect key="accent" x={x0 + Math.floor(r() * cols) * size} y={y0 - size * 1.4} width={size - 3} height={size - 3} fill={SIGNAL} />);
  return out;
}

function waves(r: () => number) {
  const out: React.JSX.Element[] = [];
  const phase = r() * Math.PI * 2;
  for (let i = 0; i < 9; i++) {
    const y0 = 60 + i * 16;
    const amp = 6 + i * 2.2;
    let d = `M 30 ${y0}`;
    for (let x = 30; x <= W - 30; x += 10) d += ` L ${x} ${(y0 + Math.sin(x / 38 + phase + i * 0.35) * amp).toFixed(1)}`;
    out.push(<path key={i} d={d} fill="none" stroke={i === 4 ? SIGNAL : INK} strokeWidth={i === 4 ? 2 : 1} opacity={i === 4 ? 1 : 0.35 + i * 0.05} />);
  }
  return out;
}

function constellation(r: () => number) {
  const pts = Array.from({ length: 16 }, () => [30 + r() * (W - 60), 30 + r() * (H - 70)] as const);
  const out: React.JSX.Element[] = [];
  // 가까운 점끼리만 잇는다 — 사람·도구가 이어지는 흐름 느낌
  pts.forEach(([x1, y1], i) => pts.slice(i + 1).forEach(([x2, y2], j) => {
    if (Math.hypot(x1 - x2, y1 - y2) < 95) out.push(<line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={1} opacity={0.35} />);
  }));
  pts.forEach(([x, y], i) => out.push(<circle key={`p${i}`} cx={x} cy={y} r={i === 0 ? 5 : 2.6} fill={i === 0 ? SIGNAL : INK} />));
  return out;
}

function stairs(r: () => number) {
  const out: React.JSX.Element[] = [];
  const n = 14;
  const bw = 16;
  const x0 = (W - n * (bw + 6)) / 2;
  let h = 18;
  for (let i = 0; i < n; i++) {
    h = Math.min(150, h + 4 + r() * 12);
    out.push(<rect key={i} x={x0 + i * (bw + 6)} y={200 - h} width={bw} height={h} rx={2} fill={i === n - 1 ? SIGNAL : INK} opacity={i === n - 1 ? 1 : 0.3 + (i / n) * 0.6} />);
  }
  return out;
}

function graph(r: () => number) {
  const out: React.JSX.Element[] = [];
  for (let x = 20; x < W; x += 20) out.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke={INK} strokeWidth={0.5} opacity={0.18} />);
  for (let y = 20; y < H; y += 20) out.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke={INK} strokeWidth={0.5} opacity={0.18} />);
  let d = 'M 20 190';
  let y = 190;
  for (let x = 40; x <= W - 20; x += 20) { y = Math.max(40, y - r() * 22 + 4); d += ` L ${x} ${y.toFixed(0)}`; }
  out.push(<path key="line" d={d} fill="none" stroke={INK} strokeWidth={1.5} />);
  out.push(<circle key="accent" cx={W - 20} cy={y} r={5} fill={SIGNAL} />);
  return out;
}

// 프로젝트 순서대로 하나씩 — 8개가 모두 다른 무늬를 갖게 한다
const FAMILIES = [dots, bars, rings, blocks, constellation, stairs, waves, graph];

export default function LabArt({ id, index, label, className }: { id: string; index: number; label?: string; className?: string }) {
  const r = rng(seedFrom(id));
  const draw = FAMILIES[index % FAMILIES.length];
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label ? `${label} 커버 그림` : '커버 그림'} preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill="#12142a" />
      {draw(r)}
      {label && (
        <text x={18} y={H - 16} fill={INK} opacity={0.7} fontSize={11} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" letterSpacing={1}>
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
