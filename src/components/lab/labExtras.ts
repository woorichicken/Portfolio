import { getContent } from '@/content';
import type { Shot } from '@/content/images';

// 시안 A — 「디자인 엔지니어로서」 결과물 데이터.
// 5회차 코멘트 「설명은 빼고 결과물만」: 칸마다 이미지(또는 영상 포스터) + 짧은 이름만 둔다.
// 근거: 이미지는 콘텐츠 파일의 사진, 영상은 보류 브랜치 docs/media/media-facts.json 의 제목·길이.
// 자료가 없는 자리는 example — 화면에 점선 「예시」 이미지 칸으로 보이고, hint 는 리뷰 페이지에만 쓴다.

export type Kind = '영상' | '도구' | '시스템' | '화면';

export type LabVideo = { id: string; title: string; duration: string; poster: string; project?: string; note?: string };

export type Artifact =
  | { kind: Kind; title: string; shot: Shot; project?: string }
  | { kind: Kind; title: string; video: LabVideo; project?: string }
  | { kind: Kind; title: string; example: true; hint: string; project?: string };

export const VIDEOS: LabVideo[] = [
  { id: 'showreel', title: '쇼릴', duration: '1:04', poster: '/lab-media/showreel-poster.jpg' },
  { id: 'fair-promo', title: 'FAIR E-FM 60초 홍보영상', duration: '1:00', poster: '/lab-media/fair-promo.jpg', project: 'fair' },
  { id: 'fair-update', title: 'FAIR E-FM 업데이트 소개', duration: '2:17', poster: '/lab-media/fair-update.jpg', project: 'fair' },
  { id: 'fair-crm-intro', title: 'FAIR CRM 히어로 인트로', duration: '0:16', poster: '/lab-media/fair-crm-intro.jpg', project: 'fair' },
  { id: 'symphony', title: 'Symphony 소개', duration: '2:58', poster: '/lab-media/symphony.jpg', project: 'automation' },
  { id: 'feedback-kit', title: 'Feedback Kit 소개', duration: '0:40', poster: '/lab-media/feedback-kit.jpg', project: 'automation' },
  { id: 'cardnews-agent-film', title: 'Cardnews 브랜드 필름', duration: '0:30', poster: '/lab-media/cardnews-agent-film.jpg', project: 'content', note: '캐릭터 권리 미확인' },
  { id: 'cli-worktree', title: '워크트리 만들기', duration: '0:14', poster: '/lab-media/cli-worktree.jpg', project: 'cli-manager' },
  { id: 'cli-commit-push', title: '커밋 & 푸시', duration: '0:13', poster: '/lab-media/cli-commit-push.jpg', project: 'cli-manager' },
  { id: 'cli-templates', title: '템플릿', duration: '0:21', poster: '/lab-media/cli-templates.jpg', project: 'cli-manager' },
];

/** 콘텐츠 파일에 있는 사진을 이름(파일 id)으로 찾는다 — 사진을 새로 만들지 않는다 */
function shotOf(imageId: string): Shot {
  const t = getContent('ko');
  const all: Shot[] = [
    ...t.work.projects.flatMap((p) => [p.cover, ...(p.gallery ?? [])]),
    ...t.others.items.map((o) => o.shot),
    ...t.early.items.map((e) => e.shot),
  ];
  const found = all.find((s) => s.src === `/work/${imageId}.jpg`);
  if (!found) throw new Error(`콘텐츠에 없는 사진: ${imageId}`);
  return found;
}

const video = (id: string) => VIDEOS.find((v) => v.id === id)!;

// 프로젝트별 결과물. 상세의 「디자인 엔지니어링」 장과 「디자인 엔지니어로서」 화면이 같이 쓴다.
export const ARTIFACTS: Record<string, Artifact[]> = {
  kits: [
    { kind: '도구', title: '리뷰 보드', shot: shotOf('kits_board_top') },
    { kind: '도구', title: '요소 지목 제보 위젯', shot: shotOf('kits_picker_top') },
    { kind: '화면', title: '인터랙션 규칙', example: true, hint: '버튼 상태·전환 시간·모션 토큰 같은 규칙 한 장' },
  ],
  fair: [
    { kind: '영상', title: video('fair-promo').title, video: video('fair-promo') },
    { kind: '영상', title: video('fair-update').title, video: video('fair-update') },
    { kind: '영상', title: video('fair-crm-intro').title, video: video('fair-crm-intro') },
    { kind: '시스템', title: '토큰·컴포넌트 표', example: true, hint: '디자인 시스템 핸드오프(06.08) 문서의 토큰·컴포넌트 캡처' },
  ],
  'cli-manager': [
    { kind: '화면', title: 'AI 세션은 녹색', shot: shotOf('cli_green') },
    { kind: '영상', title: video('cli-worktree').title, video: video('cli-worktree') },
    { kind: '영상', title: video('cli-commit-push').title, video: video('cli-commit-push') },
    { kind: '영상', title: video('cli-templates').title, video: video('cli-templates') },
  ],
  automation: [
    { kind: '영상', title: video('symphony').title, video: video('symphony') },
    { kind: '영상', title: video('feedback-kit').title, video: video('feedback-kit') },
    { kind: '화면', title: '대시보드', example: true, hint: '「개발자 아니어도 관리가 되면」 요청을 반영한 대시보드 화면' },
  ],
  purple: [
    { kind: '화면', title: '퀴즈 편집기', shot: shotOf('pur_quiz') },
    { kind: '화면', title: 'CRUD 왕복 매트릭스', shot: shotOf('pur_matrix') },
  ],
  porterx: [
    { kind: '화면', title: '미션·크레딧', shot: shotOf('ptx_credit') },
    { kind: '화면', title: '커뮤니티', shot: shotOf('ptx_comm') },
    { kind: '화면', title: '미션 매칭 흐름', example: true, hint: '홈 → 미션 → 크레딧 화면 흐름도' },
  ],
  ncdigitec: [
    { kind: '도구', title: '화면 위 수정 피드백', shot: shotOf('ncd_ux') },
    { kind: '화면', title: '리디자인 전후', example: true, hint: '메인·GNB 리디자인 전후 캡처 한 쌍' },
  ],
  // 콘텐츠 자동화는 콘텐츠 파일에서 주석 처리돼 있다(2026-10-10 X2). 다시 켤 때 이 줄도 함께 푼다.
  // content: [
  //   { kind: '시스템', title: '카드뉴스 템플릿', shot: shotOf('cli_card') },
  //   { kind: '영상', title: video('cardnews-agent-film').title, video: video('cardnews-agent-film') },
  //   { kind: '시스템', title: '템플릿 규칙', example: true, hint: '카드 템플릿을 늘린 격자·글자·색 규칙 한 장' },
  // ],
};

/** 「디자인 엔지니어로서」 화면 전용 — 특정 프로젝트에 묶이지 않는 결과물 */
export const STANDALONE: Artifact[] = [
  { kind: '영상', title: '쇼릴', video: video('showreel') },
  { kind: '시스템', title: '디자인 아틀라스', shot: shotOf('design_atlas') },
  { kind: '시스템', title: '인터랙션 노트', example: true, hint: '화면마다 반복해 쓴 규칙 한 장(KITS 인터랙션 규칙과 합쳐도 됨)' },
];

/** 상세의 「화면」 장에서 「디자인 엔지니어링」에 이미 나온 사진은 빼고 보여 준다 */
export function usedShotSrcs(projectId: string): Set<string> {
  return new Set((ARTIFACTS[projectId] ?? []).flatMap((a) => ('shot' in a ? [a.shot.src] : [])));
}
