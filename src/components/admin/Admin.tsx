'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isMediaSrc } from '@/content/images';
import { browsePath } from '@/i18n/config';
import { FEEDBACK_PASSWORD_HASH, UNLOCK_STORAGE_KEY, isCorrectPassword } from '@/lib/feedback-gate';
import { IconComment, IconDown, IconEdit, IconEye, IconUp } from '../screen/icons';
import AddProject from './AddProject';
import { api, type ApiError, type Versions } from './admin-api';
import HistoryPanel, { type ChangeRow } from './HistoryPanel';
import ItemEditor, { SiteLinks } from './ItemEditor';
import RowsPanel from './RowsPanel';
import { canSendToLasso, sendComment, type SendResult } from './send-comment';

// 어드민(/admin) — 나를 위한 화면. 무엇이 어느 역할에 몇 번째로 보이는지 한눈에 보고, 순서·숨김을 바꿔 「저장」하면 바로 사이트에 반영된다.
//
// 2026-11-08 부터 「저장」은 콘텐츠 API(PUT /api/content/layout)를 부른다 — 에이전트가 `pnpm content` 로 부르는 것과 같은 API 다.
// 서버가 zod 검사 → D1 에 쓰기(직전 값은 이력) → 바뀐 페이지만 다시 그리기를 한다. 잘못 저장했으면 「마지막 저장 되돌리기」.
// 비밀번호는 서버가 확인하고 HttpOnly 쿠키를 준다(예전처럼 브라우저 해시 비교가 아니다).
// D1 이 없는 배포(Vercel · CONTENT_SOURCE=static)에서는 저장할 수 없어서, 예전처럼 변경안 코드만 보여 주고 로그인도 예전 그대로
// 브라우저 해시 비교다(API 를 부르지 않는다 — Vercel 에는 Cloudflare 컨텍스트가 없어 API 가 실패한다. 수정 1회차 P1).
// 코멘트는 이 브라우저에 쌓고, 수집 주소가 있는 배포본에서는 라쏘런에도 보낸다(바뀐 것 없음).
//
// 2026-11-10 「실제로 관리하는 화면」 — 배치 탭 위에 탭 넷을 더했다(모두 같은 콘텐츠 API, 새 API 없음):
//   항목 편집 패널(ItemEditor — 목록에서 항목을 누르면) · 오픈소스 · 만든 영상(RowsPanel) · 프로젝트 추가(AddProject) · 최근 저장(HistoryPanel — 저장마다 되돌리기).
// 정적 모드(readOnly)에서는 편집 기능을 숨긴다 — 저장할 곳이 없다.

export type AdminItem = { slug: string; name: string; kicker: string; cover: string; kind: 'project' | 'other' | 'early' };
type RoleConfig = { name: string; featured: string; projects: string[]; others: string[] };
type Layout = { roles: Record<string, RoleConfig>; hidden: string[] };
type Comment = { text: string; at: string; sent: SendResult };
type Tab = 'layout' | 'openSource' | 'videos' | 'add' | 'history';
type Status = { kind: 'idle' | 'busy' | 'saved' | 'error'; text?: string; problems?: ApiError['problems'] };

const COMMENTS_KEY = 'solhun:admin-comments';
const ALL_VIEW = '*';

const KIND_LABEL: Record<AdminItem['kind'], string> = { project: '큰 프로젝트', other: '그 외', early: '이전' };
const TABS: { id: Tab; label: string }[] = [
  { id: 'layout', label: '항목·배치' },
  { id: 'openSource', label: '오픈소스' },
  { id: 'videos', label: '만든 영상' },
  { id: 'add', label: '프로젝트 추가' },
  { id: 'history', label: '최근 저장' },
];
const SENT_LABEL: Record<SendResult, string> = { sent: '라쏘런에 보냄', queued: '라쏘런 대기 중', disabled: '이 브라우저에만', failed: '보내기 실패 — 이 브라우저에만' };
const ACTOR_LABEL: Record<string, string> = { admin: '어드민', agent: '에이전트', seed: '시드' };

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

type Summary = { versions: Versions; roles: Record<string, RoleConfig>; hidden: string[] };

export default function Admin({ items, roles, hidden, staticMode = false }: { items: AdminItem[]; roles: Record<string, RoleConfig>; hidden: string[]; staticMode?: boolean }) {
  const initial: Layout = useMemo(() => ({ roles, hidden }), [roles, hidden]);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  /** 서버에 저장된 배치(마지막으로 불러온 것) */
  const [source, setSource] = useState<Layout>(initial);
  const [draft, setDraft] = useState<Layout>(initial);
  const [versions, setVersions] = useState<Versions>({});
  /** D1 이 없는 배포 — 저장 대신 변경안 코드 */
  const [readOnly, setReadOnly] = useState(staticMode);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [changes, setChanges] = useState<ChangeRow[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [view, setView] = useState<string>(ALL_VIEW);
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>('layout');
  /** 한 번이라도 연 탭 — 처음 열 때 붙이고, 그 뒤로는 숨기기만 한다(떼면 쓰던 것이 사라진다 — 수정 1회차 P2) */
  const [opened, setOpened] = useState<Set<Tab>>(() => new Set<Tab>(['layout']));
  /** 저장 안 한 것이 있는 곳 — 탭 점 표시와 떠나기 전 묻기(beforeunload)에 쓴다 */
  const [dirtyParts, setDirtyParts] = useState<Record<string, boolean>>({});
  const markDirty = useCallback((part: string, dirty: boolean) => setDirtyParts((p) => (Boolean(p[part]) === dirty ? p : { ...p, [part]: dirty })), []);
  const dirtyOss = useCallback((d: boolean) => markDirty('openSource', d), [markDirty]);
  const dirtyVideos = useCallback((d: boolean) => markDirty('videos', d), [markDirty]);
  const dirtyAdd = useCallback((d: boolean) => markDirty('add', d), [markDirty]);
  const dirtyEditor = useCallback((d: boolean) => markDirty('editor', d), [markDirty]);
  const [editing, setEditing] = useState<AdminItem | null>(null);
  const router = useRouter();

  /** 서버의 지금 배치·버전·최근 저장을 불러와 화면을 그것으로 맞춘다(바꾸던 것은 버린다) */
  const refresh = useCallback(async () => {
    const [summary, history] = await Promise.all([api<Summary>('/api/content'), api<{ changes: ChangeRow[] }>('/api/content/history?limit=6')]);
    if (!summary.ok) {
      if (summary.status === 401) return setUnlocked(false);
      if (summary.error.code === 'no_db') return setReadOnly(true);
      return setStatus({ kind: 'error', text: summary.error.message });
    }
    const layout: Layout = { roles: summary.data.roles, hidden: summary.data.hidden };
    setSource(layout);
    setDraft(layout);
    setVersions(summary.data.versions);
    if (history.ok) setChanges(history.data.changes);
  }, []);

  /** 다른 탭(항목·행·추가·되돌리기)에서 저장한 뒤 — 이력·버전을 새로 읽고, 서버가 다시 그린 /admin 의 목록(이름·사진·새 항목)을 받는다.
   *  배치를 고치던 중이면 그 변경은 지우지 않는다(이력만 새로) — 그 상태로 「저장」하면 버전이 달라 409 로 알려 준다 */
  const layoutDirty = useRef(false);
  const afterWrite = useCallback(async () => {
    if (layoutDirty.current) {
      const history = await api<{ changes: ChangeRow[] }>('/api/content/history?limit=6');
      if (history.ok) setChanges(history.data.changes);
    } else await refresh();
    router.refresh();
  }, [refresh, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 저장소는 붙은 뒤에만 읽는다(서버 HTML 과 첫 그림을 맞추려고)
    setComments(load(COMMENTS_KEY, {}));
    if (staticMode) {
      // 정적 배포 — 예전처럼 이 브라우저에 남은 통과 표시로만 연다
      try { setUnlocked(localStorage.getItem(UNLOCK_STORAGE_KEY) === FEEDBACK_PASSWORD_HASH); } catch { setUnlocked(false); }
      return;
    }
    api<{ actor: string }>('/api/content/auth').then((r) => {
      if (r.ok) {
        setUnlocked(true);
        refresh();
      } else if (r.error.code === 'no_db' || r.status === 404) {
        // API 가 없는 배포(Vercel 정적) — 예전처럼 변경안만
        setReadOnly(true);
        setUnlocked(false);
      } else setUnlocked(false);
    });
  }, [refresh, staticMode]);

  const byId = useMemo(() => Object.fromEntries(items.map((i) => [i.slug, i])), [items]);
  const roleIds = Object.keys(draft.roles).filter((r) => r !== 'all');
  const changed = JSON.stringify(draft) !== JSON.stringify(source);
  useEffect(() => {
    layoutDirty.current = changed;
  }, [changed]);
  const anyDirty = changed || Object.values(dirtyParts).some(Boolean);
  // 저장 안 한 것이 있으면 새로고침·닫기·주소 이동 전에 브라우저가 묻는다(화면 안 확인창은 편집 패널 닫기에만 — 브라우저 confirm() 은 쓰지 않는다)
  useEffect(() => {
    if (!anyDirty || readOnly) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [anyDirty, readOnly]);

  if (unlocked === null) return null;
  if (!unlocked) return <AdminGate readOnly={readOnly} staticMode={staticMode} onUnlock={() => { setUnlocked(true); if (!staticMode) refresh(); }} />;

  function update(next: Layout) {
    setDraft(next);
    if (status.kind !== 'busy') setStatus({ kind: 'idle' });
  }

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

  async function saveLayout() {
    setStatus({ kind: 'busy', text: '저장하는 중…' });
    const rolesBody = Object.fromEntries(Object.entries(draft.roles).map(([id, r]) => [id, { featured: r.featured, projects: r.projects, others: r.others }]));
    const r = await api<{ changeId: string | null; versions: Versions; revalidated: string[] }>('/api/content/layout', {
      method: 'PUT',
      body: JSON.stringify({ roles: rolesBody, hidden: draft.hidden, expect: { roles: versions.roles, hidden: versions.hidden } }),
    });
    if (!r.ok) {
      if (r.status === 401) return setUnlocked(false);
      return setStatus({ kind: 'error', text: r.error.code === 'conflict' ? `${r.error.message}` : r.error.message, problems: r.error.problems });
    }
    await refresh();
    setStatus({ kind: 'saved', text: r.data.changeId ? `저장했습니다 — 방문자 화면 ${r.data.revalidated.length}곳을 새로 그립니다` : '바뀐 것이 없어 저장하지 않았습니다' });
  }

  async function undoLast() {
    setStatus({ kind: 'busy', text: '되돌리는 중…' });
    const r = await api<{ undid: string; revalidated: string[] }>('/api/content/undo', { method: 'POST', body: '{}' });
    if (!r.ok) return setStatus({ kind: 'error', text: r.error.message });
    await refresh();
    setStatus({ kind: 'saved', text: `마지막 저장을 되돌렸습니다 — 화면 ${r.data.revalidated.length}곳을 새로 그립니다` });
  }

  async function logout() {
    await api('/api/content/auth', { method: 'DELETE' });
    setUnlocked(false);
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
  const lastUndoable = changes.find((c) => !c.undoneBy && c.action !== 'seed' && c.action !== 'undo');

  const row = (item: AdminItem, index: number, inRole: boolean) => {
    const isHidden = draft.hidden.includes(item.slug);
    const list = roleView ? roleView[listKey(item.slug)] : [];
    const pos = list.indexOf(item.slug);
    const itemComments = comments[item.slug] ?? [];
    return (
      <li key={item.slug} className="admin-item" data-hidden={isHidden || (roleView && !inRole) ? '' : undefined} data-admin-item={item.slug}>
        <div className="admin-thumb"><Image src={item.cover} unoptimized={isMediaSrc(item.cover)} alt="" width={192} height={120} sizes="96px" /></div>
        <div>
          <h3>
            {roleView && inRole ? `${index + 1}. ` : ''}
            {readOnly ? item.name : <button type="button" className="admin-item-name" onClick={() => setEditing(item)}>{item.name}</button>}
            {roleView?.featured === item.slug ? ' · 대표작' : ''}
          </h3>
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
          {!readOnly && (
            <button type="button" className="icon-btn" aria-label={`${item.name} 편집`} onClick={() => setEditing(item)}><IconEdit /></button>
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
        역할마다 무엇을 몇 번째에 보여 줄지 고르고, 항목마다 메모를 남깁니다.
        {readOnly
          ? ' 이 배포에는 저장소(D1)가 없어 저장할 수 없습니다 — 아래 변경안 코드를 저장소에 옮겨야 반영됩니다.'
          : ' 항목 이름(또는 연필)을 누르면 문구·사진을 세 언어로 고칩니다. 「저장」하면 바로 방문자 화면에 반영되고, 잘못 저장했으면 「최근 저장」에서 그 저장을 되돌립니다.'}
        {canSendToLasso ? ' 코멘트는 라쏘런에도 보냅니다.' : ' 이 빌드에는 라쏘런 수집 주소가 없어 코멘트는 이 브라우저에만 남습니다.'}
      </p>
      {!readOnly && (
        <div className="seg admin-tabs" role="tablist" aria-label="관리">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              data-dirty={(t.id === 'layout' ? changed : dirtyParts[t.id]) ? '' : undefined}
              title={(t.id === 'layout' ? changed : dirtyParts[t.id]) ? '저장 안 한 것이 있습니다' : undefined}
              onClick={() => {
                setTab(t.id);
                setOpened((o) => (o.has(t.id) ? o : new Set(o).add(t.id)));
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {!readOnly && (
        <>
          {/* 탭 패널은 한 번 열면 계속 붙여 두고 hidden 으로만 숨긴다 — 탭을 옮겨도 쓰던 것이 남는다 */}
          {opened.has('openSource') && <div role="tabpanel" id="panel-openSource" aria-labelledby="tab-openSource" hidden={tab !== 'openSource'}><RowsPanel which="openSource" items={items} onSaved={afterWrite} active={tab === 'openSource'} onDirty={dirtyOss} /></div>}
          {opened.has('videos') && <div role="tabpanel" id="panel-videos" aria-labelledby="tab-videos" hidden={tab !== 'videos'}><RowsPanel which="videos" items={items} onSaved={afterWrite} active={tab === 'videos'} onDirty={dirtyVideos} /></div>}
          {opened.has('add') && <div role="tabpanel" id="panel-add" aria-labelledby="tab-add" hidden={tab !== 'add'}><AddProject roleNames={Object.fromEntries(Object.entries(draft.roles).map(([id, r]) => [id, r.name]))} onSaved={afterWrite} onDirty={dirtyAdd} /></div>}
          {/* 최근 저장은 쓰는 것이 없어 열 때마다 새로 읽는다 */}
          {tab === 'history' && <div role="tabpanel" id="panel-history" aria-labelledby="tab-history"><HistoryPanel onChanged={afterWrite} /></div>}
        </>
      )}
      <div role={readOnly ? undefined : 'tabpanel'} id="panel-layout" aria-labelledby={readOnly ? undefined : 'tab-layout'} hidden={!readOnly && tab !== 'layout'}>
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
          <h2 className="panel-h admin-subhead">이 역할에 없는 항목</h2>
          <ul className="admin-list">{notInRole.map((item, i) => row(item, i, false))}</ul>
        </>
      )}

      <section className="admin-diff" aria-labelledby="diff-title" data-changed={changed ? '' : undefined}>
        <h2 id="diff-title">{readOnly ? '변경안' : '저장'} {changed ? '— 바꾼 것 있음' : '— 그대로'}</h2>
        {readOnly ? (
          <>
            <p>{changed ? '이 코드로 roles·hidden 을 바꾸면 방문자 화면에 반영됩니다.' : '아직 바꾼 것이 없습니다.'}</p>
            {changed && <pre>{draftSnippet(draft)}</pre>}
            <div className="billboard-actions">
              <button type="button" className="btn btn-primary" disabled={!changed} onClick={copyDraft}>{copied ? '복사했습니다' : '변경안 복사'}</button>
              <button type="button" className="btn btn-ghost" disabled={!changed} onClick={() => update(source)}>바꾼 것 취소</button>
            </div>
          </>
        ) : (
          <>
            <p role="status" aria-live="polite" data-admin-status={status.kind}>
              {status.text ?? (changed ? '아직 저장하지 않았습니다.' : '바꾼 것이 없습니다.')}
            </p>
            {status.kind === 'saved' && <SiteLinks paths={roleView ? [browsePath('ko', view)] : ['/']} label="반영 확인:" />}
            {status.problems && status.problems.length > 0 && (
              <ul className="admin-problems">{status.problems.slice(0, 8).map((p, i) => <li key={i}><code>{p.path}</code> {p.message}</li>)}</ul>
            )}
            <div className="billboard-actions">
              <button type="button" className="btn btn-primary" disabled={!changed || status.kind === 'busy'} onClick={saveLayout}>저장</button>
              <button type="button" className="btn btn-ghost" disabled={!changed || status.kind === 'busy'} onClick={() => update(source)}>바꾼 것 취소</button>
              <button type="button" className="btn btn-ghost" disabled={!lastUndoable || changed || status.kind === 'busy'} onClick={undoLast} title={lastUndoable?.summary}>마지막 저장 되돌리기</button>
              <button type="button" className="btn btn-ghost" onClick={logout}>로그아웃</button>
            </div>
            {changes.length > 0 && (
              <details className="admin-history">
                <summary>최근 저장 {changes.length}건 — 저장마다 되돌리기는 「최근 저장」 탭</summary>
                <ol>
                  {changes.map((c) => (
                    <li key={c.changeId} data-undone={c.undoneBy ? '' : undefined}>
                      <time dateTime={c.at}>{new Date(c.at).toLocaleString('ko-KR')} · {ACTOR_LABEL[c.actor] ?? c.actor}{c.undoneBy ? ' · 되돌림' : ''}</time>
                      {c.summary}
                    </li>
                  ))}
                </ol>
              </details>
            )}
          </>
        )}
      </section>
      </div>
      {editing && !readOnly && (
        <ItemEditor key={editing.slug} id={editing.slug} name={editing.name} kind={editing.kind} onClose={() => setEditing(null)} onSaved={afterWrite} onDirty={dirtyEditor} />
      )}
    </div>
  );
}

/** 변경안 — D1 이 없는 배포에서만. roles·hidden 에 옮길 모양(역할별 순서 + 숨김) */
function draftSnippet(draft: Layout): string {
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

function AdminGate({ onUnlock, readOnly, staticMode }: { onUnlock: () => void; readOnly: boolean; staticMode: boolean }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="admin-gate">
      <form
        className="fb-gate"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          if (staticMode) {
            // 정적 배포 — 서버가 없으니 예전처럼 브라우저에서 해시를 비교한다(가림막 — 저장 권한은 없다)
            const okPw = await isCorrectPassword(ref.current?.value ?? '');
            setBusy(false);
            if (okPw) {
              try { localStorage.setItem(UNLOCK_STORAGE_KEY, FEEDBACK_PASSWORD_HASH); } catch {}
              return onUnlock();
            }
            setError('비밀번호가 맞지 않습니다.');
            return ref.current?.select();
          }
          const r = await api('/api/content/auth', { method: 'POST', body: JSON.stringify({ password: ref.current?.value ?? '' }) });
          setBusy(false);
          if (r.ok) {
            // 예전처럼 어드민에 들어오면 이 브라우저의 피드백 모드도 열린다(같은 비밀번호)
            try { localStorage.setItem(UNLOCK_STORAGE_KEY, FEEDBACK_PASSWORD_HASH); } catch {}
            return onUnlock();
          }
          setError(r.status === 401 ? '비밀번호가 맞지 않습니다.' : r.error.message);
          ref.current?.select();
        }}
      >
        <h2>어드민</h2>
        <p>{readOnly ? '피드백 모드와 같은 비밀번호입니다. 이 배포에는 저장소(D1)가 없어 변경안 코드로만 내보냅니다.' : '피드백 모드와 같은 비밀번호입니다.'}</p>
        <input ref={ref} type="password" autoComplete="current-password" placeholder="비밀번호" aria-label="비밀번호" aria-invalid={Boolean(error)} autoFocus />
        {error && <p className="fb-gate-error" role="alert">{error}</p>}
        <div className="fb-gate-actions"><button type="submit" className="primary" disabled={busy}>열기</button></div>
      </form>
    </div>
  );
}
