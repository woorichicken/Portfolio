import { OpError, setHidden } from '@/content/ops';
import { readJson, route, write, type Expect } from '@/lib/content-api';

// PATCH /api/content/hidden — { hide?: [id…], show?: [id…] }. 숨긴 항목은 역할 화면·비슷한 작품에서 빠진다(상세 주소는 남는다)
export const dynamic = 'force-dynamic';

export const PATCH = route(async (req) => {
  const body = await readJson<{ hide?: string[]; show?: string[]; expect?: Expect }>(req);
  if (!body.hide?.length && !body.show?.length) throw new OpError(400, 'bad_request', 'hide 또는 show 에 id 를 주세요');
  return write(req, { action: 'hide', summary: [body.hide?.length && `숨김 ${body.hide.join(',')}`, body.show?.length && `보임 ${body.show.join(',')}`].filter(Boolean).join(' · '), expect: body.expect }, (docs) => setHidden(docs, body));
});
