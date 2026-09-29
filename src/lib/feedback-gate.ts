// 피드백 버튼 관문. 비밀번호를 맞힌 사람에게만 위젯을 내려준다. (design-atlas 의 같은 파일을 옮겨 왔다)
//
// 이건 보안 경계가 아니라 "일반 방문자에게 내부 도구를 안 보이게" 하는 가림막이다.
// 수집 키는 원래 공개(publishable) 값이고, 실제로 막는 건 수집 소스의 허용 호스트 목록이다.
// 그래서 해시를 번들에 둬도 된다 — 대신 비밀번호는 무작위 18자라 해시로 역산이 사실상 불가능하다.
// 비밀번호 원문은 저장소에 없다: ~/.config/portfolio/feedback-password.txt (0600).

export const FEEDBACK_PASSWORD_SALT = 'solhun-portfolio/feedback/v1';
export const FEEDBACK_PASSWORD_HASH = 'c0ac1a8213417ca01abab596cf6af9e6e2c56704d5aac17b545a2c76dfa8fe2d';
export const UNLOCK_STORAGE_KEY = 'solhun-portfolio:feedback-unlocked';

/**
 * 위젯을 띄워도 되는 호스트. 라쏘런 수집 소스(portfolio-web)의 host_patterns 와 같게 둔다.
 * 여기만 넓히면 버튼은 떠도 보내는 순간 403 이다. 호스트를 늘릴 때는 소스부터 넓힌다(docs/DEPLOY.md).
 * 수집 소스가 와일드카드를 받지 않아서 Vercel 프리뷰 주소(*.vercel.app)는 넣지 않았다.
 */
export const FEEDBACK_HOSTS = ['solhun.com', 'www.solhun.com', 'localhost', 'portfolio-sage-five-xdfwq9lj38.vercel.app'] as const;

export function isFeedbackHost(hostname: string): boolean {
  return (FEEDBACK_HOSTS as readonly string[]).includes(hostname);
}

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${FEEDBACK_PASSWORD_SALT}:${password.trim()}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function isCorrectPassword(password: string): Promise<boolean> {
  return (await hashPassword(password)) === FEEDBACK_PASSWORD_HASH;
}
