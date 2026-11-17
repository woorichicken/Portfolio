'use client';

import { useEffect } from 'react';

// 인트로를 누르거나 아무 키나 누르면 바로 걷어 낸다. 인트로가 안 나온 방문에서는 아무것도 하지 않는다.
// id 는 IntroSting.tsx 의 INTRO_ELEMENT_ID 와 같다(서버 컴포넌트 파일을 클라이언트에서 불러오지 않으려고 따로 적는다).
const INTRO_ELEMENT_ID = 'intro-sting';

export default function IntroSkip() {
  useEffect(() => {
    const intro = document.getElementById(INTRO_ELEMENT_ID);
    if (!intro || intro.dataset.play !== '1') return;

    const skip = (event: Event) => {
      if (intro.dataset.play !== '1') return;
      // 건너뛰려고 누른 것이 뒤의 역할 칸까지 눌러 버리지 않게 한다
      event.preventDefault();
      intro.dataset.play = 'done';
    };
    // 끝까지 다 돌았으면 done 으로 바꿔 둔다 — 안 그러면 다 사라진 뒤에도 Tab 같은 키를 skip 이 삼킨다
    const finish = (event: AnimationEvent) => {
      if (event.target === intro && event.animationName === 'intro-out') intro.dataset.play = 'done';
    };
    intro.addEventListener('pointerdown', skip);
    intro.addEventListener('animationend', finish);
    window.addEventListener('keydown', skip);
    return () => {
      intro.removeEventListener('pointerdown', skip);
      intro.removeEventListener('animationend', finish);
      window.removeEventListener('keydown', skip);
    };
  }, []);
  return null;
}
