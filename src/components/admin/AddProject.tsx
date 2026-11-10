'use client';

import { useEffect, useState } from 'react';
import { LOCALES, browsePath, projectPath } from '@/i18n/config';
import { api, type WriteResult } from './admin-api';
import { SLUG_MESSAGE } from '@/content/slug';
import { SLUG_PATTERN, problemsUnder, setAll, type FieldProblems } from './editor-model';
import { OTHER_SPEC, blankOther } from './editor-spec';
import { FieldList, Problems, type Draft } from './Fields';
import { SiteLinks } from './ItemEditor';

// 「그 외」 프로젝트 추가 — `pnpm content add-project`(POST /api/content/projects)와 같은 API·같은 검사.
// slug(주소)는 세 언어 같은 값 · 이름·기간·한 줄·사진·상세 문단은 언어마다. 넣을 역할을 고르면 그 역할 「그 외」 줄 맨 뒤에 들어간다.

type Status = { kind: 'idle' | 'busy' | 'saved' | 'error'; text?: string; links?: string[] };

function blankDraft(slug: string): Draft {
  return Object.fromEntries(LOCALES.map((l) => [l, blankOther(slug)])) as unknown as Draft;
}

export default function AddProject({ roleNames, onSaved, onDirty }: { roleNames: Record<string, string>; onSaved: () => void; onDirty?: (dirty: boolean) => void }) {
  const [slug, setSlug] = useState('');
  const [draft, setDraft] = useState<Draft>(() => blankDraft(''));
  const [roles, setRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [problems, setProblems] = useState<FieldProblems>({ byField: {}, all: [] });
  // 쓰던 것이 있으면 어드민에 알린다 — 떠나기 전에 브라우저가 묻는다(수정 1회차)
  const dirty = Boolean(slug) || roles.length > 0 || JSON.stringify(draft) !== JSON.stringify(blankDraft(''));
  useEffect(() => {
    onDirty?.(dirty);
  }, [dirty, onDirty]);
  const slugProblem = slug && !SLUG_PATTERN.test(slug) ? SLUG_MESSAGE : '';

  async function submit() {
    if (!slug || slugProblem) return setStatus({ kind: 'error', text: slugProblem || 'slug(주소)를 먼저 정하세요' });
    setStatus({ kind: 'busy', text: '추가하는 중…' });
    setProblems({ byField: {}, all: [] });
    const r = await api<WriteResult>('/api/content/projects', { method: 'POST', body: JSON.stringify({ kind: 'other', item: draft, roles: roles.map((role) => ({ role })) }) });
    if (!r.ok) {
      if (r.error.problems?.length) setProblems(problemsUnder(r.error.problems, 'others.items', { itemList: true }));
      return setStatus({ kind: 'error', text: r.status === 409 ? `${r.error.message} — 다른 slug 를 고르세요` : r.status === 422 ? `추가하지 않았습니다 — 고칠 칸 ${r.error.problems?.length ?? 0}곳` : r.error.message });
    }
    setStatus({ kind: 'saved', text: `추가했습니다 — ${r.data.summary}`, links: [projectPath('ko', slug), ...roles.map((role) => browsePath('ko', role))] });
    setSlug('');
    setDraft(blankDraft(''));
    setRoles([]);
    onSaved();
  }

  const ctx = { draft, set: setDraft, problems: problems.byField, disabled: status.kind === 'busy' };
  return (
    <section className="admin-panel" aria-labelledby="add-title" data-add-panel="">
      <h2 id="add-title" className="admin-panel-title">「그 외」 프로젝트 추가</h2>
      <p className="admin-hint">저장하면 상세 페이지(/projects/&lt;slug&gt;)와 고른 역할 화면에 바로 생깁니다. 지우는 단추는 없습니다 — 숨기거나 「최근 저장」에서 되돌립니다.</p>

      <div className="admin-field" data-field="slug">
        <span className="admin-field-label">slug(주소)<small>세 언어 같음 · 영문 소문자로 시작 · 소문자·숫자·하이픈</small></span>
        <input
          className="admin-input"
          value={slug}
          aria-label="slug(주소)"
          aria-invalid={Boolean(slugProblem)}
          spellCheck={false}
          disabled={ctx.disabled}
          onChange={(e) => {
            const v = e.target.value.trim();
            setSlug(v);
            setDraft(setAll(draft, ['slug'], v));
          }}
        />
        <Problems list={slugProblem ? [{ path: 'slug', message: slugProblem }] : problems.byField.slug} />
      </div>

      <fieldset className="admin-group">
        <legend className="admin-field-label">넣을 역할<small>그 역할의 「그 외」 줄 맨 뒤</small></legend>
        <div className="admin-checks">
          {Object.entries(roleNames).map(([role, name]) => (
            <label key={role} className="admin-check">
              <input type="checkbox" checked={roles.includes(role)} disabled={ctx.disabled} onChange={(e) => setRoles(e.target.checked ? [...roles, role] : roles.filter((r) => r !== role))} data-add-role={role} />
              {name}
            </label>
          ))}
        </div>
      </fieldset>

      <FieldList specs={OTHER_SPEC.filter((s) => s.key !== 'slug')} base={[]} ctx={ctx} />

      <div className="admin-panel-foot">
        <p role="status" aria-live="polite" data-add-status={status.kind}>{status.text ?? '아직 추가하지 않았습니다.'}</p>
        {status.kind === 'saved' && <SiteLinks paths={status.links ?? []} label="반영 확인:" />}
        {problems.all.length > 0 && <ul className="admin-problems">{problems.all.slice(0, 8).map((p, i) => <li key={i}><code>{p.path}</code> {p.message}</li>)}</ul>}
        <div className="billboard-actions">
          <button type="button" className="btn btn-primary" disabled={ctx.disabled || !slug} onClick={submit}>추가</button>
        </div>
      </div>
    </section>
  );
}
