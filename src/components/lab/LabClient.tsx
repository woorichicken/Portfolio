'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';

// 시안(/lab) 의 움직이는 부분만 모은 클라이언트 컴포넌트.
// B 방향의 「실험」 타일은 실제로 만든 도구(제보 위젯·리뷰 보드·검수 진행·CLI Manager)를 작게 재현한 것이다.

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(q.matches);
    const on = () => setReduced(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return reduced;
}

/* ───────── A: 썸네일 전환 (추상 그림 ↔ 실제 화면) ───────── */

// 기본은 지금 사이트처럼 실제 화면. 「회사 화면 가리기」를 누르면 첫 화면 말투의 파란 커버로 바뀐다(제보 89dab0ee)
export function ThumbSwitch({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'art' | 'photo'>('photo');
  return (
    <div className="thumb-switch" data-thumb={mode}>
      <div className="seg" role="group" aria-label="카드 썸네일">
        <button type="button" aria-pressed={mode === 'photo'} onClick={() => setMode('photo')}>실제 화면</button>
        <button type="button" aria-pressed={mode === 'art'} onClick={() => setMode('art')}>회사 화면 가리기</button>
      </div>
      {children}
    </div>
  );
}

/* ───────── B: 화면 위 요소를 집어 제보하기 ───────── */

type Pin = { n: number; label: string; x: number; y: number };

const PICKABLE = [
  { key: 'title', label: 'h2 · 오늘의 학습' },
  { key: 'body', label: 'p · 안내 문구' },
  { key: 'cta', label: 'button · 시작하기' },
] as const;

export function PickerDemo() {
  const [hover, setHover] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  function pin(label: string, el: HTMLElement) {
    const stage = stageRef.current?.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    if (!stage) return;
    setPins((prev) => [...prev, { n: prev.length + 1, label, x: box.right - stage.left - 6, y: box.top - stage.top - 6 }]);
  }

  return (
    <div className="demo picker">
      <div className="picker-stage" ref={stageRef}>
        <div className="picker-card">
          {PICKABLE.map((p) => {
            const text = p.key === 'title' ? '오늘의 학습' : p.key === 'cta' ? '시작하기' : '진단평가 결과로 고른 세 단원을 이어서 풀어요.';
            const props = {
              tabIndex: 0,
              className: `pickable pk-${p.key}${hover === p.key ? ' is-hover' : ''}`,
              onMouseEnter: () => setHover(p.key),
              onMouseLeave: () => setHover(null),
              onFocus: () => setHover(p.key),
              onBlur: () => setHover(null),
              onClick: (e: MouseEvent<HTMLElement>) => pin(p.label, e.currentTarget),
              onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
                if (p.key !== 'cta' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pin(p.label, e.currentTarget); }
              },
            };
            const inner = (
              <>
                {text}
                {hover === p.key && <span className="pick-tag" aria-hidden="true">{p.label}</span>}
              </>
            );
            if (p.key === 'title') return <h2 key={p.key} {...props}>{inner}</h2>;
            if (p.key === 'cta') return <button key={p.key} type="button" {...props}>{inner}</button>;
            return <p key={p.key} {...props}>{inner}</p>;
          })}
        </div>
        {pins.map((p) => (
          <span key={p.n} className="pin" style={{ left: p.x, top: p.y }} aria-hidden="true">{p.n}</span>
        ))}
      </div>
      <div className="demo-foot">
        <span aria-live="polite">{pins.length ? `제보 ${pins.length}건 — ${pins[pins.length - 1].label}` : '요소를 눌러 제보해 보세요'}</span>
        {pins.length > 0 && <button type="button" className="ghost" onClick={() => setPins([])}>지우기</button>}
      </div>
    </div>
  );
}

/* ───────── B: 리뷰 보드 — 세로/가로를 한 번에 ───────── */

const SCREENS = ['홈', '진단평가', '학습', '결과', '랭킹', '설정'];

export function BoardDemo() {
  const [landscape, setLandscape] = useState(false);
  const [noted, setNoted] = useState<Set<number>>(new Set([2]));
  return (
    <div className="demo board">
      <div className="seg small" role="group" aria-label="화면 방향">
        <button type="button" aria-pressed={!landscape} onClick={() => setLandscape(false)}>세로</button>
        <button type="button" aria-pressed={landscape} onClick={() => setLandscape(true)}>가로</button>
      </div>
      <ul className={`board-grid${landscape ? ' is-land' : ''}`}>
        {SCREENS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              className="screen"
              aria-pressed={noted.has(i)}
              aria-label={`${s} 화면에 코멘트 ${noted.has(i) ? '지우기' : '달기'}`}
              onClick={() => setNoted((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; })}
            >
              <i /><i /><i />
              {noted.has(i) && <b className="note-dot" aria-hidden="true" />}
            </button>
            <span>{s}</span>
          </li>
        ))}
      </ul>
      <div className="demo-foot"><span>화면 {SCREENS.length} · 코멘트 {noted.size}</span></div>
    </div>
  );
}

/* ───────── B: 검수 진행 55/55 ───────── */

const TOTAL = 55;

export function ProgressDemo() {
  const reduced = usePrefersReducedMotion();
  const [done, setDone] = useState(0);
  const [run, setRun] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) { setDone(TOTAL); return; }
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || timer) return;
      setDone(0);
      timer = setInterval(() => setDone((d) => { if (d + 1 >= TOTAL && timer) clearInterval(timer); return Math.min(TOTAL, d + 1); }), 28);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); if (timer) clearInterval(timer); };
  }, [reduced, run]);

  return (
    <div className="demo progress" ref={ref}>
      <div className="ticks" aria-hidden="true">
        {Array.from({ length: TOTAL }, (_, i) => <i key={i} className={i < done ? 'on' : undefined} />)}
      </div>
      <p className="progress-num"><strong>{done}</strong> / {TOTAL}</p>
      <div className="demo-foot">
        <span>{done === TOTAL ? '태블릿 화면 전수 확인 · 오류 0' : '확인 중…'}</span>
        <button type="button" className="ghost" onClick={() => setRun((n) => n + 1)}>다시</button>
      </div>
    </div>
  );
}

/* ───────── B: CLI Manager — AI 세션은 녹색 ───────── */

const LINES = ['$ 이슈 LIG-2041 읽는 중', '문서 3개를 근거로 구현 계획 작성', '테스트 12개 통과 · 리뷰 요청', '사람 확인이 필요한 결정 1건 → 슬랙 알림'];

export function SessionDemo() {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? LINES.length : 1);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (reduced || held) return;
    const t = setInterval(() => setShown((n) => (n >= LINES.length ? 1 : n + 1)), 1400);
    return () => clearInterval(t);
  }, [reduced, held]);

  return (
    <div className="demo session">
      <ul className="session-list">
        <li>kits-web</li>
        <li>fair-crm</li>
        <li className="is-ai"><b aria-hidden="true" />AI · symphony</li>
        <li>portfolio</li>
      </ul>
      <div className="session-pane">
        {LINES.slice(0, shown).map((l) => <p key={l}>{l}</p>)}
        {held && <p className="held">— 사람이 확인 중 · 일시정지</p>}
      </div>
      <div className="demo-foot">
        <span>AI 세션은 녹색 — 언제든 개입</span>
        <button type="button" className="ghost" onClick={() => setHeld((h) => !h)}>{held ? '이어서' : '개입하기'}</button>
      </div>
    </div>
  );
}

/* ───────── B 상세: 이전 / 이후 전환 ───────── */

export function BeforeAfter({ before, after, labels }: { before: ReactNode; after: ReactNode; labels: { before: string; after: string } }) {
  const [side, setSide] = useState<'before' | 'after'>('after');
  return (
    <div className="ba-toggle">
      <div className="seg small" role="group" aria-label={`${labels.before} / ${labels.after}`}>
        <button type="button" aria-pressed={side === 'before'} onClick={() => setSide('before')}>{labels.before}</button>
        <button type="button" aria-pressed={side === 'after'} onClick={() => setSide('after')}>{labels.after}</button>
      </div>
      <div className="ba-panes" data-side={side}>
        <div className="ba-pane ba-before" aria-hidden={side !== 'before'}>{before}</div>
        <div className="ba-pane ba-after" aria-hidden={side !== 'after'}>{after}</div>
      </div>
    </div>
  );
}

/* ───────── A 상세: 지금 읽는 장을 표시하는 목차 ───────── */

// 상세가 길어도 길을 잃지 않게 — 화면 위쪽 1/3 에 들어온 장을 목차에서 굵게 표시한다
export function CaseToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-20% 0px -66% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav className="lab-toc" aria-label="이 페이지의 장">
      <ol>
        {items.map((i) => (
          <li key={i.id}><a href={`#${i.id}`} aria-current={active === i.id ? 'true' : undefined}>{i.label}</a></li>
        ))}
      </ol>
    </nav>
  );
}
