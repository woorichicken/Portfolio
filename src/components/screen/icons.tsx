import type { RoleId } from '@/content/roles';

// 리브랜딩 화면의 선 아이콘. 굵기·끝 모양은 CSS(.avatar svg · .tabbar svg)가 정한다 — 여기는 모양만.
// 남의 서비스 아이콘을 옮기지 않고 기본 도형으로 그렸다.

const ROLE_PATHS: Record<RoleId, React.ReactNode> = {
  // 디자인 엔지니어 — 화면 틀 위의 커서
  design: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M12.5 10.5l5 1.8-2.2.9-.9 2.2z" />
      <path d="M8 21h8" />
    </>
  ),
  // 서비스 개발자 — 겹친 층(앱 · 서버 · 데이터)
  product: (
    <>
      <path d="M12 3l9 4.5-9 4.5-9-4.5z" />
      <path d="M3 12l9 4.5 9-4.5" />
      <path d="M3 16.5L12 21l9-4.5" />
    </>
  ),
  // AX · 자동화 — 도는 화살표와 반짝임
  ax: (
    <>
      <path d="M20 12a8 8 0 0 1-13.7 5.6" />
      <path d="M4 12a8 8 0 0 1 13.7-5.6" />
      <path d="M17.7 3v3.6h-3.6" />
      <path d="M6.3 21v-3.4h3.6" />
      <path d="M12 9.2l.9 1.9 1.9.9-1.9.9-.9 1.9-.9-1.9-1.9-.9 1.9-.9z" />
    </>
  ),
  // 1인 제작자 — 내보내는 상자
  maker: (
    <>
      <path d="M4 8.5l8-4.5 8 4.5v7L12 20l-8-4.5z" />
      <path d="M4 8.5l8 4.5 8-4.5" />
      <path d="M12 13v7" />
    </>
  ),
  // 전체 — 네 칸
  all: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
};

export function RoleIcon({ role }: { role: RoleId }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{ROLE_PATHS[role]}</svg>;
}

export function Avatar({ role, className }: { role: RoleId; className?: string }) {
  return (
    <span className={`avatar${className ? ` ${className}` : ''}`} data-role={role} aria-hidden="true">
      <RoleIcon role={role} />
    </span>
  );
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function IconHome() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5L12 4l8 6.5V20h-5v-5.5H9V20H4z" /></svg>;
}
export function IconGrid() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>;
}
export function IconMail() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5L12 13l8.5-6.5" /></svg>;
}
export function IconInfo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6v.2" /></svg>;
}
export function IconExternal() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>;
}
export function IconLink() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>;
}
export function IconChevron({ dir }: { dir: 'left' | 'right' }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}>{dir === 'left' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}</svg>;
}
export function IconArrowRight() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
export function IconEye({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}
export function IconUp() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14l6-6 6 6" /></svg>;
}
export function IconDown() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10l6 6 6-6" /></svg>;
}
export function IconComment() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /></svg>;
}
export function IconCaret() {
  return <svg className="caret" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4z" fill="currentColor" /></svg>;
}
export function IconClose() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M6 6l12 12M18 6L6 18" /></svg>;
}
export function IconExpand() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" /></svg>;
}
