// 첫 화면 인트로(IntroSting.tsx)를 트는 스크립트 — 칠하기 전에 인라인으로 돈다.
//
// 왜 React(하이드레이션) 가 아니라 인라인인가:
//  - 틀지 말지를 칠하기 전에 정해야 역할 고르기 화면이 한 번 보였다가 검은 화면이 덮는 깜빡임이 없다.
//  - 영상 끝·건너뛰기·소리 켜기가 하이드레이션 시점과 상관없이 돌아야 한다(느린 기기에서 인트로가 끝나도 안 걷히면 화면이 막힌다).
// 이 함수는 toString() 으로 HTML 에 그대로 박힌다 — 밖의 변수·import 를 쓰면 브라우저에서 깨진다. 필요한 값은 전부 cfg 로 받는다.

export type IntroBootConfig = {
  id: string;
  seenKey: string;
  /** 영상 1920×1080 위에서 마지막 장면 그림(end 이미지)의 왼쪽 위 · 크기 — 이미지를 영상 마지막 프레임과 대조해 쟀다 */
  frame: { width: number; height: number };
  endBox: { x: number; y: number; width: number; height: number };
  /** end 이미지 안에서 나무늘보 원의 가운데 · 지름 — 날아가서 로고 자리에 맞출 기준 */
  circle: { cx: number; cy: number; d: number };
  /** 날아가 앉을 자리(첫 화면 왼쪽 위 로고 그림) */
  targetSelector: string;
  /** 영상이 이 시간 안에 시작 못 하면(느린 회선·자동재생 막힘) 인트로를 접는다 */
  startTimeoutMs: number;
  /** 움직임 줄이기일 때 마지막 장면 그림을 보여 주는 시간 */
  stillMs: number;
  flyMs: number;
};

export function introBoot(cfg: IntroBootConfig) {
  try {
    const root = document.getElementById(cfg.id);
    if (!root) return;
    // 저장소가 막힌 브라우저(사생활 보호 창 등)는 「봤는지」를 기억 못 해 매번 나오게 되므로 아예 틀지 않는다(아래 setItem 이 던진다)
    if (localStorage.getItem(cfg.seenKey)) return;
    localStorage.setItem(cfg.seenKey, '1');

    const intro = root;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const video = intro.querySelector('video') as HTMLVideoElement;
    const endImg = intro.querySelector('.intro-end') as HTMLImageElement;
    const sound = intro.querySelector('.intro-sound') as HTMLButtonElement;
    const skip = intro.querySelector('.intro-skip') as HTMLButtonElement;
    let finished = false;
    const timers: number[] = [];

    const placeEnd = function () {
      // 영상은 화면에 object-fit: contain 으로 들어간다 — 같은 비율로 end 이미지를 영상 속 그 자리에 겹친다
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min(w / cfg.frame.width, h / cfg.frame.height);
      const left = (w - cfg.frame.width * s) / 2 + cfg.endBox.x * s;
      const top = (h - cfg.frame.height * s) / 2 + cfg.endBox.y * s;
      endImg.style.left = left + 'px';
      endImg.style.top = top + 'px';
      endImg.style.width = cfg.endBox.width * s + 'px';
      endImg.style.height = cfg.endBox.height * s + 'px';
      endImg.style.transformOrigin = cfg.circle.cx * s + 'px ' + cfg.circle.cy * s + 'px';
      return { s: s, cx: left + cfg.circle.cx * s, cy: top + cfg.circle.cy * s };
    };

    const stopListening = function () {
      for (let i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      window.removeEventListener('keydown', onKey);
      intro.removeEventListener('pointerdown', onPointer);
    };

    const close = function () {
      intro.setAttribute('data-play', 'done');
    };

    // 끝 — fly 면 마지막 장면의 나무늘보 원이 왼쪽 위 로고 그림 자리로 줄어들며 날아간다. 아니면 그냥 걷힌다
    const finish = function (fly: boolean) {
      if (finished) return;
      finished = true;
      stopListening();
      video.pause();
      const target = fly ? document.querySelector(cfg.targetSelector) : null;
      const rect = target ? target.getBoundingClientRect() : null;
      if (!rect || !rect.width || typeof endImg.animate !== 'function') return close();
      const at = placeEnd();
      const k = rect.width / (cfg.circle.d * at.s);
      const dx = rect.left + rect.width / 2 - at.cx;
      const dy = rect.top + rect.height / 2 - at.cy;
      intro.setAttribute('data-play', 'fly');
      const flight = endImg.animate(
        [{ transform: 'none' }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')' }],
        { duration: cfg.flyMs, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' },
      );
      flight.onfinish = close;
      flight.oncancel = close;
    };

    // 건너뛰려고 누른 것이 뒤의 역할 칸까지 눌러 버리지 않게 한다. 소리 단추는 건너뛰기가 아니다
    const onPointer = function (event: PointerEvent) {
      if (event.target === sound || sound.contains(event.target as Node)) return;
      event.preventDefault();
      finish(false);
    };
    // Enter·Space·Esc 만 건너뛰기로 받는다 — Tab·새로고침(F5·Ctrl+R)은 그대로 브라우저에 보낸다.
    // 단추에 초점이 있으면 Enter·Space 는 그 단추의 일이다(소리 켜기를 눌렀는데 인트로가 꺼지면 안 된다)
    const onKey = function (event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Escape') return finish(false);
      if ((event.key === 'Enter' || event.key === ' ') && !intro.contains(document.activeElement)) finish(false);
    };
    intro.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    skip.addEventListener('click', function () {
      finish(false);
    });

    if (reduce) {
      // 움직임 줄이기 — 영상 대신 마지막 장면(나무늘보 원) 한 장만 잠깐 보여 주고 걷는다
      intro.setAttribute('data-play', 'still');
      placeEnd();
      timers.push(window.setTimeout(function () {
        finish(false);
      }, cfg.stillMs));
      return;
    }

    intro.setAttribute('data-play', '1');
    // 소리 있는 자동재생은 브라우저가 막는다 — 소리 없이 틀고, 「소리 켜기」를 누르면 그 자리에서 켠다(사람이 누른 순간이라 허용된다)
    sound.addEventListener('click', function () {
      video.muted = !video.muted;
      sound.setAttribute('aria-pressed', video.muted ? 'false' : 'true');
      sound.textContent = (video.muted ? sound.dataset.on : sound.dataset.off) || '';
    });
    video.addEventListener('ended', function () {
      finish(true);
    });
    video.addEventListener('error', function () {
      finish(false);
    });
    // 회선이 느려 시작을 못 하면 오래 막지 않는다. 시작하면 이 타이머는 지운다
    const startTimer = window.setTimeout(function () {
      finish(false);
    }, cfg.startTimeoutMs);
    timers.push(startTimer);
    video.addEventListener('playing', function () {
      clearTimeout(startTimer);
    });
    // 영상은 첫 방문에만 받는다 — 주소를 data-src 에 두고 여기서 붙인다(재방문·움직임 줄이기에서는 한 바이트도 안 받는다)
    const sources = intro.querySelectorAll('source[data-src]');
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i] as HTMLSourceElement;
      source.src = source.dataset.src || '';
    }
    // <source> 를 쓰면 받기 실패는 video 가 아니라 source 에서 난다 — 마지막 후보까지 실패하면 접는다
    if (sources.length) {
      sources[sources.length - 1].addEventListener('error', function () {
        finish(false);
      });
    }
    video.muted = true;
    video.load();
    const playing = video.play();
    // iOS 저전력 모드 등은 소리 없는 자동재생도 막는다 — 그때는 인트로 없이 바로 첫 화면
    if (playing && typeof playing.catch === 'function') {
      playing.catch(function () {
        finish(false);
      });
    }
  } catch {
    // 인트로 때문에 첫 화면이 깨지면 안 된다 — 문제가 생기면 덮개를 아예 치운다(data-play 가 없으면 그리지 않는다)
    const broken = document.getElementById(cfg.id);
    if (broken) broken.removeAttribute('data-play');
  }
}
