'use client';

import { useEffect } from 'react';

// 인트로를 누르거나 Enter·Space·Esc 를 누르면 바로 걷어 낸다. 인트로가 안 나온 방문에서는 아무것도 하지 않는다.
// id 는 IntroSting.tsx 의 INTRO_ELEMENT_ID 와 같다(서버 컴포넌트 파일을 클라이언트에서 불러오지 않으려고 따로 적는다).
const INTRO_ELEMENT_ID = 'intro-sting';
// 건너뛰기로 받는 키 — Tab·새로고침(F5·Ctrl+R) 같은 다른 키는 그대로 브라우저에 보낸다
const SKIP_KEYS = new Set(['Enter', ' ', 'Escape']);

export default function IntroSkip() {
  useEffect(() => {
    const intro = document.getElementById(INTRO_ELEMENT_ID);
    if (!intro || intro.dataset.play !== '1') return;

    const markDone = () => {
      intro.dataset.play = 'done';
    };
    // 느린 기기에서 하이드레이션이 인트로(약 1.5초)보다 늦으면 animationend 가 이미 지나갔다 — 그때는 끝난 것으로 둔다
    if (getComputedStyle(intro).visibility === 'hidden') {
      markDone();
      return;
    }

    const skipByPointer = (event: PointerEvent) => {
      // 건너뛰려고 누른 것이 뒤의 역할 칸까지 눌러 버리지 않게 한다
      event.preventDefault();
      markDone();
    };
    const skipByKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || !SKIP_KEYS.has(event.key)) return;
      markDone();
    };
    // 끝까지 다 돌았으면 done 으로 바꾸고 더 듣지 않는다
    const finish = (event: AnimationEvent) => {
      if (event.target === intro && event.animationName === 'intro-out') cleanup();
    };
    const cleanup = () => {
      markDone();
      intro.removeEventListener('pointerdown', skipByPointer);
      intro.removeEventListener('animationend', finish);
      window.removeEventListener('keydown', skipByKey);
    };
    intro.addEventListener('pointerdown', skipByPointer);
    intro.addEventListener('animationend', finish);
    window.addEventListener('keydown', skipByKey);
    return () => {
      intro.removeEventListener('pointerdown', skipByPointer);
      intro.removeEventListener('animationend', finish);
      window.removeEventListener('keydown', skipByKey);
    };
  }, []);
  return null;
}
