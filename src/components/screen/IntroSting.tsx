import { introBoot, type IntroBootConfig } from './introBoot';

// 첫 화면 인트로 — 「들어올 때 MV 처럼 두둥」(제보 33013e08). 2026-11-18 사이트 주인이 시네마틱 스팅 v7 로 바꿨다
// (탐구 세션 6c00b625 에서 v1~v7 을 보고 골랐다. 원본 Remotion 소스: ~/Downloads/solhun-cinetic-intro · 컴포지션 Sting3).
// 7초: 세이지 커서 → S·O·L·H·U·N 타건 → 워드마크 → O 안에서 나무늘보가 솟고 카메라가 O 로 들어가 나무늘보 원으로 끝난다.
// 끝나면 그 원이 왼쪽 위 로고 그림 자리로 줄어들며 날아가 첫 화면으로 이어진다.
//
// 첫 방문만 · 소리 없이 자동재생(소리 켜기 단추) · 건너뛰기 단추·화면 누르기·Enter/Space/Esc ·
// 움직임 줄이기면 영상 대신 마지막 장면 한 장. 틀지 말지와 재생 제어는 introBoot.ts 가 칠하기 전에 인라인으로 한다.
export const INTRO_SEEN_KEY = 'solhun:intro-seen';
export const INTRO_ELEMENT_ID = 'intro-sting';

const BOOT: IntroBootConfig = {
  id: INTRO_ELEMENT_ID,
  seenKey: INTRO_SEEN_KEY,
  frame: { width: 1920, height: 1080 },
  // end 이미지(466×492)는 마지막 프레임의 (727, 351) 에 놓여 있다 — 두 그림을 픽셀 대조해 쟀다(평균 차이 4/255)
  endBox: { x: 727, y: 351, width: 466, height: 492 },
  // 이미지 안 나무늘보 원: 가로 4~461 · 아래 끝 491 → 지름 458, 가운데 (233, 262). 위로 삐친 털은 원 밖이다
  circle: { cx: 233, cy: 262, d: 458 },
  targetSelector: '.picker-top .wordmark img',
  startTimeoutMs: 3_000,
  stillMs: 1_600,
  flyMs: 700,
};

const BOOT_SCRIPT = `(${introBoot.toString()})(${JSON.stringify(BOOT)});`;

export default function IntroSting({ labels }: { labels: { skip: string; soundOn: string; soundOff: string } }) {
  return (
    <>
      {/* data-play·영상 주소는 위 스크립트가 하이드레이션 전에 단다 — 서버 HTML 과 달라서 경고를 끈다 */}
      <div id={INTRO_ELEMENT_ID} className="intro-sting" suppressHydrationWarning>
        <video className="intro-video" muted playsInline preload="none" aria-hidden="true" suppressHydrationWarning>
          {/* H.264 가 없는 브라우저(일부 리눅스 Firefox·오픈소스 Chromium)는 아래 WebM(VP9·Opus)을 고른다 */}
          <source data-src="/intro/solhun-sting-v7.mp4" type='video/mp4; codecs="avc1.640028, mp4a.40.2"' suppressHydrationWarning />
          <source data-src="/intro/solhun-sting-v7.webm" type='video/webm; codecs="vp9, opus"' suppressHydrationWarning />
        </video>
        {/* 마지막 장면 한 장 — 움직임 줄이기에서 영상 대신, 그리고 끝에서 로고 자리로 날아가는 그림. 18KB 라 늘 받아 둔다 */}
        {/* eslint-disable-next-line @next/next/no-img-element -- 스크립트가 영상 속 좌표에 px 로 맞춰 움직인다. next/image 의 감싸기·크기 계산이 끼면 안 된다 */}
        <img className="intro-end" src="/intro/solhun-sting-v7-end.webp" alt="" decoding="async" suppressHydrationWarning />
        <div className="intro-controls">
          <button type="button" className="intro-sound" aria-pressed="false" data-on={labels.soundOn} data-off={labels.soundOff} suppressHydrationWarning>
            {labels.soundOn}
          </button>
          <button type="button" className="intro-skip">{labels.skip}</button>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
    </>
  );
}
