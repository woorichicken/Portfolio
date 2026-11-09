import { LOCALES, type Locale } from '@/i18n/config';
import { OpError, getAt } from '@/content/ops';
import { authorize, ok, openStore, route } from '@/lib/content-api';

// GET /api/content/doc/<ko|en|es|roles|hidden>[?path=work.projects[kits].tagline] — 문서 통째 또는 칸 하나
export const dynamic = 'force-dynamic';

export const GET = route(async (req, { params }) => {
  await authorize(req);
  const { key } = (await params) as { key: string };
  const { base } = await openStore();
  const path = new URL(req.url).searchParams.get('path');
  let doc: unknown;
  let docKey: string;
  if ((LOCALES as readonly string[]).includes(key)) {
    doc = base.content[key as Locale];
    docKey = `content:${key}`;
  } else if (key === 'roles' || key === 'hidden') {
    doc = base[key];
    docKey = key;
  } else throw new OpError(404, 'not_found', `모르는 문서: ${key} — ko · en · es · roles · hidden`);
  return ok({ key: docKey, version: base.versions[docKey as keyof typeof base.versions], path, value: path ? getAt(doc, path) : doc });
});
