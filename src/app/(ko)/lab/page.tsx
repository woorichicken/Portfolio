// 시안 목록. 리뷰하는 사람이 어느 화면부터 봐야 하는지 한 곳에서 고르게 한다.
const LINKS = [
  { href: '/lab/a', name: 'A · 짧은 홈', note: '정체성 한 줄 + 4줄 카드. 썸네일을 추상 커버 ↔ 실제 화면으로 바꿔 볼 수 있다' },
  { href: '/lab/a/kits', name: 'A · 케이스 상세 (KITS)', note: '새 프로젝트 블록 — 메타 띠 · 장(章)별 이전/이후 · 큰 인용' },
  { href: '/lab/b', name: 'B · 크래프트 로그', note: '좁은 한 단 + 직접 만져 보는 실험 4개 + 작업 목록' },
  { href: '/lab/b/kits', name: 'B · 케이스 상세 (KITS)', note: '새 프로젝트 블록 — 이전/이후 전환 · 메시지형 인용' },
  { href: '/', name: '지금 사이트', note: '비교용' },
];

export default function LabIndex() {
  return (
    <main className="lab-index">
      <p className="lab-eyebrow">solhun.com · 디자인 시안 · 2026-10-08</p>
      <h1>A · B 시안</h1>
      <ul>
        {LINKS.map((l) => (
          <li key={l.href}>
            <a href={l.href}>{l.name} →</a>
            <p>{l.note}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
