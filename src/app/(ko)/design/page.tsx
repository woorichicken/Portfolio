import DesignWall from '@/components/DesignWall';
import { buildDesignMetadata } from '@/lib/metadata';

export { viewport } from '@/lib/metadata';
export const metadata = buildDesignMetadata('ko');

export default function KoreanDesign() {
  return <DesignWall locale="ko" />;
}
