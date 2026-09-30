import { Unbounded } from 'next/font/google';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import '@/app/globals.css';

// 참고 배너(JEONG (SOLHUN))의 넓은 기하 대문자 느낌을 내는 서체. 로마자 제목·숫자에만 쓴다.
const display = Unbounded({ subsets: ['latin', 'latin-ext'], weight: ['500', '700', '800'], variable: '--font-display', display: 'swap' });

// 언어마다 루트 레이아웃이 달라야 <html lang> 을 정확히 줄 수 있어서, 공통 뼈대를 여기 둔다.
export default function Document({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale} className={display.variable}>
      {/* App Router 루트 레이아웃의 <head> 는 정상 사용이다 — 이 규칙은 pages 라우터용 */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* 한글·로마자 본문 서체. 쓰는 글자만 받아 오는 dynamic subset 판이라 첫 로딩이 가볍다 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
