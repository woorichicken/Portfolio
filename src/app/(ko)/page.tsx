import JsonLd from '@/components/JsonLd';
import RolePicker from '@/components/screen/RolePicker';
import { buildMetadata } from '@/lib/metadata';
import { buildPersonJsonLd } from '@/lib/structured-data';

export { viewport } from '@/lib/metadata';
export const metadata = buildMetadata('ko');

export default function KoreanHome() {
  return (
    <>
      <JsonLd data={buildPersonJsonLd('ko')} />
      <RolePicker locale="ko" />
    </>
  );
}
