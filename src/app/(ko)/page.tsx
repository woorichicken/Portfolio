import JsonLd from '@/components/JsonLd';
import Portfolio from '@/components/Portfolio';
import { buildMetadata } from '@/lib/metadata';
import { buildPersonJsonLd } from '@/lib/structured-data';

export { viewport } from '@/lib/metadata';
export const metadata = buildMetadata('ko');

export default function KoreanHome() {
  return (
    <>
      <JsonLd data={buildPersonJsonLd('ko')} />
      <Portfolio locale="ko" />
    </>
  );
}
