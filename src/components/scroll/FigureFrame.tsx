'use client';

import { useEffect, useRef, useState } from 'react';
import { figureUrl, type FigName } from './figures';

// anatomy 그림(단독 HTML)을 iframe 으로 싣고, 같은 출처라 그 안의 window.setPose 를 직접 부른다.
// iframe 을 쓰는 까닭: 그림 문서의 CSS·스크립트·id 가 사이트와 섞이지 않고, 그림이 새로 오면 파일만 바꾸면 된다.
//
// 그림 문서 안에서 하는 일은 두 가지다.
// 1) 그림만 남기고 틀에 맞춘다 — 그림(svg·canvas)을 담은 상자의 형제(제목 카드 등)를 숨기고, 상자를 transform 으로 틀 안에 「통째로」 넣는다.
// 2) 부품 확대 — data-part 하나의 영역이 틀을 채우도록 같은 transform 을 다시 계산하고, 다른 부품은 옅게 한다.
// transform 하나로 하는 까닭: 그림이 svg 여러 겹이나 canvas 를 겹쳐 그려도 같이 움직이고, svg viewBox 를 건드리지 않아 그림의 계산과 부딪히지 않는다.

/** 틀 가장자리 여백(틀 크기에 대한 비율) — 그림 전체는 거의 꽉, 부품은 숨 쉴 자리를 조금 */
const PAD_FULL = 0.02;
const PAD_PART = 0.06;
/** 그림 전체 → 부품 확대에 걸리는 시간 */
const ZOOM_MS = 900;
/**
 * 첫 화면 선 굵기 — 그림이 화면에서 차지하는 폭에 맞춰 키트의 --anatomy-weight(기본 .6px)를 올린다.
 * 2026-10-18 비교(0.6·0.8·1.0·1.2px): 1440 폭(그림 약 510px, 1배 화면)은 0.6px 이 흐리고 1.0px 이 또렷,
 * 375 폭(약 330px, 2배 화면)은 0.6~0.7px 이 맞고 1.0px 부터 다이얼 같은 작은 부품이 뭉친다. 그 사이는 폭에 비례.
 * 부품 판은 확대 배율이 이미 선을 키우므로 키트 기본 그대로 둔다.
 */
const LINE = { narrowWidth: 330, narrowPx: 0.65, wideWidth: 510, widePx: 1.0 };
function lineFor(fittedWidth: number): number {
  const k = Math.min(1, Math.max(0, (fittedWidth - LINE.narrowWidth) / (LINE.wideWidth - LINE.narrowWidth)));
  return LINE.narrowPx + (LINE.widePx - LINE.narrowPx) * k;
}

type FigWindow = Window & { setPose?: (t: number) => void };
type Box = { x: number; y: number; w: number; h: number };
export type FigureApi = { setPose: (t: number) => void };

// color-scheme 을 밝게 고정하는 까닭: 그림 문서와 iframe 의 color-scheme 이 다르면 브라우저가 iframe 에 불투명한 바탕(어두우면 검정)을
// 깐다 — 기록계 초안이 color-scheme:dark 를 갖고 있어 첫 화면이 검은 사각형이 됐다(2026-10-18). iframe 쪽도 CSS 에서 light 로 맞춘다.
const HOST_CSS = `
:root, html, body { color-scheme: light !important; }
html, body { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important;
  overflow: hidden !important; background: transparent !important; }
[data-host-hide] { display: none !important; }
[data-host-stage] { transform-origin: 0 0 !important; }
[data-host-stage], [data-host-chain] { background: transparent !important; border-color: transparent !important; box-shadow: none !important; }
`;
/** 확대한 부품 말고는 옅게 — 부품을 감싼 큰 묶음(조상)과 부품 안의 작은 부품은 빼고 */
const dimCss = (parts: string[]) =>
  `[data-part]${parts.map((p) => `:not([data-part="${p}"]):not(:has([data-part="${p}"])):not([data-part="${p}"] [data-part])`).join('')} { opacity: .22 !important; }`;

/** 그림 문서에서 그림을 담은 상자를 찾는다 — 넓은 svg·canvas 들을 모두 품는 가장 가까운 상자 */
function findStage(doc: Document): { stage: HTMLElement; art: Element } | null {
  const layers = Array.from(doc.querySelectorAll('svg, canvas')).filter((el) => !el.parentElement?.closest('svg'));
  const sized = layers.map((el) => ({ el, area: el.getBoundingClientRect().width * el.getBoundingClientRect().height }));
  const biggest = sized.reduce((a, b) => (b.area > a.area ? b : a), { el: null as Element | null, area: 0 });
  if (!biggest.el) return null;
  const big = sized.filter((s) => s.area >= biggest.area * 0.25).map((s) => s.el);
  let stage = biggest.el.parentElement;
  while (stage && stage !== doc.body && !big.every((el) => stage!.contains(el))) stage = stage.parentElement;
  if (!stage) return null;
  return { stage, art: biggest.el };
}

/** 상자에서 body 까지 올라가며 형제를 숨기고, 조상의 카드 모양(바탕·테두리·그림자)을 지운다(스크립트·스타일은 그대로) */
function isolate(doc: Document, stage: HTMLElement) {
  let node: HTMLElement = stage;
  while (node.parentElement && node !== doc.body) {
    if (node.parentElement !== doc.body) node.parentElement.setAttribute('data-host-chain', '');
    for (const sib of Array.from(node.parentElement.children)) {
      if (sib !== node && !['SCRIPT', 'STYLE', 'LINK', 'TEMPLATE'].includes(sib.tagName)) sib.setAttribute('data-host-hide', '');
    }
    node = node.parentElement;
  }
}

function rectOf(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}
function union(a: Box | null, b: Box): Box {
  if (!a) return b;
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}
const mix = (a: Box, b: Box, k: number): Box => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w: a.w + (b.w - a.w) * k, h: a.h + (b.h - a.h) * k });

class Host {
  stage: HTMLElement;
  origin: Box;
  full: Box;
  /** 첫 화면처럼 그림 전체를 보일 때 선 굵기를 화면 폭에 맞춘다 */
  lineByWidth = false;
  constructor(private win: FigWindow, private doc: Document, found: { stage: HTMLElement; art: Element }) {
    this.stage = found.stage;
    this.stage.setAttribute('data-host-stage', '');
    this.origin = rectOf(this.stage);
    this.full = rectOf(found.art);
  }
  /** transform 없이 잰 영역(그림 문서 좌표) — 잴 때만 잠깐 transform 을 뗀다 */
  measure(fn: () => Box | null): Box | null {
    const saved = this.stage.style.transform;
    this.stage.style.transform = 'none';
    this.origin = rectOf(this.stage);
    const box = fn();
    this.stage.style.transform = saved;
    return box;
  }
  partBox(parts: string[], range: [number, number] | undefined, back: number): Box | null {
    return this.measure(() => {
      const ts = range ? [0, 0.25, 0.5, 0.75, 1].map((k) => range[0] + (range[1] - range[0]) * k) : [back];
      let box: Box | null = null;
      for (const t of ts) {
        this.win.setPose?.(t);
        // 한 부품이 여러 조각(<g data-part="gauge"> 여러 개)으로 나뉘어 있을 수 있어 모두 합친다
        const selector = parts.map((p) => `[data-part="${CSS.escape(p)}"]`).join(', ');
        for (const el of Array.from(this.doc.querySelectorAll(selector))) {
          const r = rectOf(el);
          if (r.w > 0 && r.h > 0) box = union(box, r);
        }
      }
      this.win.setPose?.(back);
      return box;
    });
  }
  /** 그림 문서 좌표의 영역 box 가 틀(iframe 화면)을 pad 만큼 남기고 꽉 차게 */
  fit(box: Box, pad: number) {
    const vw = this.win.innerWidth, vh = this.win.innerHeight;
    const bw = vw * (1 - pad * 2), bh = vh * (1 - pad * 2);
    const s = Math.min(bw / box.w, bh / box.h);
    const tx = (vw - box.w * s) / 2 - (box.x - this.origin.x) * s - this.origin.x;
    const ty = (vh - box.h * s) / 2 - (box.y - this.origin.y) * s - this.origin.y;
    this.stage.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
    // 선은 화면 픽셀 기준(non-scaling-stroke)이라 transform 배율 s 만큼 같이 커진다 — 화면에서 원하는 굵기 ÷ s 를 준다
    if (this.lineByWidth) this.doc.body.style.setProperty('--anatomy-weight', `${(lineFor(box.w * s) / s).toFixed(3)}px`);
  }
}

export default function FigureFrame({ fig, t, part, range, zoomIn, className, lazy, lineByWidth, onApi }: {
  fig: FigName;
  /** 싣자마자 맞출 t — 그 뒤 움직임은 setPose 로만 준다(주소를 바꾸면 문서를 다시 불러온다) */
  t: number;
  /** 이 부품을 확대해 보여 준다(같이 보여 줄 작은 부품이 있으면 여럿) */
  part?: string[];
  /** 부품이 이 t 구간을 움직이는 동안 늘 틀 안에 있게 영역을 잡는다 */
  range?: [number, number];
  /** true 가 되는 순간 그림 전체 → 부품으로 확대해 들어간다(false 면 그림 전체) */
  zoomIn?: boolean;
  className?: string;
  lazy?: boolean;
  /** 선 굵기를 그림이 차지하는 화면 폭에 맞춘다(첫 화면) */
  lineByWidth?: boolean;
  onApi?: (api: FigureApi | null) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [t0] = useState(t);
  const [host, setHost] = useState<Host | null>(null);
  const partBoxRef = useRef<Box | null>(null);
  const zoomRef = useRef(false);
  const onApiRef = useRef(onApi);
  onApiRef.current = onApi;

  // 문서가 다 오면 그림을 틀에 맞추고 setPose 를 넘긴다. 하이드레이션 전에 이미 다 온 경우도 있어 지금 상태부터 본다.
  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let done = false;
    let onResize: (() => void) | null = null;
    const ready = () => {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow as FigWindow | null;
      if (done || !doc || !win || !win.location.pathname.startsWith('/figures/') || doc.readyState !== 'complete') return;
      const style = doc.createElement('style');
      style.textContent = HOST_CSS + (part?.length ? dimCss(part) : '');
      doc.head.appendChild(style);
      const found = findStage(doc);
      if (!found) return;
      done = true;
      isolate(doc, found.stage);
      // 맞추기 전 모습(제목 카드 등)이 한 번 비치지 않게, 준비가 끝나야 보이게 한다(CSS 의 [data-ready])
      iframe.dataset.ready = '';
      const h = new Host(win, doc, found);
      h.lineByWidth = !!lineByWidth;
      h.full = h.measure(() => rectOf(found.art)) ?? h.full;
      // 그림의 가로:세로 — 좁은 화면에서 틀 높이를 그림에 맞춰 빈 여백을 줄이는 데 쓴다(CSS 의 --fig-ar)
      iframe.parentElement?.style.setProperty('--fig-ar', (h.full.w / h.full.h).toFixed(3));
      partBoxRef.current = part?.length ? h.partBox(part, range, t0) : null;
      win.setPose?.(t0);
      h.fit(h.full, PAD_FULL);
      setHost(h);
      onResize = () => {
        const zoomed = partBoxRef.current && zoomRef.current;
        h.fit(zoomed ? partBoxRef.current! : h.full, zoomed ? PAD_PART : PAD_FULL);
      };
      win.addEventListener('resize', onResize);
      onApiRef.current?.({ setPose: (v) => win.setPose?.(v) });
    };
    iframe.addEventListener('load', ready);
    ready();
    return () => {
      iframe.removeEventListener('load', ready);
      if (onResize) iframe.contentWindow?.removeEventListener('resize', onResize);
      onApiRef.current?.(null);
    };
    // part·range 는 key 로 새로 붙이므로 처음 값만 쓴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 그림 전체 → 부품으로 확대해 들어가는 움직임
  useEffect(() => {
    zoomRef.current = !!zoomIn;
    const box = partBoxRef.current;
    if (!host || !box) return;
    if (!zoomIn) { host.fit(host.full, PAD_FULL); return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { host.fit(box, PAD_PART); return; }
    const start = performance.now();
    let raf = requestAnimationFrame(function step(now) {
      const k = Math.min(1, (now - start) / ZOOM_MS);
      const e = 1 - Math.pow(1 - k, 3);
      host.fit(mix(host.full, box, e), PAD_FULL + (PAD_PART - PAD_FULL) * e);
      if (k < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  }, [host, zoomIn]);

  return (
    <iframe
      ref={ref}
      src={figureUrl(fig)}
      className={className}
      title=""
      aria-hidden="true"
      tabIndex={-1}
      loading={lazy ? 'lazy' : undefined}
    />
  );
}
