#!/usr/bin/env node
// pnpm content — 포트폴리오 본문을 콘텐츠 API(/api/content/*)로 읽고 고친다. 에이전트용 스킬: .claude/skills/solhun-content/SKILL.md
//
//   pnpm content get                                   항목 목록(id · 종류 · 이름 · 숨김 · 역할 배치)
//   pnpm content get kits                              항목 하나를 세 언어로
//   pnpm content get kits.tagline                      칸 하나(세 언어)
//   pnpm content set kits.tagline "새 한 줄" --locale ko
//   pnpm content set kits.tagline --ko "…" --en "…" --es "…"
//   pnpm content add-project new.json                  (pnpm content add-project --template other > new.json)
//   pnpm content role design --place fair --at 0       (--remove · --featured · --order a,b,c · --others-order …)
//   pnpm content role maker --open-source on           「오픈소스」·「만든 영상」 행 켜고 끄기(--videos on|off)
//   pnpm content set openSource --as-json --ko '{"items":[…]}' --en '…' --es '…'   (videos · kits.repo 도 같은 식)
//   pnpm content hide motion-meme                      (--show 로 다시 보이기)
//   pnpm content undo [changeId] · history
//   pnpm content media ./shot.jpg [--name kits-board] · media --list
//
// 어디로: --target local(기본, http://127.0.0.1:8797) | prod(https://www.solhun.com) · 또는 --base <주소> · 환경변수 CONTENT_API_URL
// 토큰: 환경변수 CONTENT_API_TOKEN → (local) .dev.vars → (prod) ~/.config/portfolio/content-api-token
// 종료코드: 0 성공 · 1 API 가 거절(검사 실패·충돌·인증 등 — 이유를 찍는다) · 2 사용법 · 3 서버에 닿지 못함

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const TARGETS = { local: 'http://127.0.0.1:8797', prod: 'https://www.solhun.com' };
const LOCALES = ['ko', 'en', 'es'];
const LIST_PATH = { project: 'work.projects', other: 'others.items', early: 'early.items' };

// ── 인자 ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) flags[key] = true;
    else {
      flags[key] = next;
      i += 1;
    }
  } else positional.push(a);
}
const [command, ...rest] = positional;

function usage(message) {
  if (message) console.error(`✗ ${message}\n`);
  console.error(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 19).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(2);
}

// ── 연결 ──────────────────────────────────────────────────────────────────
const target = flags.target ?? 'local';
if (!flags.base && !TARGETS[target]) usage(`--target 은 local 또는 prod 입니다: ${target}`);
const BASE = String(flags.base ?? process.env.CONTENT_API_URL ?? TARGETS[target]).replace(/\/$/, '');

function token() {
  if (process.env.CONTENT_API_TOKEN) return process.env.CONTENT_API_TOKEN.trim();
  if (target === 'local' && existsSync('.dev.vars')) {
    const m = readFileSync('.dev.vars', 'utf8').match(/^CONTENT_API_TOKEN=(.+)$/m);
    if (m) return m[1].trim();
  }
  const file = join(homedir(), '.config/portfolio/content-api-token');
  if (existsSync(file)) return readFileSync(file, 'utf8').trim();
  console.error(`✗ 토큰이 없습니다 — CONTENT_API_TOKEN 환경변수, ${target === 'local' ? '.dev.vars' : file} 중 하나`);
  process.exit(2);
}

async function call(method, path, body, { form } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { authorization: `Bearer ${token()}`, ...(form ? {} : { 'content-type': 'application/json' }) },
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch (e) {
    console.error(`✗ ${BASE} 에 닿지 못했습니다 (${e.cause?.code ?? e.message}) — local 이면 pnpm cf:build 뒤 scripts/with-workers.sh 로 띄웠는지`);
    process.exit(3);
  }
  const json = await res.json().catch(() => null);
  if (!json?.ok) {
    const err = json?.error ?? { code: `http_${res.status}`, message: '응답이 JSON 이 아닙니다' };
    console.error(`✗ ${res.status} ${err.code} — ${err.message}`);
    for (const p of err.problems ?? []) console.error(`   · ${p.path}: ${p.message}`);
    process.exit(1);
  }
  return json;
}

const print = (v) => console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 2));

function reportWrite(r) {
  if (flags.json) return print(r);
  if (!r.changeId) return console.log('= 바뀐 것이 없어 저장하지 않았습니다');
  console.log(`✓ 저장 ${r.changeId} — ${r.summary ?? ''}`);
  console.log(`  바뀐 문서 ${r.changed.join(', ')} · 버전 ${r.changed.map((k) => `${k} v${r.versions[k]}`).join(', ')}`);
  console.log(`  다시 그린 주소 ${r.revalidated.length}곳${r.revalidated.length <= 6 ? `: ${r.revalidated.join(' ')}` : ` (예: ${r.revalidated.slice(0, 4).join(' ')} …)`}`);
  console.log(`  되돌리기: pnpm content undo ${r.changeId}${target !== 'local' ? ` --target ${target}` : ''}`);
}

/** `kits.tagline` 처럼 항목 id 로 시작하면 API 경로(work.projects[kits].tagline)로 바꾼다. 이미 전체 경로면 그대로 */
async function resolvePath(path) {
  const [head, ...tail] = path.split('.');
  if (/[[\]]/.test(head) || ['meta', 'a11y', 'nav', 'hero', 'stats', 'work', 'others', 'early', 'openSource', 'videos', 'timeline', 'awards', 'contact', 'detail', 'footer', 'feedback'].includes(head)) return path;
  const { items } = await call('GET', '/api/content');
  const item = items.find((i) => i.id === head);
  if (!item) {
    console.error(`✗ "${head}" 는 항목 id 도 본문 맨 위 칸도 아닙니다 — pnpm content get 으로 id 를 보세요`);
    process.exit(2);
  }
  return [`${LIST_PATH[item.kind]}[${head}]`, ...tail].join('.');
}

const parseValue = (v) => {
  if (!flags['as-json']) return v;
  try {
    return JSON.parse(v);
  } catch {
    usage(`--as-json 인데 JSON 이 아닙니다: ${v}`);
  }
};

// ── 명령 ──────────────────────────────────────────────────────────────────
const TEMPLATES = {
  other: {
    kind: 'other',
    roles: [{ role: 'design', at: 0 }],
    item: Object.fromEntries(
      LOCALES.map((l) => [l, { slug: 'my-new-work', name: `(${l}) 이름`, period: '2026', body: `(${l}) 카드 아래 한 줄`, shot: { src: '/work/design_atlas.jpg', width: 1400, height: 875, alt: `(${l}) 사진 설명` }, detail: { facts: [{ label: `(${l}) 역할`, value: `(${l}) 값` }], paragraphs: [`(${l}) 상세 문단`] } }]),
    ),
  },
  project: {
    kind: 'project',
    roles: [{ role: 'all' }],
    item: Object.fromEntries(
      LOCALES.map((l) => [l, { id: 'my-new-project', context: `(${l}) 소속 맥락`, name: `(${l}) 이름`, tagline: `(${l}) 빌보드 한 줄`, summary: `(${l}) 상세 요약`, facts: [{ label: `(${l}) 기간`, value: '2026' }], cover: { src: '/work/kits_round.jpg', width: 1400, height: 900, alt: `(${l}) 사진 설명` } }]),
    ),
  },
};

const commands = {
  async get() {
    const [what] = rest;
    if (flags.doc) {
      const q = flags.path ? `?path=${encodeURIComponent(flags.path)}` : '';
      return print((await call('GET', `/api/content/doc/${flags.doc}${q}`)).value);
    }
    if (!what) {
      const r = await call('GET', '/api/content');
      if (flags.json) return print(r);
      console.log(`문서 버전 ${Object.entries(r.versions).map(([k, v]) => `${k} v${v}`).join(' · ')} · 마지막 저장 ${r.updatedAt}`);
      console.table(r.items.map((i) => ({ id: i.id, 종류: i.kind, 이름: i.name, 숨김: i.hidden ? '숨김' : '', 역할: i.roles.map((x) => `${x.role}#${x.at + 1}${x.featured ? '★' : ''}`).join(' ') })));
      return;
    }
    const [id, ...fieldParts] = what.split('.');
    const item = await call('GET', `/api/content/item/${encodeURIComponent(id)}`);
    if (!fieldParts.length) return print(flags.json ? item : { id: item.id, kind: item.kind, path: item.path, hidden: item.hidden, roles: item.roles, item: item.item });
    const path = await resolvePath(what);
    const values = {};
    for (const l of LOCALES) values[l] = (await call('GET', `/api/content/doc/${l}?path=${encodeURIComponent(path)}`)).value;
    print({ path, ...values });
  },

  async set() {
    const [rawPath, value] = rest;
    if (!rawPath) usage('set <경로> <값> --locale ko  또는  set <경로> --ko … --en … --es …');
    const path = await resolvePath(rawPath);
    let body;
    if (flags.unset) body = { path, unset: true, ...(flags.locale ? { locales: [flags.locale] } : {}) };
    else if (LOCALES.some((l) => flags[l] !== undefined)) body = { path, values: Object.fromEntries(LOCALES.filter((l) => flags[l] !== undefined).map((l) => [l, parseValue(flags[l])])) };
    else {
      if (value === undefined) usage('값이 없습니다');
      if (!flags.locale) usage('한 언어만 고칠 때는 --locale ko|en|es 를 주세요(세 언어는 --ko --en --es)');
      body = { path, locale: flags.locale, value: parseValue(value) };
    }
    reportWrite(await call('PATCH', '/api/content/field', body));
  },

  async 'add-project'() {
    if (flags.template) {
      const t = TEMPLATES[flags.template];
      if (!t) usage('--template other|project');
      return print(t);
    }
    const [file] = rest;
    if (!file) usage('add-project <파일.json>  (틀: pnpm content add-project --template other > new.json)');
    reportWrite(await call('POST', '/api/content/projects', JSON.parse(readFileSync(file, 'utf8'))));
  },

  async role() {
    const [role] = rest;
    if (!role) usage('role <design|product|ax|maker|all> --place <id> [--at N] | --remove <id> | --featured <id> | --order a,b,c | --others-order a,b | --open-source on|off | --videos on|off');
    const body = {};
    if (flags.place) body.place = { id: flags.place, ...(flags.at !== undefined ? { at: Number(flags.at) } : {}) };
    if (flags.remove) body.remove = flags.remove;
    if (flags.featured) body.featured = flags.featured;
    if (flags.order) body.projects = String(flags.order).split(',');
    if (flags['others-order']) body.others = String(flags['others-order']).split(',');
    // 행 켜고 끄기 — roles 문서의 openSource · videos(없으면 꺼진 것)
    for (const [flag, key] of [['open-source', 'openSource'], ['videos', 'videos']]) {
      if (flags[flag] === undefined) continue;
      if (!['on', 'off'].includes(flags[flag])) usage(`--${flag} 는 on 또는 off 입니다`);
      body[key] = flags[flag] === 'on';
    }
    if (!Object.keys(body).length) {
      const r = await call('GET', '/api/content');
      return print(r.roles[role] ?? `모르는 역할: ${role}`);
    }
    reportWrite(await call('PATCH', `/api/content/roles/${role}`, body));
  },

  async hide() {
    if (!rest.length) usage('hide <id…> [--show]');
    reportWrite(await call('PATCH', '/api/content/hidden', flags.show ? { show: rest } : { hide: rest }));
  },

  async undo() {
    const [changeId] = rest;
    const r = await call('POST', '/api/content/undo', changeId ? { changeId } : {});
    if (flags.json) return print(r);
    console.log(`✓ 되돌림 ${r.undid} → 새 저장 ${r.changeId} · 다시 그린 주소 ${r.revalidated.length}곳`);
  },

  async history() {
    const r = await call('GET', `/api/content/history?limit=${flags.limit ?? 10}`);
    if (flags.json) return print(r);
    console.table(r.changes.map((c) => ({ changeId: c.changeId, 언제: c.at, 누가: c.actor, 무엇: c.action, 요약: c.summary, 되돌림: c.undoneBy ?? '' })));
  },

  async media() {
    if (flags.list) {
      const r = await call('GET', '/api/content/media');
      return flags.json ? print(r) : console.table(r.media.map((m) => ({ src: m.src, 형식: m.content_type, 크기: m.width ? `${m.width}×${m.height}` : '', 바이트: m.size, 올린때: m.uploaded_at })));
    }
    const [file] = rest;
    if (!file) usage('media <파일> [--name 이름] | media --list');
    const ext = file.split('.').pop().toLowerCase();
    const type = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm' }[ext];
    if (!type) usage(`모르는 확장자: .${ext}`);
    const form = new FormData();
    form.set('file', new Blob([readFileSync(file)], { type }), basename(file));
    if (flags.name) form.set('name', flags.name);
    const r = await call('POST', '/api/content/media', undefined, { form });
    if (flags.json) return print(r);
    console.log(`✓ 올림 ${r.src} (${r.contentType} · ${r.size} 바이트)`);
    if (r.shot) console.log(`  본문에 넣을 shot — alt 는 언어마다 채운다:\n${JSON.stringify(r.shot)}`);
  },
};

if (!command || command === 'help' || flags.help) usage();
if (!commands[command]) usage(`모르는 명령: ${command}`);
await commands[command]();
