import { getContent } from '@/content';
import type { Metric, Project, Quote } from '@/content/types';

// 시안(/lab) 전용 읽기 창구. 콘텐츠 파일(ko.ts)은 건드리지 않고, 열린 제보 중 「빼 달라」는 것만 여기서 걸러 보여 준다.
// 시안이 채택되면 이 걸러내기를 콘텐츠 파일에 반영하고 이 파일은 지운다.

/** 인용을 「누가」와 「어디서·언제」로 나눈 모양. 지금 사이트는 둘을 한 줄(who)에 섞어 써서 출처가 흐려진다 */
export type LabQuote = { text: string; speaker: string; context: string };

export type LabProject = Project & { index: number; role: string; period: string; labQuotes: LabQuote[] };

// 제보 41b1fdca — 「커밋 수 같은 숫자는 빼는 게 좋을 듯」
function keepMetric(m: Metric): boolean {
  return !m.label.includes('커밋');
}

// 제보 cca52ce2 — 「잔금까지 완주」 표현은 포트폴리오에 안 맞음
function cleanMetric(m: Metric): Metric {
  return { ...m, label: m.label.replace(/\s*·\s*잔금까지 완주/, '') };
}

function splitQuote(q: Quote, project: Project): LabQuote {
  const [speakerRaw, ...rest] = q.who.split(' — ');
  // 제보 6659c855 — 사내 프로젝트의 「대표」는 라이트소프트 대표라고 밝힌다
  const speaker = speakerRaw === '대표' && project.context.includes('라이트소프트') ? '라이트소프트 대표' : speakerRaw;
  return { text: q.text, speaker, context: rest.join(' — ') };
}

function factValue(project: Project, label: string): string {
  return project.facts.find((f) => f.label === label)?.value ?? '';
}

export function getLabProjects(): LabProject[] {
  const t = getContent('ko');
  return t.work.projects.map((p, index) => ({
    ...p,
    // 5회차 X2 — 콘텐츠 자동화 커버의 주토피아 캐릭터를 직접 만든 CLI Manager 카드로(운영용 커밋은 fix/content-cover-261009)
    ...(p.id === 'content' && p.gallery?.[0] ? { cover: p.gallery[0], gallery: [] } : {}),
    index,
    role: factValue(p, '역할'),
    period: factValue(p, '기간'),
    metrics: p.metrics?.filter(keepMetric).map(cleanMetric),
    improvements: p.improvements?.map((i) => (i.metric && !keepMetric(i.metric) ? { ...i, metric: undefined } : i)),
    // 제보 8c29dfc7 — 본인 발언을 인용으로 쓰지 않는다
    labQuotes: (p.quotes ?? []).filter((q) => !q.who.startsWith('본인')).map((q) => splitQuote(q, p)),
  }));
}

export function getLabProject(id: string): LabProject | undefined {
  return getLabProjects().find((p) => p.id === id);
}

export const LAB_IDS = getContent('ko').work.projects.map((p) => p.id);
