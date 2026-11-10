// 주소·id 에 쓰는 이름의 규칙 한 곳 — 서버 검사(schema.ts SlugSchema)와 어드민 추가 폼의 즉석 검사가 같이 쓴다.
// 영문 소문자로 시작하는 이유: 경로 `others.items[999]` 의 `[999]` 는 배열 번호로 읽힌다(ops.ts parsePath).
// 숫자로만 된 slug 를 허용하면 그 항목은 편집 경로로 가리킬 수 없어 저장이 400 bad_path 가 된다(2026-11-10 수정 1회차).
export const SLUG_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
export const SLUG_MESSAGE = 'id·slug 는 영문 소문자로 시작하고 소문자·숫자·하이픈만 씁니다(예: my-project)';
