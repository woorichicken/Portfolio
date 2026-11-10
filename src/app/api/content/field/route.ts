import { describeEdit, editField, type FieldEdit } from '@/content/ops';
import { readJson, route, write, type Expect } from '@/lib/content-api';

// PATCH /api/content/field — 본문 칸 하나 바꾸기
//   { path, locale, value }            한 언어 · 글자 고치기
//   { path, values: { ko, en, es } }   세 언어 한 번에(선택 칸을 새로 넣거나 목록 길이를 바꿀 때는 이것만 통과한다)
//   { path, unset: true, locales? }    선택 칸 지우기(locales 없으면 세 언어)
export const dynamic = 'force-dynamic';

export const PATCH = route(async (req) => {
  const body = await readJson<FieldEdit & { expect?: Expect }>(req);
  // 이력 한 줄 — 객체를 통째로 넣으면(어드민 항목 저장) 그 안에서 바뀐 칸 이름과 언어까지(describeEdit)
  return write(req, { action: 'set', summary: (next, base) => describeEdit(base, next, body), expect: body.expect }, (docs) => editField(docs, body));
});
