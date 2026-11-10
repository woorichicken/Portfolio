'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isMediaSrc } from '@/content/images';
import { LOCALES, browsePath, type Locale } from '@/i18n/config';
import { IconDown, IconUp } from '../screen/icons';
import { api, readPath, savePath, videoSize, type Versions, type WriteResult } from './admin-api';
import { changedFields, getIn, keyOf, listAdd, listMove, listRemove, problemsUnder, sameL3, setAll, setAllOptional, type FieldProblems } from './editor-model';
import { OSS_ITEM_SPEC, VIDEO_ITEM_SPEC } from './editor-spec';
import { FieldList, Problems, UploadButton, type Draft, type DraftUpdate } from './Fields';
import { SiteLinks } from './ItemEditor';

// 역할 화면의 「오픈소스」 · 「만든 영상」 행 — 목록에서 추가·수정·빼기·순서를 고쳐 「저장」(목록 통째 한 번 = 이력 한 줄),
// 역할마다 그 행을 켜고 끄기(누르면 바로 저장 — PATCH /api/content/roles/<역할> { openSource | videos }).
// 본문 칸: openSource.items[] · videos.items[](src/content/types.ts). 영상은 mp4 를 R2 에 올리고 포스터 사진을 따로 올린다.

type Which = 'openSource' | 'videos';
type RoleDoc = Record<string, { name: { ko: string }; openSource?: boolean; videos?: boolean }>;
type Status = { kind: 'idle' | 'busy' | 'saved' | 'error'; text?: string; links?: string[]; conflict?: boolean };
export type ItemOption = { slug: string; name: string };

const TITLE: Record<Which, string> = { openSource: '오픈소스', videos: '만든 영상' };
const ROW_LABEL: Record<Which, string> = { openSource: '저장소', videos: '영상' };

function blankRow(which: Which, n: number) {
  return which === 'openSource'
    ? { id: `repo-${n}`, name: '', body: '', repo: 'https://github.com/woorichicken/' }
    : { id: `video-${n}`, title: '', body: '', src: '', poster: '', width: 1920, height: 1080 };
}

export default function RowsPanel({ which, items, onSaved, active = true, onDirty }: { which: Which; items: ItemOption[]; onSaved: () => void; active?: boolean; onDirty?: (dirty: boolean) => void }) {
  /** 서버에서 읽은 그대로(칸이 없으면 undefined) — 409 다시 보내기 판정에 쓴다 */
  const [base, setBase] = useState<Record<Locale, unknown> | null>(null);
  const [original, setOriginal] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [versions, setVersions] = useState<Versions>({});
  const [roles, setRoles] = useState<{ doc: RoleDoc; version: number } | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [problems, setProblems] = useState<FieldProblems>({ byField: {}, all: [] });
  const dirtyRef = useRef(false);

  /** 본문(openSource | videos) — 저장 뒤·취소·깨끗한 채로 탭에 돌아올 때만. 역할 토글 뒤에는 부르지 않는다(쓰던 행이 지워진다 — 수정 1회차 P2) */
  const loadBody = useCallback(async () => {
    const r = await readPath(which);
    if (!r.ok) return setStatus({ kind: 'error', text: r.error.message });
    // 칸이 아직 없는 문서(새 칸 전의 운영 D1)는 빈 목록으로 시작한다
    const next = Object.fromEntries(LOCALES.map((l) => [l, (r.data.values[l] ?? { items: [] }) as Record<string, unknown>])) as Draft;
    setBase(r.data.values);
    setOriginal(next);
    setDraft(next);
    setVersions(r.data.versions);
    setProblems({ byField: {}, all: [] });
  }, [which]);

  /** 역할 문서(어느 역할에 이 행을 보일지)와 그 버전만 */
  const loadRoles = useCallback(async () => {
    const r = await api<{ value: RoleDoc; version: number }>('/api/content/doc/roles');
    if (r.ok) setRoles({ doc: r.data.value, version: r.data.version });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 처음 붙을 때 서버의 지금 값을 읽는다
    loadBody();
    loadRoles();
  }, [loadBody, loadRoles]);

  // 탭은 숨겨 둘 뿐 떼지 않는다(쓰던 것을 지키려고). 다시 보일 때 — 역할은 늘 새로, 본문은 쓰던 게 없을 때만 새로 읽는다
  const wasActive = useRef(active);
  useEffect(() => {
    if (active && !wasActive.current) {
      loadRoles();
      if (!dirtyRef.current) loadBody();
    }
    wasActive.current = active;
  }, [active, loadBody, loadRoles]);

  const dirty = Boolean(original && draft && !sameL3(original, draft));
  useEffect(() => {
    dirtyRef.current = dirty;
    onDirty?.(dirty);
  }, [dirty, onDirty]);

  if (!draft || !original || !base) return <p className="admin-hint">{status.text ?? '불러오는 중…'}</p>;
  const list = (getIn(draft.ko, ['items']) as Record<string, unknown>[]) ?? [];
  const ids = list.map((x) => String(x.id));
  const onRoles = roles ? Object.entries(roles.doc).filter(([, r]) => r[which]).map(([id]) => id) : [];
  const update: DraftUpdate = (f) => setDraft((p) => (p ? f(p) : p));

  async function save() {
    if (!draft || !base) return;
    setStatus({ kind: 'busy', text: '저장하는 중…' });
    setProblems({ byField: {}, all: [] });
    const r = await savePath(which, draft, versions, base);
    if (!r.ok) {
      if (r.error.problems?.length) setProblems(problemsUnder(r.error.problems, which, { ids }));
      return setStatus({ kind: 'error', conflict: r.status === 409, text: r.status === 422 ? `저장하지 않았습니다 — 고칠 칸 ${r.error.problems?.length ?? 0}곳` : r.error.message });
    }
    await loadBody();
    setStatus({ kind: 'saved', text: r.data.changeId ? `저장했습니다 — ${r.data.summary}` : '바뀐 것이 없어 저장하지 않았습니다', links: r.data.changeId ? onRoles.map((role) => browsePath('ko', role)) : [] });
    onSaved();
  }

  async function toggleRole(role: string, on: boolean) {
    if (!roles) return;
    // 누른 즉시 체크 표시를 바꾼다(저장이 끝날 때까지 예전 표시로 남으면 안 눌린 것처럼 보인다).
    // 끝나면 역할 문서·버전만 다시 읽는다 — 본문 draft(저장 안 한 행)는 건드리지 않는다(수정 1회차 P2)
    setRoles({ ...roles, doc: { ...roles.doc, [role]: { ...roles.doc[role], [which]: on } } });
    setStatus({ kind: 'busy', text: '역할 저장하는 중…' });
    const r = await api<WriteResult>(`/api/content/roles/${role}`, { method: 'PATCH', body: JSON.stringify({ [which]: on, expect: { roles: roles.version } }) });
    await loadRoles();
    if (!r.ok) return setStatus({ kind: 'error', text: r.error.message });
    setStatus({ kind: 'saved', text: `${roles.doc[role].name.ko} 화면에 「${TITLE[which]}」 행을 ${on ? '켰' : '껐'}습니다`, links: [browsePath('ko', role)] });
    onSaved();
  }

  const ctx = { draft, set: update, problems: problems.byField, disabled: status.kind === 'busy' };
  const label = ROW_LABEL[which];

  return (
    <section className="admin-panel" aria-labelledby={`${which}-title`} data-rows-panel={which}>
      <h2 id={`${which}-title`} className="admin-panel-title">「{TITLE[which]}」 행</h2>

      <fieldset className="admin-group">
        <legend className="admin-field-label">보일 역할<small>누르면 바로 저장됩니다</small></legend>
        <div className="admin-checks">
          {roles &&
            Object.entries(roles.doc).map(([role, r]) => (
              <label key={role} className="admin-check">
                <input type="checkbox" checked={Boolean(r[which])} disabled={status.kind === 'busy'} onChange={(e) => toggleRole(role, e.target.checked)} data-role-toggle={role} />
                {r.name.ko}
              </label>
            ))}
        </div>
      </fieldset>

      <Problems list={problems.byField.items} />
      <ol className="admin-rows">
        {list.map((row, i) => (
          <li key={i} className="admin-row" data-row={String(row.id)}>
            <div className="admin-row-head">
              <span>{label} {i + 1} · <code>{String(row.id)}</code></span>
              <span className="admin-row-actions">
                <button type="button" className="icon-btn" aria-label={`${label} ${i + 1} 위로`} disabled={ctx.disabled || i === 0} onClick={() => update((d) => listMove(d, ['items'], i, -1))}><IconUp /></button>
                <button type="button" className="icon-btn" aria-label={`${label} ${i + 1} 아래로`} disabled={ctx.disabled || i === list.length - 1} onClick={() => update((d) => listMove(d, ['items'], i, 1))}><IconDown /></button>
                <button type="button" className="btn btn-ghost btn-sm" disabled={ctx.disabled} onClick={() => update((d) => listRemove(d, ['items'], i))}>빼기</button>
              </span>
            </div>
            <FieldList specs={which === 'openSource' ? OSS_ITEM_SPEC : VIDEO_ITEM_SPEC} base={['items', i]} ctx={ctx} />
            {which === 'videos' && <VideoFiles index={i} row={row} ctx={ctx} items={items} />}
            <Problems list={problems.byField[keyOf(['items', i])]} />
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-ghost btn-sm" disabled={ctx.disabled} onClick={() => update((d) => listAdd(d, ['items'], () => blankRow(which, list.length + 1)))}>+ {label} 추가</button>

      <div className="admin-panel-foot">
        <p role="status" aria-live="polite" data-rows-status={status.kind}>
          {status.text ?? (dirty ? `바꾼 것: ${changedFields(original, draft).join(' · ')} — 아직 저장하지 않았습니다` : '바꾼 것이 없습니다.')}
        </p>
        {status.kind === 'saved' && <SiteLinks paths={status.links ?? []} label="반영 확인:" />}
        {problems.all.length > 0 && <ul className="admin-problems">{problems.all.slice(0, 8).map((p, i) => <li key={i}><code>{p.path}</code> {p.message}</li>)}</ul>}
        <div className="billboard-actions">
          <button type="button" className="btn btn-primary" disabled={!dirty || ctx.disabled} onClick={save}>{TITLE[which]} 저장</button>
          <button type="button" className="btn btn-ghost" disabled={!dirty || ctx.disabled} onClick={() => {
            // 409 뒤에만 서버의 새 값을 읽는다(ItemEditor 와 같은 규칙)
            if (status.conflict) loadBody();
            else {
              setDraft(original);
              setProblems({ byField: {}, all: [] });
            }
            setStatus({ kind: 'idle' });
          }}>바꾼 것 취소</button>
        </div>
      </div>
    </section>
  );
}

/** 영상 줄 — mp4 올리기(가로·세로는 브라우저가 읽는다) · 포스터 올리기 · 소개하는 프로젝트 */
function VideoFiles({ index, row, ctx, items }: { index: number; row: Record<string, unknown>; ctx: { draft: Draft; set: DraftUpdate; problems: FieldProblems['byField']; disabled: boolean }; items: ItemOption[] }) {
  const base = ['items', index];
  const k = (f: string) => keyOf([...base, f]);
  const poster = String(row.poster ?? '');
  return (
    <div className="admin-video-files">
      <div className="admin-field" data-field={k('src')}>
        <span className="admin-field-label">영상 파일<small>mp4·webm 90MB · 세 언어 같음</small></span>
        <code className="admin-readonly" data-video-src={index}>{String(row.src || '(아직 없음)')} · {String(row.width)}×{String(row.height)}</code>
        <UploadButton
          label="영상 올리기"
          accept="video/mp4,video/webm"
          disabled={ctx.disabled}
          onUploaded={async (u, file) => {
            const size = await videoSize(file);
            // 그 사이 고친 칸을 덮지 않게 지금 draft 에 영상 칸만(수정 1회차 P2)
            ctx.set((d) => {
              const next = setAll(d, [...base, 'src'], u.src);
              return size ? setAll(setAll(next, [...base, 'width'], size.width), [...base, 'height'], size.height) : next;
            });
          }}
        />
        <Problems list={[...(ctx.problems[k('src')] ?? []), ...(ctx.problems[k('width')] ?? []), ...(ctx.problems[k('height')] ?? [])]} />
      </div>
      <div className="admin-field" data-field={k('poster')}>
        <span className="admin-field-label">포스터<small>누르기 전에 보이는 장면 · 세 언어 같음</small></span>
        <div className="admin-shot-row">
          <div className="admin-shot-thumb">{poster && <Image src={poster} unoptimized={isMediaSrc(poster)} alt="" width={Number(row.width) || 16} height={Number(row.height) || 9} sizes="160px" />}</div>
          <div className="admin-shot-meta">
            <code className="admin-readonly">{poster || '(아직 없음)'}</code>
            <UploadButton label="포스터 올리기" accept="image/jpeg,image/png,image/webp" disabled={ctx.disabled} onUploaded={(u) => ctx.set((d) => setAll(d, [...base, 'poster'], u.src))} />
          </div>
        </div>
        <Problems list={ctx.problems[k('poster')]} />
      </div>
      <label className="admin-field" data-field={k('project')}>
        <span className="admin-field-label">소개하는 프로젝트(선택)</span>
        <select className="admin-input" value={String(row.project ?? '')} disabled={ctx.disabled} onChange={(e) => { const v = e.target.value; ctx.set((d) => setAllOptional(d, [...base, 'project'], v)); }} aria-label="소개하는 프로젝트">
          <option value="">없음</option>
          {items.map((it) => <option key={it.slug} value={it.slug}>{it.name}</option>)}
        </select>
        <Problems list={ctx.problems[k('project')]} />
      </label>
    </div>
  );
}
