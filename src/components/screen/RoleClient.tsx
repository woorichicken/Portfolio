'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ROLES, type RoleId } from '@/content/roles';
import { browsePath, localePath, type Locale } from '@/i18n/config';
import { Avatar, IconGrid, IconHome, IconMail } from './icons';
import { readRole, writeRole } from './role-memory';

// 역할을 기억하고 그 역할로 돌아가게 하는 작은 조각들. 서버는 기본값(fallback)으로 그리고, 붙은 뒤 기억한 역할로 바꾼다.
// 그래서 JS 가 꺼져 있어도 링크는 살아 있다(「전체」 화면으로 간다).

/** 기억한 역할 — 처음 그릴 때는 fallback, 붙은 뒤 저장값 */
function useStoredRole(fallback: RoleId): RoleId {
  const [role, setRole] = useState<RoleId>(fallback);
  useEffect(() => {
    const stored = readRole();
    if (stored) setRole(stored);
  }, []);
  return role;
}

/** 역할 화면(/as/<역할>)에 들어오면 그 역할을 기억한다 */
export function RememberRole({ role }: { role: RoleId }) {
  useEffect(() => writeRole(role), [role]);
  return null;
}

/** 첫 화면의 타일 — 누르면 기억하고, 지난번 고른 타일에는 「최근에 본 역할」을 켠다(CSS 가 [data-recent] 로 보인다) */
export function PickerMemory() {
  useEffect(() => {
    const stored = readRole();
    const tiles = document.querySelectorAll<HTMLElement>('[data-pick-role]');
    tiles.forEach((tile) => {
      if (tile.dataset.pickRole === stored) tile.setAttribute('data-recent', '');
    });
    function onClick(e: MouseEvent) {
      const tile = (e.target as Element | null)?.closest<HTMLElement>('[data-pick-role]');
      const role = tile?.dataset.pickRole;
      if (role && role in ROLES) writeRole(role as RoleId);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}

/** 기억한 역할 화면으로 가는 링크(상세의 「목록으로」 등) */
export function RoleHomeLink({ locale, hash = '', className, children, label }: { locale: Locale; hash?: string; className?: string; children: ReactNode; label?: string }) {
  const role = useStoredRole('all');
  return <a className={className} href={`${browsePath(locale, role)}${hash}`} aria-label={label}>{children}</a>;
}

/** 머리 오른쪽의 역할 아이콘 — 누르면 역할 고르기로. 지금 역할을 아는 화면(역할 화면)은 role 을 넘긴다 */
export function RoleChip({ locale, role: known, label }: { locale: Locale; role?: RoleId; label: string }) {
  const stored = useStoredRole('all');
  const role = known ?? stored;
  return (
    <a className="role-chip" href={localePath(locale)} title={label}>
      <span className="role-chip-label">{ROLES[role].name[locale]}</span>
      <Avatar role={role} />
      <span className="visually-hidden">{label}</span>
    </a>
  );
}

/** 머리 바탕 — 맨 위에서는 그림 위에 투명하게, 내리면 짙게 */
export function HeaderSolid() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.sx-header');
    if (!header) return;
    const update = () => {
      if (window.scrollY > 24) header.setAttribute('data-solid', '');
      else header.removeAttribute('data-solid');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return null;
}

export type TabKey = 'home' | 'work' | 'contact' | 'role';

/** 모바일 아래 탭 — 홈(기억한 역할) · 결과물 · 연락 · 역할 바꾸기 */
export function TabBar({ locale, current, role: known, labels, workHref, navLabel }: {
  locale: Locale;
  navLabel: string;
  current?: TabKey;
  role?: RoleId;
  labels: Record<TabKey, string>;
  workHref: string;
}) {
  const stored = useStoredRole('all');
  const role = known ?? stored;
  const home = browsePath(locale, role);
  const items: { key: TabKey; href: string; icon: ReactNode }[] = [
    { key: 'home', href: home, icon: <IconHome /> },
    { key: 'work', href: workHref, icon: <IconGrid /> },
    { key: 'contact', href: `${home}#contact`, icon: <IconMail /> },
    { key: 'role', href: localePath(locale), icon: <Avatar role={role} /> },
  ];
  return (
    <nav className="tabbar" aria-label={navLabel}>
      {items.map((it) => (
        <a key={it.key} href={it.href} aria-current={current === it.key ? 'page' : undefined}>
          {it.icon}
          {labels[it.key]}
        </a>
      ))}
    </nav>
  );
}
