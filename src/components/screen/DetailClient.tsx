'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

// 상세 페이지의 탭.

export type TabPanel = { id: string; label: string; content: ReactNode };

/**
 * 탭 — 패널은 서버가 다 그려 둔다(검색엔진·JS 꺼짐에도 내용이 HTML 에 있다). 여기서는 고른 것만 보이게 한다.
 * 주소 끝 #tab-<id> 로 탭을 열 수 있어 「바꾼 것 탭」을 링크로 보낼 수 있다. 화살표 키로 탭 사이를 움직인다(WAI-ARIA 탭 패턴).
 */
export function DetailTabs({ panels, label }: { panels: TabPanel[]; label: string }) {
  const [active, setActive] = useState(panels[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    // 처음 열 때와, 같은 페이지에서 주소의 #tab-… 만 바뀔 때(링크 클릭·뒤로 가기) 둘 다 따른다
    const follow = () => {
      const fromHash = location.hash.replace('#tab-', '');
      if (panels.some((p) => p.id === fromHash)) setActive(fromHash);
    };
    follow();
    window.addEventListener('hashchange', follow);
    return () => window.removeEventListener('hashchange', follow);
  }, [panels]);

  function select(id: string, focus = false) {
    setActive(id);
    history.replaceState(null, '', `#tab-${id}`);
    const tab = tabRefs.current[id];
    if (focus) tab?.focus({ preventScroll: true });
    // 좁은 폭(영어·스페인어)에서 탭 줄이 넘치면 고른 탭을 가로로만 보이게 당긴다 — 세로 스크롤은 건드리지 않는다(U13)
    const list = tab?.parentElement;
    if (tab && list && (tab.offsetLeft < list.scrollLeft || tab.offsetLeft + tab.offsetWidth > list.scrollLeft + list.clientWidth)) {
      list.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' });
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = panels.findIndex((p) => p.id === active);
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (step) {
      e.preventDefault();
      select(panels[(index + step + panels.length) % panels.length].id, true);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      select(panels[e.key === 'Home' ? 0 : panels.length - 1].id, true);
    }
  }

  return (
    <>
      <div className="tabs">
        {/* 주소 #tab-… 이 닿는 자리. 탭 단추에 그 id 를 두면 브라우저가 들어오자마자 단추에 초점을 줘
            마우스로 온 사람에게도 초점 테두리가 뜬다(3회차 점검) — 초점이 가지 않는 빈 표식으로 받는다 */}
        {panels.map((p) => <span key={p.id} id={`tab-${p.id}`} className="tab-anchor" aria-hidden="true" />)}
        <div className="tabs-list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
          {panels.map((p) => (
            <button
              key={p.id}
              ref={(el) => { tabRefs.current[p.id] = el; }}
              type="button"
              role="tab"
              id={`tabbtn-${p.id}`}
              className="tab"
              aria-selected={active === p.id}
              aria-controls={`panel-${p.id}`}
              tabIndex={active === p.id ? 0 : -1}
              onClick={() => select(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {panels.map((p) => (
        <div key={p.id} role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tabbtn-${p.id}`} className="tab-panel" hidden={active !== p.id} tabIndex={0}>
          {p.content}
        </div>
      ))}
      {/* JS 가 꺼져 있으면 숨김을 풀어 패널을 전부 이어서 보여 준다 */}
      <noscript><style>{'.tab-panel[hidden]{display:block}'}</style></noscript>
    </>
  );
}
