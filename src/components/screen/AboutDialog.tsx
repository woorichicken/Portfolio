'use client';

import { useRef, type ReactNode } from 'react';
import { IconClose } from './icons';

// 역할 고르기의 「정경훈 소개」 — 첫 화면은 제목과 역할 이름만 두고(5회차 리뷰 D1), 사람 소개는 눌러서 여는 창에 담는다.
// 창 안 글은 서버가 미리 그려 두므로 검색엔진·화면 읽기 프로그램도 읽는다. 브라우저 기본 <dialog> 라 Esc 로 닫히고 초점이 갇힌다.
export default function AboutDialog({ label, closeLabel, titleId, children }: { label: string; closeLabel: string; titleId: string; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="btn btn-outline picker-about-btn" aria-haspopup="dialog" onClick={() => dialogRef.current?.showModal()}>
        {label}
      </button>
      <dialog
        ref={dialogRef}
        className="about-dialog"
        aria-labelledby={titleId}
        // 창 바깥(어두운 바탕)을 누르면 닫는다
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      >
        <div className="about-body">
          <button type="button" className="round about-close" aria-label={closeLabel} onClick={() => dialogRef.current?.close()}>
            <IconClose />
          </button>
          {children}
        </div>
      </dialog>
    </>
  );
}
