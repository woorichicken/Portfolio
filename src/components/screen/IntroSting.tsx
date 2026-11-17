import Image from 'next/image';
import IntroSkip from './IntroSkip';

// 첫 화면 인트로 — 「들어올 때 MV 처럼 두둥」(제보 33013e08, 사이트 주인이 안 1 을 골랐다 2026-11-17).
// 검은 화면에서 SOLHUN 글자가 흩어졌다 모이고 한 번 「두둥」 튄 뒤 사라진다. 약 1.5초 · 소리 없음 · CSS 만.
//
// 언제 나오나를 서버가 아니라 이 브라우저가 정한다(첫 방문만 · 움직임 줄이기 설정이면 안 나옴).
// 그래서 칠하기 전에 도는 인라인 스크립트가 data-play 를 단다 — 하이드레이션 뒤 클라이언트 컴포넌트가 정하면
// 역할 고르기 화면이 먼저 한 번 보였다가 검은 화면이 덮어 오히려 깜빡인다.
export const INTRO_SEEN_KEY = 'solhun:intro-seen';
export const INTRO_ELEMENT_ID = 'intro-sting';

const WORD = 'SOLHUN';

// 저장소가 막힌 브라우저(사생활 보호 창 등)는 「봤는지」를 기억 못 해 매번 나오게 되므로 아예 틀지 않는다.
const PLAY_SCRIPT = `(function(){try{var e=document.getElementById('${INTRO_ELEMENT_ID}');if(!e)return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(localStorage.getItem('${INTRO_SEEN_KEY}'))return;localStorage.setItem('${INTRO_SEEN_KEY}','1');e.setAttribute('data-play','1')}catch(_){}})();`;

export default function IntroSting() {
  return (
    <>
      {/* data-play 는 위 스크립트가 하이드레이션 전에 단다 — 서버 HTML 과 달라서 경고를 끈다 */}
      <div id={INTRO_ELEMENT_ID} className="intro-sting" aria-hidden="true" suppressHydrationWarning>
        <div className="intro-mark">
          <Image className="intro-sloth" src="/brand/solhun-sloth-96.png" alt="" width={64} height={64} priority />
          <span className="intro-word">
            {WORD.split('').map((letter, index) => (
              <span key={index} style={{ '--i': index } as React.CSSProperties}>
                {letter}
              </span>
            ))}
          </span>
          <span className="intro-line" />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: PLAY_SCRIPT }} />
      <IntroSkip />
    </>
  );
}
