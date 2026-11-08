'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { isRoleId, type RoleId } from '@/content/roles';
import { browsePath, localePath, type Locale } from '@/i18n/config';
import { Avatar, IconCaret } from './icons';
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
      if (role && isRoleId(role)) writeRole(role);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}

// ── 머리 메뉴의 선택 표시 따라가기 ─────────────────────────────────────────
// 역할 화면에서 「연표」·「연락」을 누르거나 거기까지 내려오면 선택 표시(회색 알약)를 그 항목으로 옮긴다.
// 전에는 늘 「홈」에 붙어 있어서 연표를 눌러도 표시가 남지 않았다(2026-11-02 피드백 「연표 누르면 여기 남아 있어야」).
const SPY_SECTIONS = ['timeline', 'contact'] as const;
type SpySection = (typeof SPY_SECTIONS)[number];
/** 칸의 위 끝이 화면 위에서 이 비율 선을 넘어오면 「보는 중」. 연표를 누르면 위 끝이 머리 바로 아래(92px)에 와서 늘 넘는다 */
const SPY_LINE_RATIO = 0.4;
/** 맨 아래로 친다고 볼 남은 거리(px) — 소수점 스크롤 오차 */
const BOTTOM_SLACK = 2;

const isSpySection = (id: string): id is SpySection => (SPY_SECTIONS as readonly string[]).includes(id);

function readSection(): SpySection | null {
  let found: SpySection | null = null;
  for (const id of SPY_SECTIONS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= innerHeight * SPY_LINE_RATIO) found = id;
  }
  // 맨 아래에서는 연락 띠가 선까지 못 올라올 수 있다 — 그때는 「연락」. 단 연표를 눌러 왔는데 화면이 커서 더 못 내려간 경우
  // (연표 머리가 아직 화면 안에 있다)는 「연표」를 지킨다.
  const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - BOTTOM_SLACK;
  if (atBottom && document.getElementById('contact')) {
    const hash = location.hash.slice(1);
    const timelineTop = document.getElementById('timeline')?.getBoundingClientRect().top ?? -1;
    found = hash === 'timeline' && timelineTop >= 0 ? 'timeline' : 'contact';
  }
  return found;
}

// 링크마다 따로 재지 않고 한 번 재서 나눠 준다(머리 메뉴와 「메뉴 ▾」 안에 같은 링크가 두 벌 있다)
let activeSection: SpySection | null = null;
const sectionListeners = new Set<() => void>();
function refreshSection() {
  const next = readSection();
  if (next === activeSection) return;
  activeSection = next;
  sectionListeners.forEach((notify) => notify());
}
function subscribeSection(notify: () => void) {
  sectionListeners.add(notify);
  if (sectionListeners.size === 1) {
    window.addEventListener('scroll', refreshSection, { passive: true });
    window.addEventListener('resize', refreshSection);
    window.addEventListener('hashchange', refreshSection);
    refreshSection();
  }
  return () => {
    sectionListeners.delete(notify);
    if (sectionListeners.size === 0) {
      window.removeEventListener('scroll', refreshSection);
      window.removeEventListener('resize', refreshSection);
      window.removeEventListener('hashchange', refreshSection);
    }
  };
}
function useActiveSection(): SpySection | null {
  return useSyncExternalStore(subscribeSection, () => activeSection, () => null);
}

/**
 * 기억한 역할 화면으로 가는 링크(머리 메뉴·로고 등).
 * role: 지금 역할을 아는 화면(역할 화면)이면 넘긴다. 기억한 역할보다 먼저다 — 처음 들어온 /as/ax 에서 「연표」가
 *   기억값이 아직 없어 /as/all#timeline(다른 화면)으로 넘어가던 것을 막는다(2026-11-03 점검).
 * spy: 역할 화면의 머리 메뉴일 때 켠다 — 「홈」은 연표·연락을 보고 있지 않을 때만, 「연표」·「연락」은 그 칸을 볼 때 선택 표시를 단다.
 */
export function RoleHomeLink({ locale, role: known, hash = '', className, children, label, current, title, spy }: { locale: Locale; role?: RoleId; hash?: string; className?: string; children: ReactNode; label?: string; current?: boolean; title?: string; spy?: boolean }) {
  const stored = useStoredRole('all');
  const role = known ?? stored;
  const active = useActiveSection();
  const section = hash.slice(1);
  let ariaCurrent: 'page' | 'location' | undefined;
  if (spy && isSpySection(section)) ariaCurrent = active === section ? 'location' : undefined;
  else if (current) ariaCurrent = spy && active ? undefined : 'page';
  return <a className={className} href={`${browsePath(locale, role)}${hash}`} aria-label={label} title={title} aria-current={ariaCurrent}>{children}</a>;
}

/** 머리 오른쪽의 역할 아이콘 — 누르면 역할 고르기로. 지금 역할을 아는 화면(역할 화면)은 role 을 넘긴다 */
/** names: 역할 이름(D1 roles 문서에서) — 클라이언트 번들에 시드값을 굳혀 두지 않으려고 서버에서 넘긴다 */
export function RoleChip({ locale, role: known, label, names }: { locale: Locale; role?: RoleId; label: string; names: Record<RoleId, string> }) {
  const stored = useStoredRole('all');
  const role = known ?? stored;
  return (
    <a className="role-chip" href={localePath(locale)} title={label}>
      <span className="role-chip-label">{names[role]}</span>
      <Avatar role={role} />
      {/* 넷플릭스 프로필 단추처럼 그림 옆 ▾ — 「누르면 바꾼다」는 단서(사용성 점검 U14) */}
      <IconCaret />
      <span className="visually-hidden">{label}</span>
    </a>
  );
}

/**
 * 상세의 닫기(×) — 역할 화면에서 카드를 눌러 왔으면 브라우저 「뒤로」와 똑같이 돌아가 보던 줄·스크롤을 지킨다(사용성 점검 U04).
 * 주소를 직접 열었거나 다른 데서 왔으면 기억한 역할 화면으로 간다.
 */
export function BackToList({ locale, className, label, children }: { locale: Locale; className?: string; label: string; children: ReactNode }) {
  const role = useStoredRole('all');
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    try {
      const from = new URL(document.referrer);
      if (from.origin === location.origin && /\/as\//.test(from.pathname) && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    } catch {
      // referrer 가 비었으면 링크 그대로 간다
    }
  }
  return <a className={className} href={browsePath(locale, role)} aria-label={label} title={label} onClick={onClick}>{children}</a>;
}

/** 언어를 바꿀 때 보던 탭(#tab-…)을 들고 간다 — 서버는 해시를 모르니 누르는 순간 붙인다(사용성 점검 U03) */
export function CarryHash() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('.lang-switch a');
      if (link && location.hash) link.href = link.href.split('#')[0] + location.hash;
    }
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
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

/** 머리 메뉴에서 선택 표시를 달 화면 — 결과물 화면(/design)을 없애 「홈」(역할 화면) 하나만 남았다 */
export type TabKey = 'home';

/**
 * 좁은 화면의 「메뉴 ▾」 — 넷플릭스 웹이 390px 에서 메뉴를 한 단추로 접는 방식(2026-11-01 실측: 머리 80px · 로고 옆 「메뉴」 ·
 * 펼치면 175px 칸에 항목 48px · 고른 항목 회색 바탕). 아래 탭 막대(앱 방식)를 이걸로 바꿨다(3회차 리뷰 M1 「실제 반응형 넷플릭스와 다르다」).
 * 바깥을 누르거나 Esc · 항목을 누르면 닫힌다.
 */
export function MenuButton({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      boxRef.current?.querySelector<HTMLButtonElement>('.sx-menu-btn')?.focus();
    };
    document.addEventListener('click', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div className="sx-menu" ref={boxRef}>
      <button type="button" className="sx-menu-btn" aria-expanded={open} aria-controls="sx-menu-panel" onClick={() => setOpen((v) => !v)}>
        {label}
        <IconCaret />
      </button>
      <div
        className="sx-menu-panel"
        id="sx-menu-panel"
        hidden={!open}
        onClick={(e) => {
          if ((e.target as Element).closest('a')) setOpen(false);
        }}
      >
        {children}
      </div>
    </div>
  );
}
