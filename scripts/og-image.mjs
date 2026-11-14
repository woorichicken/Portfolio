#!/usr/bin/env node
// 홈 링크 미리보기 그림(public/og/home-<언어>.png, 1200×630)을 만든다 — 제보 5567b8b0.
//
// 왜 실제 첫 화면을 찍나: 그림 안의 역할 타일·글꼴·색을 따로 그리면 사이트를 바꿀 때마다 둘이 갈라진다.
// 첫 화면(「어떤 SOLHUN을 볼까요?」)을 그대로 찍고, 미리보기에서 누를 수 없는 것(언어 버튼·단추)만 숨긴 뒤
// 누구 사이트인지(이름 · 주소)를 아래에 한 줄 얹는다. 역할 이름은 운영 D1 에서 오므로 기본 주소는 운영이다.
//
//   node scripts/og-image.mjs                       # 운영(https://www.solhun.com)을 찍는다
//   node scripts/og-image.mjs --base http://127.0.0.1:3427   # 로컬 서버를 찍는다
//
// 역할 이름·첫 화면 디자인을 바꿨으면 배포 뒤 다시 돌려 커밋한다(그림은 빌드가 만들지 않는다 — Workers 에서
// next/og 를 돌리지 않으려고 정적 파일로 둔다).
import { mkdirSync, mkdtempSync, renameSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const LOCALE_PATHS = { ko: '/', en: '/en', es: '/es' };
const SITE_LABEL = 'solhun.com';
// 첫 화면 내용을 키우는 배율 — 1200 폭 안에 타일 4개가 넘치지 않는 선(스페인어 역할 이름이 가장 길다)
const CONTENT_ZOOM = 1.3;
// 카카오톡은 그림이 크면 받지 않는다(대략 수 MB) — 넉넉히 아래로 잡아 넘으면 멈춘다
const MAX_BYTES = 1_000_000;

const args = process.argv.slice(2);
const baseIndex = args.indexOf('--base');
const base = (baseIndex >= 0 ? args[baseIndex + 1] : 'https://www.solhun.com').replace(/\/$/, '');
const outDir = fileURLToPath(new URL('../public/og/', import.meta.url));
mkdirSync(outDir, { recursive: true });
// 세 장을 임시 폴더에 다 만든 뒤 한 번에 옮긴다 — 중간에 한 언어가 실패하면 세 장이 서로 다른 판이 된다
const stageDir = mkdtempSync(join(tmpdir(), 'solhun-og-'));
const made = [];

// 미리보기에서는 누를 수 없는 것을 숨기고, 화면 높이를 그림 높이에 맞춘다
const HIDE_CSS = `
  .lang-switch, .picker-actions, .picker-recent { display: none !important; }
  .picker { position: relative !important; min-height: ${OG_HEIGHT}px !important; height: ${OG_HEIGHT}px !important; }
  .picker-tile { pointer-events: none; }
  /* 카톡 말풍선에서는 그림이 250px 안팎으로 줄어든다 — 화면 그대로면 글자가 5px 가 된다 */
  .picker-top { zoom: ${CONTENT_ZOOM}; }
  .picker-main { zoom: ${CONTENT_ZOOM}; padding-bottom: 80px; }
  /* 제목은 화면(26px)보다 키운다 — 말풍선 폭에서도 「어떤 SOLHUN」이 읽히는 선 */
  .picker-title { font-size: 38px !important; margin-bottom: 30px !important; }
  .og-footer { position: absolute; left: 0; right: 0; bottom: 30px; text-align: center;
    font: 500 30px/1.4 var(--font-body); color: var(--text); opacity: 0.85; letter-spacing: 0.01em; }
  .og-footer b { font-weight: 700; opacity: 1; }
`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: OG_WIDTH, height: OG_HEIGHT }, deviceScaleFactor: 1 });
  for (const [locale, path] of Object.entries(LOCALE_PATHS)) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: HIDE_CSS });
    // 이름은 페이지의 구조화 데이터(Person)에서 — 언어별 표기를 여기서 다시 적지 않는다
    const name = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const data = JSON.parse(s.textContent ?? '');
          const person = [data, ...(data['@graph'] ?? [])].find((d) => d?.['@type'] === 'Person');
          if (person?.name) return person.name;
        } catch { /* 다른 JSON-LD 는 건너뛴다 */ }
      }
      return null;
    });
    if (!name) throw new Error(`${locale}: 구조화 데이터에서 이름을 못 찾았다`);
    await page.evaluate(({ name, label }) => {
      const footer = document.createElement('p');
      footer.className = 'og-footer';
      footer.innerHTML = `<b></b> · <span></span>`;
      footer.querySelector('b').textContent = name;
      footer.querySelector('span').textContent = label;
      document.querySelector('.picker').appendChild(footer);
    }, { name, label: SITE_LABEL });
    await page.evaluate(() => document.fonts.ready);
    // 셔터 직전 확인 — 타일 4개와 로고가 다 그려졌는지(덜 그린 화면을 커밋하지 않게)
    const ready = await page.evaluate(() => ({
      tiles: document.querySelectorAll('.picker-tile').length,
      // 닫힌 「소개」 창의 사진은 lazy 라 안 받아진다 — 화면에 보이는 로고만 본다
      logo: [...document.querySelectorAll('.wordmark img')].every((img) => img.complete && img.naturalWidth > 0),
    }));
    if (ready.tiles !== 4 || !ready.logo) throw new Error(`${locale}: 화면이 덜 그려졌다 ${JSON.stringify(ready)}`);
    const dest = join(stageDir, `home-${locale}.png`);
    await page.screenshot({ path: dest, clip: { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT } });
    const bytes = statSync(dest).size;
    if (bytes > MAX_BYTES) throw new Error(`${locale}: ${bytes}바이트 — 미리보기에 쓰기엔 크다`);
    made.push(locale);
    console.log(`${locale} → home-${locale}.png (${bytes} bytes, ${name})`);
  }
} finally {
  await browser.close();
}
for (const locale of made) renameSync(join(stageDir, `home-${locale}.png`), `${outDir}home-${locale}.png`);
console.log(`public/og/ 에 ${made.length}장을 옮겼다`);
