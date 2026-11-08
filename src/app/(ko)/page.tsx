import JsonLd from '@/components/JsonLd';
import RolePicker from '@/components/screen/RolePicker';
import { getSite } from '@/content/store';
import { buildMetadata } from '@/lib/metadata';
import { buildPersonJsonLd } from '@/lib/structured-data';

export { viewport } from '@/lib/metadata';

export async function generateMetadata() {
  return buildMetadata(await getSite(), 'ko');
}

export default async function KoreanHome() {
  const site = await getSite();
  return (
    <>
      <JsonLd data={buildPersonJsonLd(site, 'ko')} />
      <RolePicker site={site} locale="ko" />
    </>
  );
}
