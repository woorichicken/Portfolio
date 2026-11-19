import Image from 'next/image';
import type { RoleId } from '@/content/roles';

// 리브랜딩 화면의 선 아이콘. 굵기·끝 모양은 CSS(.avatar svg · .btn svg)가 정한다 — 여기는 모양만.
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

/** logo 가 있으면 프로젝트 로고(.avatar-logo — 크기·모양은 그대로, 안 잘리게 contain), 없으면 역할 아이콘 */
export function Avatar({ role, className, logo }: { role: RoleId; className?: string; logo?: string }) {
  const classes = `avatar${logo ? ' avatar-logo' : ''}${className ? ` ${className}` : ''}`;
  return (
    <span className={classes} data-role={role} data-logo={logo ? '' : undefined} aria-hidden="true">
      {logo ? <Image src={logo} unoptimized alt="" width={64} height={64} /> : <RoleIcon role={role} />}
    </span>
  );
}

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function IconMail() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5L12 13l8.5-6.5" /></svg>;
}
export function IconInfo() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6v.2" /></svg>;
}
export function IconExternal() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>;
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
/** 코드 — 꺾쇠 둘과 빗금. GitHub 로고를 옮기지 않고 기본 도형으로 그렸다 */
export function IconCode() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" /></svg>;
}
/** GitHub 마크 — 오픈소스 카드의 저장소 링크(2026-11-19 리뷰: 「깃허브 실제 아이콘」). Octicons mark-github(MIT) 그대로 — 채운 도형이라 .btn 의 선 스타일을 끈다(.icon-fill) */
export function IconGithub() {
  return <svg className="icon-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z" /></svg>;
}
export function IconClose() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}><path d="M6 6l12 12M18 6L6 18" /></svg>;
}
/** 연필 — 어드민 「편집」 */
export function IconEdit() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z" /><path d="M13.5 7l3 3" /></svg>;
}
