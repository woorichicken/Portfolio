import { addItem, type AddItem } from '@/content/ops';
import { readJson, route, write } from '@/lib/content-api';

// POST /api/content/projects — 프로젝트 추가. 세 언어(ko·en·es) item 을 한 번에 주고, 넣을 역할을 같이 줄 수 있다
//   { kind: 'project'|'other'|'early', item: { ko, en, es }, at?, roles?: [{ role, at? }] }
export const dynamic = 'force-dynamic';

export const POST = route(async (req) => {
  const body = await readJson<AddItem>(req);
  const id = body.item?.ko && ('id' in body.item.ko ? body.item.ko.id : body.item.ko.slug);
  return write(req, { action: 'add-project', summary: `추가 ${body.kind} ${id}${body.roles?.length ? ` → ${body.roles.map((r) => r.role).join('·')}` : ''}` }, (docs) => addItem(docs, body));
});
