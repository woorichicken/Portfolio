'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Shot } from '@/content/images';
import Rich from './Rich';

// 「그 외 프로젝트」 카드를 누르면 상세 페이지로 바로 가지 않고 먼저 미리보기를 띄운다.
// 카드의 사진·이름 링크는 <a data-others-index href="상세"> 라 JS 가 없으면 그대로 상세로 간다 —
// 여기서는 그 클릭만 가로챈다. 「상세 보기 →」 링크는 가로채지 않는다(이미 상세로 가겠다는 뜻이다).
export type OthersPreview = { name: string; period: string; body: string; shot: Shot; href: string };

type Labels = { more: string; close: string; prev: string; next: string };

const TRIGGER_SELECTOR = 'a[data-others-index]';

export default function OthersModal({ items, labels }: { items: OthersPreview[]; labels: Labels }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>(TRIGGER_SELECTOR);
      if (!link) return;
      e.preventDefault();
      setIndex(Number(link.dataset.othersIndex));
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (index !== null && dialog && !dialog.open) dialog.showModal();
  }, [index]);

  // 그 외 프로젝트는 사진이 한 장씩이라, < > 는 이 섹션의 프로젝트(사진) 사이를 넘긴다. 끝에서는 처음으로 돈다.
  const step = useCallback(
    (delta: number) => setIndex((cur) => (cur === null ? cur : (cur + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, step]);

  if (index === null) return null;
  const item = items[index];
  return (
    // 바깥(어두운 부분)을 누르면 닫힌다. Esc 는 <dialog> 가 직접 처리한다.
    <dialog
      ref={dialogRef}
      className="others-modal"
      aria-labelledby="others-modal-title"
      onClose={() => setIndex(null)}
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
    >
      <div className="others-modal-card">
        <div className="others-modal-shot">
          {/* 원본 비율이 제각각이라 next/image 대신 그대로 보여 준다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.shot.src} alt={item.shot.alt} />
        </div>
        <div className="others-modal-body">
          <p className="others-modal-count">
            {index + 1} / {items.length}
          </p>
          <h3 id="others-modal-title">{item.name}</h3>
          <p className="meta">{item.period}</p>
          <p className="others-modal-text"><Rich text={item.body} /></p>
          <a className="others-modal-more" href={item.href}>{labels.more} →</a>
        </div>
      </div>
      <button type="button" className="lightbox-nav lightbox-prev" aria-label={labels.prev} onClick={() => step(-1)}>
        ‹
      </button>
      <button type="button" className="lightbox-nav lightbox-next" aria-label={labels.next} onClick={() => step(1)}>
        ›
      </button>
      <button type="button" className="lightbox-close" onClick={() => dialogRef.current?.close()}>
        {labels.close}
      </button>
    </dialog>
  );
}
