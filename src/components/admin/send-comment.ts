// 어드민 코멘트를 라쏘런(피드백 수집 소스 portfolio-web)으로 보낸다 — 화면의 피드백 버튼과 같은 길이다.
// 그래서 어드민에서 남긴 말도 지금까지의 제보처럼 한 곳(라쏘런)에 모이고, 기존 피드백 처리 흐름이 그대로 집어 간다.
// 수집 주소·키는 빌드 때 박히는 값이라 로컬에 env 가 없으면 「보낼 곳 없음」을 돌려주고 이 브라우저에만 남긴다.

const ENDPOINT = process.env.NEXT_PUBLIC_DP_FEEDBACK_URL ?? '';
const TOKEN = process.env.NEXT_PUBLIC_DP_FEEDBACK_KEY ?? '';

export type SendResult = 'sent' | 'queued' | 'disabled' | 'failed';

export const canSendToLasso = Boolean(ENDPOINT && TOKEN);

export async function sendComment({ slug, name, text }: { slug: string; name: string; text: string }): Promise<SendResult> {
  if (!canSendToLasso) return 'disabled';
  try {
    // 위젯과 같은 묶음이라 어드민에서 처음 보낼 때만 받아 온다
    const core = await import('@solhun/feedback-kit-core');
    const web = await import('@solhun/feedback-kit-web');
    const storage = web.createWebStorage();
    const queue = new core.FeedbackQueue({ storage, adapter: core.createLassoAdapter({ endpoint: ENDPOINT, token: TOKEN }) });
    const report = await core.buildReport(
      { kind: 'report', comment: `[어드민 · ${name} (${slug})] ${text}`, priority: 'normal', screenshot: null, pin: null, element: null },
      { app: 'portfolio', platform: 'web', sessionId: core.uuidv4(), storage, ...web.webContextProviders() },
    );
    const outcome = await queue.submit(report);
    return outcome.delivered ? 'sent' : outcome.queued ? 'queued' : 'failed';
  } catch {
    return 'failed';
  }
}
