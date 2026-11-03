import type { Locale } from '@/i18n/config';
import { shot, type ImageId, type Shot } from './images';
import type { ArtifactKind } from './types';

// 「디자인 엔지니어로서」 결과물 — 역할 화면의 「만든 화면과 도구」 행과 프로젝트 상세의 「화면」 탭이 같이 쓴다.
// 결과물만 모은 화면(/design)은 없앴다(2026-11-03 A안 — 홈 행과 겹쳤다). 옛 주소는 next.config.ts 가 역할 화면으로 보낸다.
// 설명 없이 그림 + 짧은 이름만 보여 준다(2026-10 시안 리뷰 「결과물만」).
// - 사진은 콘텐츠에 이미 있는 것만 쓴다(images.ts).
// - 영상은 공개 권리 확인 전이라 넣지 않았다(리뷰 X1 「일단 보류」). 포스터는 보류 브랜치 feat/design-engineer-261004 에 있다.
// - 자료가 아직 없는 자리(「예시」 점선 칸)는 지웠다 — 피드백 모드에서도 방문자와 같은 화면을 본다(2026-11-02 피드백 0b0a478c).
//   채울 자리 목록은 docs/backlog.md 「결과물 — 자료를 채울 자리」에 있다.

type Localized = Record<Locale, string>;

export type ArtifactDef = { kind: ArtifactKind; title: Localized; image: ImageId };

/** 화면에 그릴 때의 모양 — 언어가 정해진 뒤 */
export type Artifact = { kind: ArtifactKind; title: string; shot: Shot };

const t = (ko: string, en: string, es: string): Localized => ({ ko, en, es });

export const PROJECT_ARTIFACTS: Record<string, ArtifactDef[]> = {
  kits: [
    { kind: 'tool', title: t('리뷰 보드', 'Review board', 'Tablero de revisión'), image: 'kits_board_top' },
    { kind: 'tool', title: t('요소 지목 제보 위젯', 'Point-and-report widget', 'Widget para señalar y reportar'), image: 'kits_picker_top' },
  ],
  'cli-manager': [
    { kind: 'screen', title: t('AI 세션은 녹색', 'AI sessions in green', 'Sesiones de IA en verde'), image: 'cli_green' },
  ],
  purple: [
    { kind: 'screen', title: t('퀴즈 편집기', 'Quiz editor', 'Editor de cuestionarios'), image: 'pur_quiz' },
    { kind: 'screen', title: t('CRUD 왕복 매트릭스', 'CRUD round-trip matrix', 'Matriz CRUD de ida y vuelta'), image: 'pur_matrix' },
  ],
  porterx: [
    { kind: 'screen', title: t('미션·크레딧', 'Missions & credits', 'Misiones y créditos'), image: 'ptx_credit' },
    { kind: 'screen', title: t('커뮤니티', 'Community', 'Comunidad'), image: 'ptx_comm' },
  ],
  // content(콘텐츠 자동화)는 콘텐츠 파일에서 주석 처리돼 있다. 다시 켤 때 아래도 함께 푼다.
  // content: [
  //   { kind: 'system', title: t('카드뉴스 템플릿', 'Card news template', 'Plantilla de tarjetas'), image: 'cli_card' },
  // ],
};

/** 특정 프로젝트에 묶이지 않는 결과물 — 「만든 화면과 도구」 행의 첫 칸 */
export const STANDALONE_ARTIFACTS: ArtifactDef[] = [
  { kind: 'system', title: t('디자인 아틀라스', 'Design Atlas', 'Design Atlas'), image: 'design_atlas' },
];

export function localizeArtifact(def: ArtifactDef, locale: Locale): Artifact {
  const title = def.title[locale];
  return { kind: def.kind, title, shot: shot(def.image, title) };
}

export function projectArtifacts(projectId: string, locale: Locale): Artifact[] {
  return (PROJECT_ARTIFACTS[projectId] ?? []).map((d) => localizeArtifact(d, locale));
}

export function standaloneArtifacts(locale: Locale): Artifact[] {
  return STANDALONE_ARTIFACTS.map((d) => localizeArtifact(d, locale));
}
