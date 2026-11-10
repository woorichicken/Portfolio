'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { isMediaSrc } from '@/content/images';
import { LOCALES, browsePath } from '@/i18n/config';
import { IconDown, IconUp } from '../screen/icons';
import { api, videoSize, type Versions, type WriteResult } from './admin-api';
import { changedFields, getIn, keyOf, listAdd, listMove, listRemove, problemsUnder, sameL3, setAll, setAllOptional, type FieldProblems } from './editor-model';
import { OSS_ITEM_SPEC, VIDEO_ITEM_SPEC } from './editor-spec';
import { FieldList, Problems, UploadButton, type Draft } from './Fields';
import { SiteLinks } from './ItemEditor';

// 역할 화면의 「오픈소스」 · 「만든 영상」 행 — 목록에서 추가·수정·빼기·순서를 고쳐 「저장」(목록 통째 한 번 = 이력 한 줄),
// 역할마다 그 행을 켜고 끄기(누르면 바로 저장 — PATCH /api/content/roles/<역할> { openSource | videos }).
// 본문 칸: openSource.items[] · videos.items[](src/content/types.ts). 영상은 mp4 를 R2 에 올리고 포스터 사진을 따로 올린다.

type Which = 'openSource' | 'videos';
type RoleDoc = Record<string, { name: { ko: string }; openSource?: boolean; videos?: boolean }>;
type Status = { kind: 'idle' | 'busy' | 'saved' | 'error'; text?: string; links?: string[] };
export type ItemOption = { slug: string; name: string };

const TITLE: Record<Which, string> = { openSource: '오픈소스', videos: '만든 영상' };
const ROW_LABEL: Record<Which, string> = { openSource: '저장소', videos: '영상' };

function blankRow(which: Which, n: number) {
  return which === 'openSource'
    ? { id: `repo-${n}`, name: '', body: '', repo: 'https://github.com/woorichicken/' }
    : { id: `video-${n}`, title: '', body: '', src: '', poster: '', width: 1920, height: 1080 };
}

export default function RowsPanel({ which, items, onSaved }: { which: Which; items: ItemOption[]; onSaved: () => void }) {
  const [original, setOriginal] = useState<Draft | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [versions, setVersions] = useState<Versions>({});
  const [roles, setRoles] = useState<{ doc: RoleDoc; version: number } | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [problems, setProblems] = useState<FieldProblems>({ byField: {}, all: [] });

  const load = useCallback(async () => {
    const docs = await Promise.all(LOCALES.map((l) => api<{ value: { items: unknown[] }; version: number }>(`/api/content/doc/${l}?path=${which}`)));
    const r = await api<{ value: RoleDoc; version: number }>('/api/content/doc/roles');
    const next = {} as Draft;
    const v: Versions = {};
    for (const [i, l] of LOCALES.entries()) {
      const d = docs[i];
      // 칸이 아직 없는 문서(새 칸 전의 운영 D1)는 404 — 빈 목록으로 시작한다
      if (d.ok) {
        next[l] = d.data.value as Record<string, unknown>;
        v[`content:${l}`] = d.data.version;
      } else if (d.status === 404) {
        next[l] = { items: [] };
        const doc = await api<{ version: number }>(`/api/content/doc/${l}?path=meta`);
        if (doc.ok) v[`content:${l}`] = doc.data.version;
      } else return setStatus({ kind: 'error', text: d.error.message });
    }
    setOriginal(next);
    setDraft(next);
    setVersions(v);
    if (r.ok) setRoles({ doc: r.data.value, version: r.data.version });
  }, [which]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 탭을 열 때 서버의 지금 값을 읽는다
    load();
  }, [load]);

  if (!draft || !original) return <p className="admin-hint">{status.text ?? '불러오는 중…'}</p>;
  const list = (getIn(draft.ko, ['items']) as Record<string, unknown>[]) ?? [];
  const ids = list.map((x) => String(x.id));
  const dirty = !sameL3(original, draft);
  const onRoles = roles ? Object.entries(roles.doc).filter(([, r]) => r[which]).map(([id]) => id) : [];

  async function save() {
    setStatus({ kind: 'busy', text: '저장하는 중…' });
    setProblems({ byField: {}, all: [] });
    const expect = Object.fromEntries(LOCALES.map((l) => [`content:${l}`, versions[`content:${l}`]]));
    const r = await api<WriteResult>('/api/content/field', { method: 'PATCH', body: JSON.stringify({ path: which, values: draft, expect }) });
    if (!r.ok) {
      if (r.error.problems?.length) setProblems(problemsUnder(r.error.problems, which, { ids }));
      return setStatus({ kind: 'error', text: r.status === 422 ? `저장하지 않았습니다 — 고칠 칸 ${r.error.problems?.length ?? 0}곳` : r.error.message });
    }
    await load();
    setStatus({ kind: 'saved', text: r.data.changeId ? `저장했습니다 — ${r.data.summary}` : '바뀐 것이 없어 저장하지 않았습니다', links: r.data.changeId ? onRoles.map((role) => browsePath('ko', role)) : [] });
    onSaved();
  }

  async function toggleRole(role: string, on: boolean) {
    if (!roles) return;
    // 누른 즉시 체크 표시를 바꾼다(저장이 끝날 때까지 예전 표시로 남으면 안 눌린 것처럼 보인다). 실패하면 서버 값으로 다시 읽는다
    setRoles({ ...roles, doc: { ...roles.doc, [role]: { ...roles.doc[role], [which]: on } } });
    setStatus({ kind: 'busy', text: '역할 저장하는 중…' });
    const r = await api<WriteResult>(`/api/content/roles/${role}`, { method: 'PATCH', body: JSON.stringify({ [which]: on, expect: { roles: roles.version } }) });
    if (!r.ok) {
      await load();
      return setStatus({ kind: 'error', text: r.error.message });
    }
    await load();
    setStatus({ kind: 'saved', text: `${roles.doc[role].name.ko} 화면에 「${TITLE[which]}」 행을 ${on ? '켰' : '껐'}습니다`, links: [browsePath('ko', role)] });
    onSaved();
  }

  const ctx = { draft, set: setDraft, problems: problems.byField, disabled: status.kind === 'busy' };
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
                <button type="button" className="icon-btn" aria-label={`${label} ${i + 1} 위로`} disabled={ctx.disabled || i === 0} onClick={() => setDraft(listMove(draft, ['items'], i, -1))}><IconUp /></button>
                <button type="button" className="icon-btn" aria-label={`${label} ${i + 1} 아래로`} disabled={ctx.disabled || i === list.length - 1} onClick={() => setDraft(listMove(draft, ['items'], i, 1))}><IconDown /></button>
                <button type="button" className="btn btn-ghost btn-sm" disabled={ctx.disabled} onClick={() => setDraft(listRemove(draft, ['items'], i))}>빼기</button>
              </span>
            </div>
            <FieldList specs={which === 'openSource' ? OSS_ITEM_SPEC : VIDEO_ITEM_SPEC} base={['items', i]} ctx={ctx} />
            {which === 'videos' && <VideoFiles index={i} row={row} ctx={ctx} items={items} />}
            <Problems list={problems.byField[keyOf(['items', i])]} />
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-ghost btn-sm" disabled={ctx.disabled} onClick={() => setDraft(listAdd(draft, ['items'], () => blankRow(which, list.length + 1)))}>+ {label} 추가</button>

      <div className="admin-panel-foot">
        <p role="status" aria-live="polite" data-rows-status={status.kind}>
          {status.text ?? (dirty ? `바꾼 것: ${changedFields(original, draft).join(' · ')} — 아직 저장하지 않았습니다` : '바꾼 것이 없습니다.')}
        </p>
        {status.kind === 'saved' && <SiteLinks paths={status.links ?? []} label="반영 확인:" />}
        {problems.all.length > 0 && <ul className="admin-problems">{problems.all.slice(0, 8).map((p, i) => <li key={i}><code>{p.path}</code> {p.message}</li>)}</ul>}
        <div className="billboard-actions">
          <button type="button" className="btn btn-primary" disabled={!dirty || ctx.disabled} onClick={save}>{TITLE[which]} 저장</button>
          <button type="button" className="btn btn-ghost" disabled={!dirty || ctx.disabled} onClick={() => { setDraft(original); setProblems({ byField: {}, all: [] }); setStatus({ kind: 'idle' }); }}>바꾼 것 취소</button>
        </div>
      </div>
    </section>
  );
}

/** 영상 줄 — mp4 올리기(가로·세로는 브라우저가 읽는다) · 포스터 올리기 · 소개하는 프로젝트 */
function VideoFiles({ index, row, ctx, items }: { index: number; row: Record<string, unknown>; ctx: { draft: Draft; set: (d: Draft) => void; problems: FieldProblems['byField']; disabled: boolean }; items: ItemOption[] }) {
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
            let next = setAll(ctx.draft, [...base, 'src'], u.src);
            if (size) next = setAll(setAll(next, [...base, 'width'], size.width), [...base, 'height'], size.height);
            ctx.set(next);
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
            <UploadButton label="포스터 올리기" accept="image/jpeg,image/png,image/webp" disabled={ctx.disabled} onUploaded={(u) => ctx.set(setAll(ctx.draft, [...base, 'poster'], u.src))} />
          </div>
        </div>
        <Problems list={ctx.problems[k('poster')]} />
      </div>
      <label className="admin-field" data-field={k('project')}>
        <span className="admin-field-label">소개하는 프로젝트(선택)</span>
        <select className="admin-input" value={String(row.project ?? '')} disabled={ctx.disabled} onChange={(e) => ctx.set(setAllOptional(ctx.draft, [...base, 'project'], e.target.value))} aria-label="소개하는 프로젝트">
          <option value="">없음</option>
          {items.map((it) => <option key={it.slug} value={it.slug}>{it.name}</option>)}
        </select>
        <Problems list={ctx.problems[k('project')]} />
      </label>
    </div>
  );
}
