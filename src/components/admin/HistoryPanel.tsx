'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, type WriteResult } from './admin-api';
import { SiteLinks } from './ItemEditor';

// 최근 저장 — 사람(어드민)·에이전트(pnpm content) 저장을 구분해 보이고, 저장마다 되돌린다(POST /api/content/undo { changeId }).
// 되돌리기도 새 저장으로 남고, 되돌리기 줄의 「다시 하기」는 그 되돌리기를 되돌린다(서버 규칙 그대로 — docs/content-api.md).
// 그 저장 뒤에 같은 문서가 또 바뀌었으면 서버가 409 로 막는다(뒤의 저장을 조용히 지우지 않게) — 그때는 위의 저장부터 되돌린다.

export type ChangeRow = { changeId: string; action: string; actor: string; summary: string; at: string; keys: string[]; undoneBy: string | null };
type Status = { kind: 'idle' | 'busy' | 'saved' | 'error'; text?: string; links?: string[] };

export const ACTOR_LABEL: Record<string, string> = { admin: '사람(어드민)', agent: '에이전트', seed: '시드' };
const ACTION_LABEL: Record<string, string> = { set: '칸 고침', 'add-project': '추가', role: '역할', layout: '배치', hide: '숨김', undo: '되돌리기', seed: '시드' };

/** 다시 그린 주소 중 확인하기 좋은 것 몇 개 — 상세가 있으면 상세, 아니면 역할·첫 화면 */
function pickLinks(paths: string[]): string[] {
  const ko = paths.filter((p) => !p.startsWith('/en') && !p.startsWith('/es') && p !== '/admin' && !p.endsWith('.txt') && !p.endsWith('.xml'));
  const detail = ko.filter((p) => p.startsWith('/projects/'));
  return (detail.length && detail.length <= 3 ? detail : ko.filter((p) => p.startsWith('/as/') || p === '/')).slice(0, 3);
}

export default function HistoryPanel({ onChanged, limit = 30 }: { onChanged: () => void; limit?: number }) {
  const [changes, setChanges] = useState<ChangeRow[] | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const load = useCallback(async () => {
    const r = await api<{ changes: ChangeRow[] }>(`/api/content/history?limit=${limit}`);
    if (r.ok) setChanges(r.data.changes);
    else setStatus({ kind: 'error', text: r.error.message });
  }, [limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 탭을 열 때 서버의 지금 이력을 읽는다
    load();
  }, [load]);

  async function undo(c: ChangeRow) {
    setStatus({ kind: 'busy', text: '되돌리는 중…' });
    const r = await api<WriteResult>('/api/content/undo', { method: 'POST', body: JSON.stringify({ changeId: c.changeId }) });
    if (!r.ok) return setStatus({ kind: 'error', text: r.error.message });
    await load();
    setStatus({ kind: 'saved', text: `${c.action === 'undo' ? '다시 했습니다' : '되돌렸습니다'} — 「${c.summary}」 · 화면 ${r.data.revalidated.length}곳을 새로 그립니다`, links: pickLinks(r.data.revalidated) });
    onChanged();
  }

  return (
    <section className="admin-panel" aria-labelledby="history-title" data-history-panel="">
      <h2 id="history-title" className="admin-panel-title">최근 저장</h2>
      <p className="admin-hint">어드민·에이전트가 저장한 것이 모두 여기 남습니다. 되돌리기도 새 저장이고, 그 줄의 「다시 하기」로 되살립니다. 뒤에 같은 문서를 또 고쳤으면 위의 저장부터 되돌려야 합니다.</p>
      <p role="status" aria-live="polite" data-history-status={status.kind}>{status.text ?? ''}</p>
      {status.kind === 'saved' && <SiteLinks paths={status.links ?? []} label="반영 확인:" />}
      {!changes ? (
        <p className="admin-hint">불러오는 중…</p>
      ) : (
        <ol className="admin-changes">
          {changes.map((c) => {
            const canUndo = !c.undoneBy && c.action !== 'seed';
            return (
              <li key={c.changeId} data-change={c.changeId} data-undone={c.undoneBy ? '' : undefined} data-actor={c.actor}>
                <div>
                  <p className="admin-change-meta">
                    <span className="admin-actor" data-actor={c.actor}>{ACTOR_LABEL[c.actor] ?? c.actor}</span>
                    <span>{ACTION_LABEL[c.action] ?? c.action}</span>
                    <time dateTime={c.at}>{new Date(c.at).toLocaleString('ko-KR')}</time>
                    {c.undoneBy && <span>되돌림</span>}
                  </p>
                  <p className="admin-change-summary">{c.summary}</p>
                  <p className="admin-hint">{c.keys.join(' · ')}</p>
                </div>
                {canUndo && (
                  <button type="button" className="btn btn-ghost btn-sm" disabled={status.kind === 'busy'} onClick={() => undo(c)}>
                    {c.action === 'undo' ? '다시 하기' : '되돌리기'}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
