'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FEEDBACK_PASSWORD_HASH, UNLOCK_STORAGE_KEY, isCorrectPassword } from '@/lib/feedback-gate';
import { IconComment, IconDown, IconEye, IconUp } from '../screen/icons';
import { canSendToLasso, sendComment, type SendResult } from './send-comment';

// 어드민(/admin) — 나를 위한 화면. 무엇이 어느 역할에 몇 번째로 보이는지 한눈에 보고, 순서·숨김을 바꿔 보고, 항목마다 코멘트를 남긴다.
//
// 바꾼 순서·숨김은 이 브라우저에 「변경안」으로만 남는다(사이트를 바로 바꾸지 않는다). 아래 「변경안」 칸의 코드를
// content/roles.ts 에 옮겨 배포해야 방문자 화면이 바뀐다 — 저장소를 붙이기 전까지의 의도된 한계다(PR 설명 「정할 것」).
// 코멘트는 이 브라우저에 쌓고, 수집 주소가 있는 배포본에서는 라쏘런에도 보낸다.

export type AdminItem = { slug: string; name: string; kicker: string; cover: string; kind: 'project' | 'other' | 'early' };
type RoleConfig = { name: string; featured: string; projects: string[]; others: string[] };
type Draft = { roles: Record<string, RoleConfig>; hidden: string[] };
type Comment = { text: string; at: string; sent: SendResult };

const DRAFT_KEY = 'solhun:admin-draft';
const COMMENTS_KEY = 'solhun:admin-comments';
const ALL_VIEW = '*';

const KIND_LABEL: Record<AdminItem['kind'], string> = { project: '큰 프로젝트', other: '그 외', early: '이전' };
const SENT_LABEL: Record<SendResult, string> = { sent: '라쏘런에 보냄', queued: '라쏘런 대기 중', disabled: '이 브라우저에만', failed: '보내기 실패 — 이 브라우저에만' };

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function Admin({ items, roles, hidden }: { items: AdminItem[]; roles: Record<string, RoleConfig>; hidden: string[] }) {
  const source: Draft = useMemo(() => ({ roles, hidden }), [roles, hidden]);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<Draft>(source);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [view, setView] = useState<string>(ALL_VIEW);
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { setUnlocked(localStorage.getItem(UNLOCK_STORAGE_KEY) === FEEDBACK_PASSWORD_HASH); } catch { setUnlocked(false); }
    setDraft(load(DRAFT_KEY, source));
    setComments(load(COMMENTS_KEY, {}));
  }, [source]);

  function update(next: Draft) {
    setDraft(next);
    save(DRAFT_KEY, next);
  }

  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.slug, i])), [items]);
  const roleIds = Object.keys(roles).filter((r) => r !== 'all');
  const changed = JSON.stringify(draft) !== JSON.stringify(source);

  if (unlocked === null) return null;
  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} />;

  function toggleHidden(slug: string) {
    const isHidden = draft.hidden.includes(slug);
    update({ ...draft, hidden: isHidden ? draft.hidden.filter((s) => s !== slug) : [...draft.hidden, slug] });
  }

  function listKey(slug: string): 'projects' | 'others' {
    return byId[slug]?.kind === 'project' ? 'projects' : 'others';
  }

  function move(role: string, slug: string, dir: -1 | 1) {
    const key = listKey(slug);
    const list = [...draft.roles[role][key]];
    const i = list.indexOf(slug);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    update({ ...draft, roles: { ...draft.roles, [role]: { ...draft.roles[role], [key]: list } } });
  }

  function toggleInRole(role: string, slug: string) {
    const key = listKey(slug);
    const list = draft.roles[role][key];
    const next = list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
    update({ ...draft, roles: { ...draft.roles, [role]: { ...draft.roles[role], [key]: next } } });
  }

  async function addComment(item: AdminItem, text: string) {
    const entry: Comment = { text, at: new Date().toISOString(), sent: 'disabled' };
    const next = { ...comments, [item.slug]: [...(comments[item.slug] ?? []), entry] };
    setComments(next);
    save(COMMENTS_KEY, next);
    entry.sent = await sendComment({ slug: item.slug, name: item.name, text });
    const after = { ...next, [item.slug]: next[item.slug].map((c) => (c === entry ? { ...entry } : c)) };
    setComments(after);
    save(COMMENTS_KEY, after);
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draftSnippet(draft));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const roleView = view !== ALL_VIEW ? draft.roles[view] : null;
  const shown: AdminItem[] = roleView
    ? [...roleView.projects, ...roleView.others].map((s) => byId[s]).filter(Boolean)
    : items;
  const notInRole = roleView ? items.filter((i) => !roleView.projects.includes(i.slug) && !roleView.others.includes(i.slug)) : [];
  const commentCount = Object.values(comments).reduce((n, list) => n + list.length, 0);

  const row = (item: AdminItem, index: number, inRole: boolean) => {
    const isHidden = draft.hidden.includes(item.slug);
    const list = roleView ? roleView[listKey(item.slug)] : [];
    const pos = list.indexOf(item.slug);
    const itemComments = comments[item.slug] ?? [];
    return (
      <li key={item.slug} className="admin-item" data-hidden={isHidden || (roleView && !inRole) ? '' : undefined}>
        <div className="admin-thumb"><Image src={item.cover} alt="" width={192} height={120} sizes="96px" /></div>
        <div>
          <h3>{roleView && inRole ? `${index + 1}. ` : ''}{item.name}{roleView?.featured === item.slug ? ' · 대표작' : ''}</h3>
          <p>{KIND_LABEL[item.kind]} · {item.kicker}{isHidden ? ' · 숨김' : ''}</p>
          <div className="admin-roles">
            {roleIds.map((r) => {
              const on = draft.roles[r].projects.includes(item.slug) || draft.roles[r].others.includes(item.slug);
              return <span key={r} data-on={on ? '' : undefined}>{draft.roles[r].name}</span>;
            })}
          </div>
        </div>
        <div className="admin-actions">
          {roleView && inRole && (
            <>
              <button type="button" className="icon-btn" aria-label={`${item.name} 위로`} disabled={pos <= 0} onClick={() => move(view, item.slug, -1)}><IconUp /></button>
              <button type="button" className="icon-btn" aria-label={`${item.name} 아래로`} disabled={pos < 0 || pos >= list.length - 1} onClick={() => move(view, item.slug, 1)}><IconDown /></button>
            </>
          )}
          {roleView ? (
            <button type="button" className="icon-btn" aria-pressed={inRole} aria-label={`${item.name} 이 역할에 ${inRole ? '빼기' : '넣기'}`} onClick={() => toggleInRole(view, item.slug)}><IconEye off={!inRole} /></button>
          ) : (
            <button type="button" className="icon-btn" aria-pressed={!isHidden} aria-label={`${item.name} ${isHidden ? '보이기' : '숨기기'}`} onClick={() => toggleHidden(item.slug)}><IconEye off={isHidden} /></button>
          )}
          <button type="button" className="icon-btn" aria-expanded={openComment === item.slug} aria-label={`${item.name} 코멘트 ${itemComments.length}개`} onClick={() => setOpenComment(openComment === item.slug ? null : item.slug)}>
            <IconComment />
          </button>
        </div>
        {openComment === item.slug && <CommentBox item={item} list={itemComments} onAdd={(text) => addComment(item, text)} />}
      </li>
    );
  };

  return (
    <div className="wrap admin">
      <h1>어드민</h1>
      <p className="admin-lead">
        역할마다 무엇을 몇 번째에 보여 줄지 고르고, 항목마다 메모를 남깁니다. 바꾼 순서·숨김은 이 브라우저의 변경안으로만 남고,
        아래 코드를 <code>content/roles.ts</code> 에 옮겨 배포해야 방문자 화면이 바뀝니다.
        {canSendToLasso ? ' 코멘트는 라쏘런에도 보냅니다.' : ' 이 빌드에는 라쏘런 수집 주소가 없어 코멘트는 이 브라우저에만 남습니다.'}
      </p>
      <div className="admin-bar">
        <div className="seg" role="group" aria-label="보기">
          <button type="button" aria-pressed={view === ALL_VIEW} onClick={() => setView(ALL_VIEW)}>전체 항목</button>
          {roleIds.map((r) => <button key={r} type="button" aria-pressed={view === r} onClick={() => setView(r)}>{draft.roles[r].name}</button>)}
        </div>
        <p className="admin-stats"><span>항목 <b>{items.length}</b></span><span>숨김 <b>{draft.hidden.length}</b></span><span>코멘트 <b>{commentCount}</b></span></p>
      </div>

      <ol className="admin-list">{shown.map((item, i) => row(item, i, true))}</ol>
      {roleView && notInRole.length > 0 && (
        <>
          <h2 className="panel-h" style={{ marginTop: 28 }}>이 역할에 없는 항목</h2>
          <ul className="admin-list">{notInRole.map((item, i) => row(item, i, false))}</ul>
        </>
      )}

      <section className="admin-diff" aria-labelledby="diff-title">
        <h2 id="diff-title">변경안 {changed ? '— 바뀐 것 있음' : '— 그대로'}</h2>
        <p>{changed ? '이 코드로 content/roles.ts 의 ROLES 순서와 HIDDEN 을 바꾸면 방문자 화면에 반영됩니다.' : '아직 바꾼 것이 없습니다.'}</p>
        {changed && <pre>{draftSnippet(draft)}</pre>}
        <div className="billboard-actions">
          <button type="button" className="btn btn-primary" disabled={!changed} onClick={copyDraft}>{copied ? '복사했습니다' : '변경안 복사'}</button>
          <button type="button" className="btn btn-ghost" disabled={!changed} onClick={() => update(source)}>처음으로 되돌리기</button>
        </div>
      </section>
    </div>
  );
}

/** 변경안 — roles.ts 에 옮길 모양(역할별 순서 + 숨김) */
function draftSnippet(draft: Draft): string {
  const roles = Object.fromEntries(Object.entries(draft.roles).map(([id, r]) => [id, { featured: r.featured, projects: r.projects, others: r.others }]));
  return `// ROLES 의 순서\n${JSON.stringify(roles, null, 2)}\n\n// HIDDEN\n${JSON.stringify(draft.hidden)}`;
}

function CommentBox({ item, list, onAdd }: { item: AdminItem; list: Comment[]; onAdd: (text: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div className="admin-comments">
      {list.length > 0 && (
        <ol>
          {list.map((c) => (
            <li key={c.at}><time dateTime={c.at}>{new Date(c.at).toLocaleString('ko-KR')} · {SENT_LABEL[c.sent]}</time>{c.text}</li>
          ))}
        </ol>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = ref.current?.value.trim();
          if (!text) return;
          onAdd(text);
          if (ref.current) ref.current.value = '';
        }}
      >
        <label className="visually-hidden" htmlFor={`c-${item.slug}`}>{item.name} 코멘트</label>
        <textarea id={`c-${item.slug}`} ref={ref} placeholder="이 항목에 대한 메모 — 문구 고칠 곳, 넣을 사진, 뺄지 말지" />
        <button type="submit" className="btn btn-primary">남기기</button>
      </form>
    </div>
  );
}

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [error, setError] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="admin-gate">
      <form
        className="fb-gate"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await isCorrectPassword(ref.current?.value ?? '')) {
            try { localStorage.setItem(UNLOCK_STORAGE_KEY, FEEDBACK_PASSWORD_HASH); } catch {}
            onUnlock();
          } else {
            setError('비밀번호가 맞지 않습니다.');
            ref.current?.select();
          }
        }}
      >
        <h2>어드민</h2>
        <p>피드백 모드와 같은 비밀번호입니다.</p>
        <input ref={ref} type="password" autoComplete="current-password" placeholder="비밀번호" aria-label="비밀번호" aria-invalid={Boolean(error)} autoFocus />
        {error && <p className="fb-gate-error" role="alert">{error}</p>}
        <div className="fb-gate-actions"><button type="submit" className="primary">열기</button></div>
      </form>
    </div>
  );
}
