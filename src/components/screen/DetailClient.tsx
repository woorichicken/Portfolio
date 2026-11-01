'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { IconLink } from './icons';

// 상세 페이지의 탭과 공유 버튼.

const TOAST_MS = 2200;

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
    if (focus) tabRefs.current[id]?.focus();
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
        <div className="tabs-list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
          {panels.map((p) => (
            <button
              key={p.id}
              ref={(el) => { tabRefs.current[p.id] = el; }}
              type="button"
              role="tab"
              id={`tab-${p.id}`}
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
        <div key={p.id} role="tabpanel" id={`panel-${p.id}`} aria-labelledby={`tab-${p.id}`} className="tab-panel" hidden={active !== p.id} tabIndex={0}>
          {p.content}
        </div>
      ))}
      {/* JS 가 꺼져 있으면 숨김을 풀어 패널을 전부 이어서 보여 준다 */}
      <noscript><style>{'.tab-panel[hidden]{display:block}'}</style></noscript>
    </>
  );
}

/** 링크 공유 — 휴대폰은 기기 공유 창, 그 밖은 주소 복사 + 알림 */
export function ShareButton({ label, copiedLabel, title }: { label: string; copiedLabel: string; title: string }) {
  const [toast, setToast] = useState<string | null>(null);

  async function share() {
    const url = location.href.split('#')[0];
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (coarse && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 사용자가 닫았거나 막혔으면 복사로 넘어간다
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast(copiedLabel);
    } catch {
      // 복사 권한이 없으면 주소를 그대로 보여 준다 — 길게 눌러 복사할 수 있게
      setToast(url);
    }
    setTimeout(() => setToast(null), TOAST_MS);
  }

  return (
    <>
      <button type="button" className="btn btn-ghost" onClick={share}><IconLink />{label}</button>
      {toast && <p className="toast" role="status">{toast}</p>}
    </>
  );
}
