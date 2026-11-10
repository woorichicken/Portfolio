'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LOCALES, projectPath } from '@/i18n/config';
import { IconClose } from '../screen/icons';
import { api, type Versions, type WriteResult } from './admin-api';
import { changedFields, problemsUnder, sameL3, type FieldProblems } from './editor-model';
import { SPEC_BY_KIND } from './editor-spec';
import { FieldList, type Draft } from './Fields';

// 항목 편집 패널 — 어드민 목록에서 항목을 누르면 열린다. 그 항목의 칸을 세 언어 나란히 고치고 「저장」.
// 저장은 항목을 통째로 PATCH /api/content/field 에 보낸다 — { path: work.projects[kits], values: { ko, en, es }, expect: 문서 버전 }.
// 한 번 저장 = 이력 한 줄 = 되돌리기 한 번. 서버가 세 언어 모양·참조를 검사하고(422 → 칸 옆에) D1 에 쓴 뒤 그 페이지만 다시 그린다.

export type ItemKind = 'project' | 'other' | 'early';
const LIST_PATH: Record<ItemKind, string> = { project: 'work.projects', other: 'others.items', early: 'early.items' };
const KIND_LABEL: Record<ItemKind, string> = { project: '큰 프로젝트', other: '그 외', early: '이전' };

type ItemResponse = { item: Draft; versions: Versions; kind: ItemKind };
type Status = { kind: 'idle' | 'loading' | 'busy' | 'saved' | 'error'; text?: string; result?: WriteResult };

/** 저장 뒤 확인할 곳 — 세 언어 상세 */
export function SiteLinks({ paths, label = '사이트에서 보기' }: { paths: string[]; label?: string }) {
  if (!paths.length) return null;
  return (
    <span className="admin-site-links">
      {label}
      {paths.map((p) => (
        <a key={p} href={p} target="_blank" rel="noreferrer" data-site-link={p}>{p}</a>
      ))}
    </span>
  );
}

export default function ItemEditor({ id, name, kind, onClose, onSaved }: { id: string; name: string; kind: ItemKind; onClose: () => void; onSaved: () => void }) {
  const [original, setOriginal] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [versions, setVersions] = useState<Versions>({});
  const [status, setStatus] = useState<Status>({ kind: 'loading', text: '불러오는 중…' });
  const [problems, setProblems] = useState<FieldProblems>({ byField: {}, all: [] });
  const [confirmClose, setConfirmClose] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);

  const load = useCallback(async () => {
    const r = await api<ItemResponse>(`/api/content/item/${encodeURIComponent(id)}`);
    if (!r.ok) return setStatus({ kind: 'error', text: r.error.message });
    setOriginal(r.data.item);
    setDraft(r.data.item);
    setVersions(r.data.versions);
    setStatus((s) => (s.kind === 'loading' ? { kind: 'idle' } : s));
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 열릴 때 서버의 지금 값을 읽는다
    load();
    headRef.current?.focus();
  }, [load]);

  const dirty = Boolean(original && draft && !sameL3(original, draft));

  const requestClose = useCallback(() => {
    if (dirty && !confirmClose) return setConfirmClose(true);
    onClose();
  }, [dirty, confirmClose, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose]);

  async function save() {
    if (!draft) return;
    setStatus({ kind: 'busy', text: '저장하는 중…' });
    setProblems({ byField: {}, all: [] });
    const expect = Object.fromEntries(LOCALES.map((l) => [`content:${l}`, versions[`content:${l}`]]));
    const r = await api<WriteResult>('/api/content/field', { method: 'PATCH', body: JSON.stringify({ path: `${LIST_PATH[kind]}[${id}]`, values: draft, expect }) });
    if (!r.ok) {
      if (r.error.problems?.length) setProblems(problemsUnder(r.error.problems, LIST_PATH[kind], { itemList: true }));
      return setStatus({ kind: 'error', text: r.status === 422 ? `저장하지 않았습니다 — 고칠 칸 ${r.error.problems?.length ?? 0}곳(빨간 줄)` : r.error.message });
    }
    await load();
    setConfirmClose(false);
    setStatus({ kind: 'saved', result: r.data, text: r.data.changeId ? `저장했습니다 — ${r.data.summary} · 화면 ${r.data.revalidated.length}곳을 새로 그립니다` : '바뀐 것이 없어 저장하지 않았습니다' });
    onSaved();
  }

  const spec = SPEC_BY_KIND[kind];
  const links = LOCALES.map((l) => projectPath(l, id));
  const changed = original && draft ? changedFields(original, draft) : [];

  return (
    <div className="admin-sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && requestClose()}>
      <section className="admin-sheet" role="dialog" aria-modal="true" aria-labelledby="admin-sheet-title" data-admin-editor={id}>
        <header className="admin-sheet-head">
          <div>
            <p className="admin-sheet-kicker">{KIND_LABEL[kind]} · {id}</p>
            <h2 id="admin-sheet-title" ref={headRef} tabIndex={-1}>{name} 편집</h2>
            <SiteLinks paths={links} />
          </div>
          <button type="button" className="icon-btn" aria-label="닫기" onClick={requestClose}><IconClose /></button>
        </header>

        <div className="admin-sheet-body">
          {problems.all.length > 0 && (
            <div className="admin-problem-box" role="alert">
              <p>서버 검사에서 막혔습니다 — 아래 칸 옆에 표시했습니다.</p>
              <ul className="admin-problems">{problems.all.slice(0, 10).map((p, i) => <li key={i}><code>{p.path}</code> {p.message}</li>)}</ul>
            </div>
          )}
          {draft ? <FieldList specs={spec} base={[]} ctx={{ draft, set: setDraft, problems: problems.byField, disabled: status.kind === 'busy' }} /> : <p className="admin-hint">{status.text}</p>}
        </div>

        <footer className="admin-sheet-foot">
          <p role="status" aria-live="polite" data-editor-status={status.kind}>
            {status.kind === 'idle' || status.kind === 'loading' ? (dirty ? `바꾼 칸: ${changed.join(' · ')}` : status.text ?? '바꾼 것이 없습니다.') : status.text}
          </p>
          {status.kind === 'saved' && status.result?.changeId && <SiteLinks paths={links} label="반영 확인:" />}
          {confirmClose && <p className="admin-warn">저장하지 않은 것이 있습니다 — 한 번 더 누르면 버리고 닫습니다.</p>}
          <div className="billboard-actions">
            <button type="button" className="btn btn-primary" disabled={!dirty || status.kind === 'busy'} onClick={save}>저장</button>
            <button type="button" className="btn btn-ghost" disabled={!dirty || status.kind === 'busy'} onClick={() => { setDraft(original); setProblems({ byField: {}, all: [] }); setConfirmClose(false); }}>바꾼 것 취소</button>
            <button type="button" className="btn btn-ghost" onClick={requestClose}>{confirmClose ? '버리고 닫기' : '닫기'}</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
