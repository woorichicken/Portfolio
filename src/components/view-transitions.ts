// 페이지 사이 전환 효과 — 브라우저의 문서 간 View Transitions(크롬·엣지 126+, 사파리 18.2+)를 쓴다.
// 지원하지 않는 브라우저(파이어폭스 등)와 「움직임 줄이기」에서는 아무 일도 없이 지금처럼 바로 넘어간다.
//
// 넷플릭스는 카드에서 상세 창이 커져 나온다(2026-11-01 Aside 실측: 상세 창 0.12초 · 그림 0.3초 cubic-bezier(.25,.1,.35,1)).
// 우리 상세는 따로 된 페이지라, 누른 카드의 그림과 상세의 큰 그림에 같은 이름(title-hero)을 붙여 브라우저가
// 둘을 한 장처럼 이어 움직이게 한다. 닫기(×)·뒤로 가기는 거꾸로 큰 그림이 카드 자리로 돌아간다.
// 역할 고르기 → 역할 화면은 고른 역할 그림이 머리 오른쪽 역할 단추로 옮겨 간다(role-avatar).
//
// 이름은 넘어가는 그 순간에만 붙이고 끝나면 지운다 — 한 화면에 같은 이름이 둘이면 전환이 통째로 취소되기 때문이다.
// pagereveal 은 첫 그림보다 먼저 와서 React 가 붙기 전에 받아야 한다. 그래서 <head> 의 인라인 스크립트로 넣는다(Document.tsx).

const script = () => {
  if (!('onpagereveal' in window)) return;
  const KEY = 'vt:hero';
  const trim = (p: string) => p.replace(/\/+$/, '') || '/';
  const isDetail = (u: URL) => /\/projects\/[^/]+\/?$/.test(u.pathname);
  const isBrowse = (u: URL) => /\/as\/[^/]+\/?$/.test(u.pathname);
  const isPicker = (u: URL) => /^\/(en|es)?\/?$/.test(u.pathname);
  const roleOf = (u: URL) => (u.pathname.match(/\/as\/([^/]+)/) || [])[1];
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  type VT = { finished: Promise<unknown> };
  const tag = (el: Element | null | undefined, name: string, vt: VT) => {
    if (!(el instanceof HTMLElement)) return;
    el.style.viewTransitionName = name;
    vt.finished.finally(() => { el.style.viewTransitionName = ''; });
  };
  const cardFor = (path: string) =>
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a.card[href], a.sim[href]')).find((a) => trim(new URL(a.href).pathname) === trim(path));

  // 떠나는 화면 — 무엇이 이어질지 이름을 붙인다
  window.addEventListener('pageswap', (event) => {
    const e = event as Event & { viewTransition?: VT; activation?: { entry?: { url: string } } };
    if (!e.viewTransition || !e.activation?.entry) return;
    const from = new URL(location.href);
    const to = new URL(e.activation.entry.url);
    if (isDetail(to) && trim(to.pathname) !== trim(from.pathname)) {
      const media = cardFor(to.pathname)?.querySelector('.card-media, .sim-media');
      if (media && visible(media)) {
        // 상세 → 다른 상세(비슷한 작품)면 지금 큰 그림의 이름부터 비운다
        const hero = document.querySelector<HTMLElement>('.title-hero-media');
        if (hero) hero.style.viewTransitionName = '';
        tag(media, 'title-hero', e.viewTransition);
        const img = media.querySelector('img');
        try {
          if (img?.currentSrc) sessionStorage.setItem(KEY, JSON.stringify({ path: trim(to.pathname), src: img.currentSrc }));
        } catch {}
      }
    } else if (isDetail(from)) {
      tag(document.querySelector('.title-hero-media'), 'title-hero', e.viewTransition);
    }
    if (isPicker(from) && isBrowse(to)) {
      const tile = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-pick-role]')).find((a) => trim(new URL(a.href).pathname) === trim(to.pathname));
      tag(tile?.querySelector('.avatar'), 'role-avatar', e.viewTransition);
    }
    if (isPicker(to) && !isPicker(from)) tag(document.querySelector('.role-chip .avatar'), 'role-avatar', e.viewTransition);
  });

  // 들어온 화면 — 같은 이름을 받을 자리를 찾는다
  window.addEventListener('pagereveal', (event) => {
    const e = event as Event & { viewTransition?: VT };
    const nav = (window as unknown as { navigation?: { activation?: { from?: { url: string } } } }).navigation;
    const fromUrl = nav?.activation?.from?.url;
    if (!e.viewTransition || !fromUrl) return;
    const from = new URL(fromUrl);
    const here = new URL(location.href);
    if (isDetail(here) && trim(from.pathname) !== trim(here.pathname)) {
      const hero = document.querySelector<HTMLElement>('.title-hero-media');
      if (hero) {
        // 큰 그림이 아직 안 받아졌으면 방금 본 카드 그림(이미 받아 둔 것)을 밑에 깔아 검은 칸이 보이지 않게 한다
        try {
          const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null') as { path: string; src: string } | null;
          if (saved && saved.path === trim(here.pathname)) hero.style.backgroundImage = `url("${saved.src}")`;
        } catch {}
        tag(hero, 'title-hero', e.viewTransition);
      }
    }
    if (isBrowse(here) && isDetail(from)) {
      const media = cardFor(from.pathname)?.querySelector('.card-media');
      if (media && visible(media)) tag(media, 'title-hero', e.viewTransition);
    }
    if (isBrowse(here) && isPicker(from)) tag(document.querySelector('.role-chip .avatar'), 'role-avatar', e.viewTransition);
    if (isPicker(here) && isBrowse(from)) tag(document.querySelector(`a[data-pick-role="${roleOf(from)}"] .avatar`), 'role-avatar', e.viewTransition);
  });
};

/** <head> 에 그대로 넣는 스크립트 글 */
export const VIEW_TRANSITION_SCRIPT = `(${script.toString()})();`;
