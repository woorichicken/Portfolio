import { isRoleId, type RoleId } from '@/content/roles';

// 마지막으로 고른 역할을 이 브라우저에 기억한다. 상세 페이지의 「목록으로」·아래 탭의 「홈」이 그 역할 화면으로 돌아간다.
// 저장이 막힌 브라우저(사생활 보호 창 등)에서는 기억 없이 동작한다 — 그때는 「전체」로 돌아간다.
export const ROLE_STORAGE_KEY = 'solhun:role';

export function readRole(): RoleId | null {
  try {
    const value = localStorage.getItem(ROLE_STORAGE_KEY);
    return value && isRoleId(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeRole(role: RoleId) {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {}
}
