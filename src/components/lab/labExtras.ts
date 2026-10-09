import { getContent } from '@/content';

// 시안 A 4회차 — 「디자인 엔지니어로서의 부분」을 채우는 데이터.
// 근거가 있는 것만 실제 칸으로 둔다: 콘텐츠 파일(ko.ts) 또는 영상 기록(보류 브랜치 docs/media/media-facts.json).
// 근거가 없는 자리는 example: true 로 두고 「무엇을 채우면 되는지」를 문장으로 적는다 — 화면에 「예시」로 보인다.

export type DePoint = { kind: string; title: string; body: string; example?: boolean };

export type LabVideo = { id: string; title: string; duration: string; role: string; poster: string; project?: string; note?: string };

// 영상 — media-facts.json 의 제목·길이·역할 그대로. 공개 권리 결정(①~③)이 남아 있어 화면에 표시한다.
export const VIDEOS: LabVideo[] = [
  { id: 'showreel', title: '쇼릴 — 화면·영상·제품을 코드로', duration: '1:04', role: '기획·제작 · Remotion', poster: '/lab-media/showreel-poster.jpg', note: '배경음도 코드로 합성' },
  { id: 'fair-promo', title: 'FAIR E-FM 60초 홍보영상', duration: '1:00', role: '기획·스크립트·제작', poster: '/lab-media/fair-promo.jpg', project: 'fair' },
  { id: 'fair-update', title: 'FAIR E-FM 업데이트 소개', duration: '2:17', role: '기획·스크립트·제작', poster: '/lab-media/fair-update.jpg', project: 'fair' },
  { id: 'fair-crm-intro', title: 'FAIR CRM 히어로 인트로', duration: '0:16', role: '기획·스크립트·제작', poster: '/lab-media/fair-crm-intro.jpg', project: 'fair' },
  { id: 'symphony', title: 'Symphony 소개', duration: '2:58', role: '기획·스크립트·제작', poster: '/lab-media/symphony.jpg', project: 'automation' },
  { id: 'feedback-kit', title: 'Feedback Kit 소개', duration: '0:40', role: '기획·스크립트·제작', poster: '/lab-media/feedback-kit.jpg', project: 'automation' },
  { id: 'cardnews-agent-film', title: 'Cardnews 브랜드 필름', duration: '0:30', role: '기획·스크립트·제작', poster: '/lab-media/cardnews-agent-film.jpg', project: 'content', note: '캐릭터 권리 미확인' },
  { id: 'cli-worktree', title: 'CLI Manager — 워크트리 만들기', duration: '0:14', role: '화면 녹화(시나리오)', poster: '/lab-media/cli-worktree.jpg', project: 'cli-manager' },
  { id: 'cli-commit-push', title: 'CLI Manager — 커밋 & 푸시', duration: '0:13', role: '화면 녹화(시나리오)', poster: '/lab-media/cli-commit-push.jpg', project: 'cli-manager' },
  { id: 'cli-templates', title: 'CLI Manager — 템플릿', duration: '0:21', role: '화면 녹화(시나리오)', poster: '/lab-media/cli-templates.jpg', project: 'cli-manager' },
];

// 프로젝트별 「디자인 엔지니어링 포인트」. 실제 칸의 문장은 ko.ts 의 요약·개선 항목에서 옮겼다(출처를 옆에 적는다).
export const DE_POINTS: Record<string, DePoint[]> = {
  kits: [
    { kind: '반응형', title: '한 화면 → 다섯 화면', body: '앱·모바일웹·데스크톱웹·교사웹·관리자웹으로 퍼지는 구조를 디자이너·클라이언트와 맞춤' }, // summary
    { kind: '도구', title: '요소 지목 제보 위젯', body: '실제 화면 위 버튼·글자를 집어 제보 — 앱·웹·교사·관리자 4개 앱에 붙임' }, // improvements[1]
    { kind: '도구', title: '리뷰 보드', body: '본화면 55개 · 모달 39개를 세로·가로로 한 번에, 화면마다 코멘트 칸' }, // improvements[0]
    { kind: '인터랙션', title: '인터랙션 규칙', body: '채울 내용: 버튼 상태·전환 시간·모션 토큰 같은 규칙과 그걸 정한 이유', example: true },
  ],
  fair: [
    { kind: '시스템', title: '디자인 시스템 핸드오프', body: '기능명세 → 사용 가이드 → 디자인 시스템 핸드오프(06.08)까지 직접' }, // improvements[0]
    { kind: '정보 구조', title: '역할별 화면 설계', body: '대표·임원·자문·사건 담당·직원마다 볼 수 있는 데이터와 화면을 다르게' }, // improvements[1]
    { kind: '모션', title: '제품 소개 영상 3편', body: '60초 홍보영상 · 업데이트 소개 2:17 · CRM 히어로 인트로 0:16 — 기획·스크립트·제작(Remotion)' }, // media-facts
    { kind: '시스템', title: '토큰·컴포넌트 표', body: '채울 내용: 색·글자·간격 토큰과 컴포넌트 목록 캡처(핸드오프 문서에서)', example: true },
  ],
  'cli-manager': [
    { kind: '인터랙션', title: 'AI 세션은 녹색', body: '다른 AI가 연 세션을 녹색으로 표시해 언제든 확인하고 개입' }, // improvements[0]
    { kind: '모션', title: '시연 영상 3편', body: '워크트리 0:14 · 커밋 & 푸시 0:13 · 템플릿 0:21 — 시나리오 화면 녹화' }, // media-facts
    { kind: '제품', title: '57번 릴리스', body: '10개월 동안 기획·개발·릴리스·랜딩·마케팅을 혼자' }, // summary + metrics
    { kind: '인터랙션', title: '화면 설계 노트', body: '채울 내용: 터미널 10개를 한 화면에 — 사이드바·탭·상태 표시를 어떻게 정했는지', example: true },
  ],
  automation: [
    { kind: '도구', title: '피드백 위젯 · 라쏘런', body: '문서·테스트케이스·제보를 한 흐름으로 관리하는 사내 플랫폼' }, // summary + facts
    { kind: '모션', title: '소개 영상 2편', body: 'Symphony 소개 2:58 · Feedback Kit 소개 0:40 — 기획·스크립트·제작' }, // media-facts
    { kind: '정보 구조', title: '대시보드 설계', body: '채울 내용: 「개발자 아니어도 관리가 되면」이라는 요청을 화면으로 바꾼 과정', example: true },
  ],
  purple: [
    { kind: '데이터 구조', title: '문항 재사용 구조', body: '퀴즈에 묶인 문항을 따로 관리하고 퀴즈와 연결하는 구조로 재설계' }, // summary
    { kind: '정보 구조', title: '관리자 화면 구성', body: '채울 내용: 퀴즈 17종 × 문항 16타입을 한 편집기에서 다루게 한 화면 구성', example: true },
  ],
  porterx: [
    { kind: '제품', title: '앱 디자인 · 운영', body: '역할: 앱 기능 · 디자인 · 운영 대응 — 출시 후 운영 이슈를 가장 많이 다룸' }, // facts + summary
    { kind: '인터랙션', title: '미션 매칭 흐름', body: '채울 내용: 여행자 동선과 구매 요청을 잇는 화면 흐름(홈 → 미션 → 크레딧)', example: true },
  ],
  ncdigitec: [
    { kind: '리디자인', title: '자사몰 리디자인 리드', body: '디자이너·고객 피드백을 반영하는 사이클 운영' }, // facts + summary
    { kind: '도구', title: '디자이너가 직접 설치하는 피드백 도구', body: '들어온 제보를 모아 반영하고 반영 목록으로 공유' }, // summary
    { kind: '리디자인', title: '전후 비교', body: '채울 내용: 메인·GNB 리디자인 전후 캡처 한 쌍', example: true },
  ],
  content: [
    { kind: '자동화', title: '카드뉴스 자동 제작', body: '리서치·팩트체크·카피·렌더·캡션 → Threads·X·Instagram 동시 발행' }, // summary
    { kind: '모션', title: '브랜드 필름', body: 'Cardnews 브랜드 필름 0:30 — 기획·스크립트·제작(캐릭터 권리 미확인)' }, // media-facts
    { kind: '시스템', title: '템플릿 디자인 시스템', body: '채울 내용: 카드 템플릿을 어떤 규칙(격자·글자·색)으로 늘렸는지', example: true },
  ],
};

// 「일하며 배운 것」 — 각 프로젝트의 lesson 을 그대로 모은다(새로 쓴 문장 없음)
export function getNotes() {
  const t = getContent('ko');
  return t.work.projects
    .filter((p) => p.lesson)
    .map((p) => ({ id: p.id, project: p.name, title: p.lesson!.title, body: p.lesson!.body }));
}
