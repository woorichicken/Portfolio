// 참고 배너의 금속 와이어프레임(정이십면체·고리 구)을 선 그림으로 옮긴 장식.
// 좌표를 손으로 적지 않고 정이십면체를 계산해서 투영한다 — 모서리가 정확히 맞물려야 입체로 읽히기 때문이다.

type Point = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const ICOSA_VERTICES: Point[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
const EDGE_LENGTH = 2; // 위 좌표계에서 정이십면체 한 모서리의 길이

function rotate([x, y, z]: Point, ax: number, ay: number): Point {
  const y1 = y * Math.cos(ax) - z * Math.sin(ax);
  const z1 = y * Math.sin(ax) + z * Math.cos(ax);
  const x2 = x * Math.cos(ay) + z1 * Math.sin(ay);
  const z2 = -x * Math.sin(ay) + z1 * Math.cos(ay);
  return [x2, y1, z2];
}

function icosahedronEdges() {
  const pts = ICOSA_VERTICES.map((p) => rotate(p, 0.55, 0.35));
  const edges: { x1: number; y1: number; x2: number; y2: number; back: boolean }[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2]);
      if (Math.abs(d - EDGE_LENGTH) > 0.01) continue;
      const scale = 52;
      edges.push({
        x1: 100 + pts[i][0] * scale, y1: 100 + pts[i][1] * scale,
        x2: 100 + pts[j][0] * scale, y2: 100 + pts[j][1] * scale,
        // 뒤쪽 모서리는 옅게 — 깊이감을 주는 유일한 장치다
        back: pts[i][2] + pts[j][2] < 0,
      });
    }
  }
  return edges;
}

const EDGES = icosahedronEdges();
const RING_ANGLES = [0, 30, 60, 90, 120, 150];

export function Icosahedron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {EDGES.map((e, i) => (
        // back 은 그리는 순서용 값이라 DOM 속성으로 내보내지 않는다
        <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} className={e.back ? 'wire wire-back' : 'wire'} style={{ ['--i' as string]: i }} pathLength={1} />
      ))}
    </svg>
  );
}

export function RingSphere({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {RING_ANGLES.map((angle, i) => (
        <ellipse
          key={angle}
          cx="100" cy="100" rx="84" ry="30"
          transform={`rotate(${angle} 100 100)`}
          className="wire"
          style={{ ['--i' as string]: i * 3 }}
          pathLength={1}
        />
      ))}
    </svg>
  );
}
