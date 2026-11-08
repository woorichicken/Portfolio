import { editField, type FieldEdit } from '@/content/ops';
import { readJson, route, write, type Expect } from '@/lib/content-api';

// PATCH /api/content/field — 본문 칸 하나 바꾸기
//   { path, locale, value }            한 언어 · 글자 고치기
//   { path, values: { ko, en, es } }   세 언어 한 번에(선택 칸을 새로 넣거나 목록 길이를 바꿀 때는 이것만 통과한다)
//   { path, unset: true, locales? }    선택 칸 지우기(locales 없으면 세 언어)
export const dynamic = 'force-dynamic';

export const PATCH = route(async (req) => {
  const body = await readJson<FieldEdit & { expect?: Expect }>(req);
  const where = 'locale' in body ? body.locale : 'values' in body ? Object.keys(body.values).join('·') : '세 언어';
  return write(req, { action: 'set', summary: `${'unset' in body ? '지움' : '고침'} ${body.path} (${where})`, expect: body.expect }, (docs) => editField(docs, body));
});
