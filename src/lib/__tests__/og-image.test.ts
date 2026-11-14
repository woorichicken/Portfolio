import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { STATIC_DOCS } from '@/content/static-site';
import { LOCALES } from '@/i18n/config';
import { buildMetadata } from '../metadata';

// 제보 5567b8b0 「카카오톡 등 링크 미리보기 화면 점검 필요」 — 홈 미리보기 그림이 KITS 앱 사진(대표작 표지)이라
// 링크를 받은 사람에게 내 사이트가 아니라 KITS 광고처럼 보였다. 홈은 사이트 전용 그림(언어별)을 쓴다.
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const PUBLIC_DIR = fileURLToPath(new URL('../../../public', import.meta.url));

// PNG 머리(IHDR)의 가로·세로 — 메타에 적은 크기와 실제 파일이 어긋나면 일부 미리보기가 그림을 버린다
function pngSize(path: string): { width: number; height: number } {
  const buf = readFileSync(path);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('홈 링크 미리보기 그림', () => {
  for (const locale of LOCALES) {
    it(`${locale}: 대표작 표지가 아니라 그 언어의 전용 그림을 1200×630 으로 건다`, () => {
      const meta = buildMetadata(STATIC_DOCS, locale);
      const images = meta.openGraph?.images as { url: string; width: number; height: number; alt?: string }[];
      expect(images).toHaveLength(1);
      expect(images[0]).toMatchObject({ url: `/og/home-${locale}.png`, width: OG_WIDTH, height: OG_HEIGHT });
      expect(images[0].alt).toBeTruthy();
      // 트위터·X 도 같은 그림 — 안 적으면 summary_large_image 카드가 그림 없이 뜬다
      expect((meta.twitter as { images?: unknown }).images).toEqual([`/og/home-${locale}.png`]);
      expect(pngSize(`${PUBLIC_DIR}/og/home-${locale}.png`)).toEqual({ width: OG_WIDTH, height: OG_HEIGHT });
    });
  }
});
