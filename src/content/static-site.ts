import en from './en';
import es from './es';
import ko from './ko';
import { HIDDEN, ROLES } from './roles';
import type { SiteDocs } from './schema';

// D1 로 옮기기 전의 본문 — 저장소의 TS 파일 그대로. 쓰는 곳은 둘뿐이다:
//  1) 시드(scripts/seed-content.ts) — 빈 D1 에 처음 넣을 때
//  2) D1 이 없는 빌드(Vercel · CONTENT_SOURCE=static) — 옮기는 동안 지금 운영이 깨지지 않게
// D1 로 옮긴 뒤에 이 파일들을 고쳐도 사이트는 바뀌지 않는다. 본문은 API(`pnpm content …`)로 고친다.
export const STATIC_DOCS: SiteDocs = { content: { ko, en, es }, roles: ROLES, hidden: HIDDEN };
