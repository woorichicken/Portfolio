import type { Locale } from '@/i18n/config';

// 리브랜딩(2026-11, 스탠드업 메모 「solhun rebranding」) — 들어오면 「어떤 역할의 저를 볼지」 고르고,
// 그 역할에 맞는 순서로 대표작·행을 보여 준다. 어떤 프로젝트를 어느 역할에 몇 번째로 둘지는 이 파일 한 곳에서 정한다.
// ⚠️ 2026-11-08 부터 ROLES·HIDDEN 은 D1 의 시드값이다 — 사이트는 D1 의 roles·hidden 문서를 읽는다. 순서·숨김은 어드민 「저장」이나
// `pnpm content role …`·`hide …` 로 바꾼다(여기를 고쳐도 사이트는 안 바뀐다). SCREEN(화면 글)은 그대로 코드에 있다.

type Localized = Record<Locale, string>;
const t = (ko: string, en: string, es: string): Localized => ({ ko, en, es });

/** 고를 수 있는 역할. all 은 타일에 없고 「전부 볼게요」 링크로 간다 */
export const ROLE_IDS = ['design', 'product', 'ax', 'maker', 'all'] as const;
export type RoleId = (typeof ROLE_IDS)[number];
export const PICKABLE_ROLES = ['design', 'product', 'ax', 'maker'] as const satisfies readonly RoleId[];

export function isRoleId(value: string): value is RoleId {
  return (ROLE_IDS as readonly string[]).includes(value);
}

export type RoleDef = {
  name: Localized;
  /** 역할 타일 아래 한 줄 */
  blurb: Localized;
  /** 대표작 행 제목 */
  rowTitle: Localized;
  /** 빌보드에 올릴 큰 프로젝트 id */
  featured: string;
  /** 큰 프로젝트(work.projects) 순서 — 빠진 것은 이 역할에서 안 보인다 */
  projects: string[];
  /** 「그 외」 프로젝트 slug 순서 */
  others: string[];
  /** 「라이트소프트 이전」을 보여 줄지 */
  early: boolean;
  /** 결과물 행에 프로젝트에 묶이지 않은 결과물(디자인 아틀라스 등)을 앞에 둘지 */
  standaloneArtifacts: boolean;
  /** 「오픈소스」 행을 보여 줄지(본문 openSource.items) — 없으면 안 보인다(2026-11-10 추가 · 옛 문서도 그대로 통과) */
  openSource?: boolean;
  /** 「만든 영상」 행을 보여 줄지(본문 videos.items) */
  videos?: boolean;
};

// 2026-11-10 운영과 맞춤 — 역할 재배치 A안(한 작품은 주 역할 하나 · 겹침은 역할마다 1개까지, 팀장이 운영 API 로 반영)과
// 새 행(오픈소스: maker · all / 만든 영상: design · all). 운영에서 바꾸면 여기도 같이 바꿔 로컬 시드가 운영 모양을 따라가게 한다.
export const ROLES: Record<RoleId, RoleDef> = {
  design: {
    name: t('디자인 엔지니어', 'Design engineer', 'Ingeniero de diseño'),
    blurb: t('화면을 코드로 맞추고 검수 도구까지 만듭니다', 'I match screens in code and build the review tools too', 'Ajusto pantallas en código y también hago las herramientas de revisión'),
    rowTitle: t('화면과 검수를 맡은 프로젝트', 'Projects where I owned screens and review', 'Proyectos donde llevé pantallas y revisión'),
    featured: 'kits',
    projects: ['kits', 'ncdigitec', 'porterx'],
    others: ['design-atlas', 'bigdatahub-webzine', 'lightsoft-web'],
    early: false,
    standaloneArtifacts: true,
    videos: true,
  },
  product: {
    name: t('서비스 개발자', 'Product developer', 'Desarrollador de producto'),
    blurb: t('기획부터 운영까지, 서비스 하나를 끝까지 맡습니다', 'I take one service all the way, from planning to operations', 'Llevo un servicio de principio a fin, del plan a la operación'),
    rowTitle: t('처음부터 끝까지 맡은 서비스', 'Services I carried end to end', 'Servicios que llevé de principio a fin'),
    featured: 'fair',
    projects: ['fair', 'purple', 'porterx'],
    others: ['dolphin-crm', 'motion-meme'],
    early: true,
    standaloneArtifacts: false,
  },
  ax: {
    name: t('AX · 자동화', 'AI automation (AX)', 'Automatización con IA (AX)'),
    blurb: t('반복되는 일을 AI 에이전트와 도구로 바꿉니다', 'I turn repeated work into AI agents and tools', 'Convierto el trabajo repetido en agentes de IA y herramientas'),
    rowTitle: t('AI로 일하는 방식을 바꾼 프로젝트', 'Projects that changed how work gets done with AI', 'Proyectos que cambiaron el trabajo con IA'),
    featured: 'automation',
    projects: ['automation', 'fair'],
    others: ['youtube-manager', 'light-archive'],
    early: false,
    standaloneArtifacts: false,
  },
  maker: {
    name: t('1인 제작자', 'Solo maker', 'Creador independiente'),
    blurb: t('제가 쓰려고 만든 것을 제품으로 내놓습니다', 'I ship what I first built for myself', 'Lanzo como producto lo que primero hice para mí'),
    rowTitle: t('직접 만들어 내놓은 것', 'Things I built and shipped myself', 'Lo que construí y lancé yo mismo'),
    featured: 'cli-manager',
    projects: ['cli-manager'],
    others: ['design-atlas', 'switch-on'],
    early: true,
    standaloneArtifacts: true,
    openSource: true,
  },
  all: {
    name: t('전체', 'Everything', 'Todo'),
    blurb: t('모든 프로젝트를 한 번에 봅니다', 'Every project at once', 'Todos los proyectos a la vez'),
    rowTitle: t('전체 프로젝트', 'All projects', 'Todos los proyectos'),
    featured: 'kits',
    projects: ['kits', 'fair', 'cli-manager', 'automation', 'purple', 'porterx', 'ncdigitec'],
    others: ['design-atlas', 'switch-on', 'dolphin-crm', 'bigdatahub-webzine', 'light-archive', 'motion-meme', 'youtube-manager', 'lightsoft-web'],
    early: true,
    standaloneArtifacts: true,
    openSource: true,
    videos: true,
  },
};

/** 어디에서도 보이지 않게 할 항목(id·slug). 어드민의 「숨김」이 여기로 온다 */
export const HIDDEN: string[] = [];

/** 화면 글 — 콘텐츠 파일(ko·en·es.ts)에 없는 리브랜딩 화면의 말. 세 언어를 한 줄에 둔다 */
export const SCREEN = {
  // 「정경훈」보다 브랜드 이름이 더 설득력 있다(2026-11-02 피드백). 사람 소개는 「정경훈 소개」 창이 맡는다
  pickerTitle: t('어떤 SOLHUN을 볼까요?', 'Which SOLHUN would you like to see?', '¿Qué SOLHUN quieres ver?'),
  pickerAll: t('전부 볼게요', 'Show me everything', 'Quiero verlo todo'),
  pickerRecent: t('최근에 본 역할', 'Last viewed', 'Visto la última vez'),
  aboutMe: t('정경훈 소개', 'About me', 'Sobre mí'),
  close: t('닫기', 'Close', 'Cerrar'),
  proof: t('숫자 근거', 'The numbers', 'Las cifras'),
  switchRole: t('역할 바꾸기', 'Switch role', 'Cambiar de rol'),
  viewingAs: t('보는 중', 'Viewing as', 'Viendo como'),
  featured: t('대표작', 'Featured', 'Destacado'),
  moreInfo: t('자세히 보기', 'More info', 'Más información'),
  openSite: t('사이트 열기', 'Open site', 'Abrir sitio'),
  artifactsRow: t('만든 화면과 도구', 'Screens and tools I made', 'Pantallas y herramientas que hice'),
  openSourceRow: t('오픈소스', 'Open source', 'Código abierto'),
  videosRow: t('만든 영상', 'Videos I made', 'Videos que hice'),
  viewCode: t('코드 보기', 'View code', 'Ver código'),
  visitSite: t('사이트', 'Website', 'Sitio web'),
  aboutProject: t('프로젝트 보기', 'See the project', 'Ver el proyecto'),
  prevRow: t('이전 항목', 'Previous items', 'Anteriores'),
  nextRow: t('다음 항목', 'Next items', 'Siguientes'),
  tabHome: t('홈', 'Home', 'Inicio'),
  tabContact: t('연락', 'Contact', 'Contacto'),
  menu: t('메뉴', 'Menu', 'Menú'),
  backToList: t('목록으로', 'Back to list', 'Volver a la lista'),
  newTab: t('(새 탭)', '(opens in a new tab)', '(se abre en una pestaña nueva)'),
  openOriginal: t('원본 열기', 'Open original', 'Abrir original'),
  emailMe: t('메일 보내기', 'Email me', 'Escríbeme'),
  tabsLabel: t('프로젝트 정보', 'Project sections', 'Secciones del proyecto'),
  tabOverview: t('개요', 'Overview', 'Resumen'),
  tabChanges: t('맡은 일', 'My part', 'Mi parte'),
  specials: t('특별편 — 바꾼 것', 'Specials — what I changed', 'Especiales — lo que cambié'),
  tabScreens: t('화면', 'Screens', 'Pantallas'),
  tabSimilar: t('비슷한 작품', 'More like this', 'Similares'),
  tabDetails: t('자세히', 'Details', 'Detalles'),
  voices: t('함께 일한 사람들의 말', 'What people said', 'Lo que dijeron'),
  lesson: t('배운 점', 'What I learned', 'Lo que aprendí'),
  links: t('링크', 'Links', 'Enlaces'),
  aboutOf: t('{name} 상세 정보', 'About {name}', 'Sobre {name}'),
  history: t('지나온 일', 'History', 'Historia'),
  devhoonNote: t('대학생 개발팀 시절', 'Student dev team', 'Equipo de estudiantes'),
} as const;

export type ScreenKey = keyof typeof SCREEN;

export function screenCopy(locale: Locale): Record<ScreenKey, string> {
  return Object.fromEntries(Object.entries(SCREEN).map(([k, v]) => [k, v[locale]])) as Record<ScreenKey, string>;
}

/** 역할 이름 — 화면에서는 D1 의 roles 문서(docs.roles)를 쓴다. 여기 ROLES 는 시드값이다 */
export function roleNames(roles: Record<RoleId, RoleDef>, locale: Locale): Record<RoleId, string> {
  return Object.fromEntries(ROLE_IDS.map((r) => [r, roles[r].name[locale]])) as Record<RoleId, string>;
}
