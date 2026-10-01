'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// 사진을 누르면 큰 화면으로 본다. 사진은 <a data-lightbox href="원본"> 이라
// JS 가 없어도 원본이 새 화면으로 열린다 — 여기서는 그 클릭을 가로채 대화상자로 보여 줄 뿐이다.
type Shot = { src: string; alt: string; caption: string };
type Open = { shots: Shot[]; index: number };

const LINK_SELECTOR = 'a[data-lightbox]';

function toShot(link: HTMLAnchorElement): Shot {
  return { src: link.href, alt: link.dataset.alt ?? '', caption: link.dataset.caption ?? '' };
}

// < > 로 넘기는 범위는 "같은 프로젝트의 사진"이다. 홈에서는 프로젝트마다 <article> 이고,
// 상세 페이지에서는 <main> 전체가 한 프로젝트다. 다른 프로젝트 사진으로 넘어가면 맥락이 끊긴다.
function siblingLinks(link: HTMLAnchorElement): HTMLAnchorElement[] {
  const group = link.closest('article') ?? link.closest('main') ?? document.body;
  return Array.from(group.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR));
}

export default function Lightbox({ closeLabel, prevLabel, nextLabel }: { closeLabel: string; prevLabel: string; nextLabel: string }) {
  const [open, setOpen] = useState<Open | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>(LINK_SELECTOR);
      if (!link) return;
      e.preventDefault();
      const links = siblingLinks(link);
      setOpen({ shots: links.map(toShot), index: Math.max(0, links.indexOf(link)) });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  // 끝에서 한 번 더 넘기면 처음으로 돌아간다 — 버튼이 사라졌다 나타났다 하면 같은 자리를 연타할 수 없다.
  const step = useCallback((delta: number) => {
    setOpen((cur) => (cur ? { ...cur, index: (cur.index + delta + cur.shots.length) % cur.shots.length } : cur));
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, step]);

  if (!open) return null;
  const shot = open.shots[open.index];
  const hasMany = open.shots.length > 1;
  return (
    // 바깥(어두운 부분)을 누르면 닫힌다. Esc 는 <dialog> 가 직접 처리한다.
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={shot.alt}
      onClose={() => setOpen(null)}
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
    >
      <figure>
        {/* 원본 크기가 제각각이라 next/image 대신 그대로 보여 준다 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shot.src} alt={shot.alt} />
        {shot.caption && <figcaption>{shot.caption}</figcaption>}
        {hasMany && (
          <p className="lightbox-count">
            {open.index + 1} / {open.shots.length}
          </p>
        )}
      </figure>
      {hasMany && (
        <>
          <button type="button" className="lightbox-nav lightbox-prev" aria-label={prevLabel} onClick={() => step(-1)}>
            ‹
          </button>
          <button type="button" className="lightbox-nav lightbox-next" aria-label={nextLabel} onClick={() => step(1)}>
            ›
          </button>
        </>
      )}
      <button type="button" className="lightbox-close" onClick={() => dialogRef.current?.close()}>
        {closeLabel}
      </button>
    </dialog>
  );
}
