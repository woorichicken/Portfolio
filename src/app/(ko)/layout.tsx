import type { ReactNode } from 'react';
import Document from '@/components/Document';

export default function KoreanRootLayout({ children }: { children: ReactNode }) {
  return <Document locale="ko">{children}</Document>;
}
