import { toJsonLdString } from '@/lib/structured-data';

// 검색엔진·AI 가 읽는 구조화 데이터. 화면에는 보이지 않는다.
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdString(data) }} />;
}
