'use client';

// 관문: `?feedback` 주소 → 비밀번호 입력 → 맞으면 이 브라우저에 기억하고 위젯을 불러온다.
// 위젯 코드(feedback-kit)는 통과한 뒤에만 동적 import 한다 — 일반 방문자는 그 청크를 받지도 않는다.
// 끄려면 `?feedback=off`.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { Content } from '@/content/types';
import { FEEDBACK_PASSWORD_HASH, UNLOCK_STORAGE_KEY, isCorrectPassword, isFeedbackHost } from '@/lib/feedback-gate';

const FeedbackWidget = lazy(() => import('./FeedbackWidget'));

function readUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_STORAGE_KEY) === FEEDBACK_PASSWORD_HASH;
  } catch {
    return false;
  }
}

export default function FeedbackGate({ copy }: { copy: Content['feedback'] }) {
  const [allowedHost, setAllowedHost] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const host = isFeedbackHost(location.hostname);
    setAllowedHost(host);
    if (!host) return;
    const already = readUnlocked();
    setUnlocked(already);
    const params = new URLSearchParams(location.search);
    if (params.get('feedback') === 'off') {
      try { localStorage.removeItem(UNLOCK_STORAGE_KEY); } catch {}
      setUnlocked(false);
    } else if (params.has('feedback') && !already) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = inputRef.current?.value ?? '';
    if (await isCorrectPassword(value)) {
      try { localStorage.setItem(UNLOCK_STORAGE_KEY, FEEDBACK_PASSWORD_HASH); } catch {}
      setUnlocked(true);
      setOpen(false);
      setError('');
    } else {
      setError(copy.wrong);
      inputRef.current?.select();
    }
  }

  if (!allowedHost) return null;
  return (
    <>
      {unlocked && (
        <Suspense fallback={null}>
          <FeedbackWidget />
        </Suspense>
      )}
      {open && (
        <div className="fb-gate-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form
            className="fb-gate"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fb-gate-title"
            onSubmit={submit}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          >
            <h2 id="fb-gate-title">{copy.title}</h2>
            <p>{copy.hint}</p>
            <input
              ref={inputRef}
              type="password"
              autoComplete="current-password"
              placeholder={copy.placeholder}
              aria-label={copy.placeholder}
              aria-invalid={Boolean(error)}
              data-feedback-password
            />
            {error && <p className="fb-gate-error" role="alert">{error}</p>}
            <div className="fb-gate-actions">
              <button type="button" onClick={() => setOpen(false)}>{copy.cancel}</button>
              <button type="submit" className="primary">{copy.submit}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
