'use client';

import { useEffect, useRef, useState } from 'react';

// 사진을 누르면 큰 화면으로 본다. 사진은 <a data-lightbox href="원본"> 이라
// JS 가 없어도 원본이 새 화면으로 열린다 — 여기서는 그 클릭을 가로채 대화상자로 보여 줄 뿐이다.
type Open = { src: string; alt: string; caption: string };

export default function Lightbox({ closeLabel }: { closeLabel: string }) {
  const [open, setOpen] = useState<Open | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[data-lightbox]');
      if (!link) return;
      e.preventDefault();
      setOpen({ src: link.href, alt: link.dataset.alt ?? '', caption: link.dataset.caption ?? '' });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  if (!open) return null;
  return (
    // 바깥(어두운 부분)을 누르면 닫힌다. Esc 는 <dialog> 가 직접 처리한다.
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={open.alt}
      onClose={() => setOpen(null)}
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
    >
      <figure>
        {/* 원본 크기가 제각각이라 next/image 대신 그대로 보여 준다 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={open.src} alt={open.alt} />
        {open.caption && <figcaption>{open.caption}</figcaption>}
      </figure>
      <button type="button" className="lightbox-close" onClick={() => dialogRef.current?.close()}>
        {closeLabel}
      </button>
    </dialog>
  );
}
