import Portfolio from '@/components/Portfolio';
import { buildMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';
export const metadata = buildMetadata('ko');

export default function KoreanHome() {
  return <Portfolio locale="ko" />;
}
