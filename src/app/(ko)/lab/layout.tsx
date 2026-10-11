import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './lab.css';

// 디자인 시안 전용 구역. 검색에 걸리지 않게 막고, 사이트맵·메뉴 어디에도 연결하지 않는다.
export const metadata: Metadata = { title: '시안 — SOLHUN', robots: { index: false, follow: false } };

export default function LabLayout({ children }: { children: ReactNode }) {
  return children;
}
