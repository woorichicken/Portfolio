# 콘텐츠 API — 본문(D1) · 미디어(R2) · 어드민 저장 (2026-11-08)

어드민 「저장」과 에이전트(`pnpm content`)가 같은 API 를 부른다. 에이전트용 절차는 `.claude/skills/solhun-content/SKILL.md` 가 정본이고,
이 문서는 **API 의 모양과 데이터 구조, 운영으로 옮길 때 할 일**을 적는다.

> 2026-11-09 부터 운영(www.solhun.com)이 Cloudflare Workers 다 — `pnpm content … --target prod` 가 운영 API 에 쓴다(docs/DEPLOY.md 8절).
> 맨 아래 「토큰 받은 뒤 할 일」은 그 전환 때의 순서 기록이다.

## 한눈에

```
어드민 「저장」 ─┐                       ┌─ zod 검사(src/content/schema.ts) — 세 언어 모양·참조
pnpm content ───┼─> /api/content/* ────┼─ D1 쓰기(content_doc) + 직전 값 이력(content_history) — 한 batch
curl(Bearer) ───┘    (Worker)          └─ 바뀐 페이지만 무효화(revalidatePath → OpenNext D1 태그 캐시)
                                              ↓ 다음 요청이 D1 에서 새로 읽어 다시 그린다(R2 페이지 캐시에 저장)
```

| 무엇 | 어디 |
|---|---|
| 본문 문서 5개 | D1 `content_doc` — `content:ko` · `content:en` · `content:es`(types.ts 의 `Content` JSON) · `roles`(역할별 대표작·순서·이름) · `hidden`(숨김 id) |
| 이력 · 되돌리기 | D1 `content_history` — 저장(change)마다 문서별 한 줄: 직전 값 `prev_body` · 저장 값 `body` · 누가 · 무엇 · `undone_by` · `undoes` |
| 사진·영상 | R2 `MEDIA` 버킷 + D1 `media` 표 → 공개 주소 `/media/<키>`(Range 지원) |
| 페이지 캐시 | R2 `NEXT_INC_CACHE_R2_BUCKET`(OpenNext incremental cache) + D1 `revalidations`(태그 캐시) |
| 스키마 | `migrations/0001_content.sql` · `0002_history_undoes.sql` · `0003_version_check.sql`(검사에 쓴 안 바뀐 문서의 버전 가드) |
| 시드 | `pnpm db:seed:local` — 저장소의 `src/content/*.ts` 를 넣는다(멱등, 이미 있는 문서는 안 덮음) · `--force` 는 다른 것만 덮고 이력을 남김 |
| 빌드 | `pnpm cf:build` = D1 스냅숏(`scripts/content-snapshot.mjs`) → `next build` 가 그 스냅숏으로 미리 그림 → OpenNext 번들 |
| 운영 문서로 로컬 맞추기 | `for d in ko en es roles hidden; do pnpm -s content get --doc $d --target prod > <폴더>/$d.json; done` → `pnpm db:seed:local --force --from <폴더>` (읽기만 운영, 쓰기는 로컬) |

### 선택 칸 — 오픈소스 · 만든 영상 · 코드 보기 (2026-11-10)

새 칸은 **모두 선택**이라 없는 문서(그 전의 운영 D1)도 그대로 통과하고, 없으면 그 행·단추가 안 나온다. 칸 이름은 `src/content/types.ts` 가 정본.

| 칸 | 문서 | 모양 | 화면 |
|---|---|---|---|
| `openSource.items[]` | `content:*` | `{ id, name, body, repo, homepage? }` — `repo`·`homepage` 는 https · 세 언어 같은 값 | 역할 화면 「오픈소스」 행(글 카드 · 「코드 보기」 · 「사이트」) |
| `videos.items[]` | `content:*` | `{ id, title, body, src, poster, width, height, project? }` — `src` 는 `/media/….mp4·webm`(R2 만) · `poster` 사진 · `project` 는 있는 항목 id | 역할 화면 「만든 영상」 행(`<video controls preload="none" playsinline poster>` — 자동재생 없음) |
| `repo` | `work.projects[]` · `others.items[]` | https 주소 · 세 언어 같은 값 | 빌보드(대표작일 때)·상세 머리에 「GitHub 보러가기」 |
| `openSource` · `videos` | `roles.<역할>` | boolean(없으면 꺼짐) | 그 역할 화면에 행을 보일지 — 2026-11-10 시드: 오픈소스 maker·all · 영상 design·all |

- 행 제목·단추 글(「오픈소스」·「만든 영상」·「GitHub 보러가기」·「사이트」·「프로젝트 보기」)은 본문이 아니라 화면 글 `SCREEN`(src/content/roles.ts)이다.
- 미디어 키는 `<image|video>/<이름>-<SHA-256 앞 10자>.<확장자>` — 같은 파일은 어디서 몇 번 올려도 같은 주소라 시드(`src/content/*.ts`)에 운영과 같은 `src` 를 적어 둘 수 있다.

### 왜 이렇게 했나

- **문서 5개(언어마다 통째)** — 세 언어 모양 검사는 문서 전체를 나란히 봐야 한다. 한 문서 35KB 안팎이라 D1 한 줄(2MB 상한)·SQL 한 문(100KB)에 들어간다.
  시드 `--force` 는 문 하나에 본문이 두 번 들어가서 **한 문서가 50KB 를 넘으면 시드 SQL 이 막힌다**(API 쓰기는 바인딩이라 상관없음) — 그때 문서를 쪼갠다.
- **동시 저장 보호** — 쓰는 쪽은 「읽은 버전 + 1」을 쓰고, 그 사이 누가 먼저 썼으면 트리거(`content_doc_version_guard`)가 batch 전체를 되돌린다 → 409.
  **안 바꾼 문서도** 검사에 썼으므로 버전을 확인한다(`content_version_check` 트리거) — 추가 되돌리기와 숨김 저장이 겹쳐 숨김이 없는 항목을 가리키던 경합을 막는다.
- **되돌리기는 내용으로 판정** — 그 저장이 쓴 값이 지금 값과 같을 때만 되돌린다. 뒤의 저장을 조용히 지우지 않는다.
- **빌드는 스냅숏** — `next build` 가 여러 프로세스에서 동시에 로컬 D1(miniflare)을 열면 `internal error; reference = …` 로 죽는다(실측).
- **`dynamicParams = true`** — `false` 인 경로는 저장 뒤 캐시가 무효가 되면 OpenNext 가 `NoFallbackError` → 404 를 낸다(실측 `/as/design`). 모르는 값은 `notFound()` 로 그대로 404.

## 인증

| 누가 | 어떻게 | 비밀 |
|---|---|---|
| 사람(어드민) | `POST /api/content/auth {password}` → `solhun_admin` 쿠키(HttpOnly · Secure · SameSite=Strict · 12시간). 쓰기는 `Origin` 이 같은 호스트일 때만 | 비밀번호 해시 = `FEEDBACK_PASSWORD_HASH`(피드백 모드와 같음, `ADMIN_PASSWORD_HASH` 로 덮을 수 있음) · 서명 키 `ADMIN_SESSION_SECRET` |
| 에이전트 | `Authorization: Bearer <CONTENT_API_TOKEN>` | `CONTENT_API_TOKEN` |

- 비밀은 Worker secret(운영 `wrangler secret put`) · 로컬은 `.dev.vars`(0600, gitignore). **비밀이 없으면 그 방법은 꺼진다**(열어 두지 않는다).
- `/media/*` 는 공개(본문에 들어간 사진은 원래 공개). 나머지 `/api/content/*` 는 읽기도 인증을 받는다.
- 비밀번호 시도 횟수 제한은 아직 없다 — 운영 전에 Cloudflare WAF 속도 제한 규칙을 걸지 사람이 정한다(REPORT 「정할 것」).

## 엔드포인트

| 메서드 · 경로 | 본문 | 하는 일 |
|---|---|---|
| `POST /api/content/auth` | `{ password }` | 어드민 로그인 → 쿠키 |
| `GET /api/content/auth` | – | 지금 누구(`admin`·`agent`) |
| `DELETE /api/content/auth` | – | 로그아웃(쿠키 지움) |
| `GET /api/content` | – | 버전 · 항목 목록(id · kind · name · hidden · roles[{role, at, featured}]) · 역할 순서 · 숨김 |
| `GET /api/content/doc/<ko\|en\|es\|roles\|hidden>[?path=…]` | – | 문서 통째 또는 칸 하나(`value`) + `version` |
| `GET /api/content/item/<id>` | – | 항목 하나를 세 언어로(`item.ko` …) + 경로 + 배치 |
| `PATCH /api/content/field` | `{ path, locale, value }` · `{ path, values: {ko,en,es} }` · `{ path, unset: true, locales? }` (+`expect`) | 칸 고치기 |
| `POST /api/content/projects` | `{ kind: project\|other\|early, item: {ko,en,es}, at?, roles?: [{role, at?}] }` | 프로젝트 추가 |
| `PATCH /api/content/roles/<role>` | `{ place: {id, at?} }` · `{ remove }` · `{ featured }` · `{ projects }` · `{ others }` · `{ early }` · `{ openSource }` · `{ videos }` · `{ name\|blurb\|rowTitle: {ko,en,es} }` (+`expect`) | 역할 배치 · 행 켜고 끄기 |
| `PUT /api/content/layout` | `{ roles: { <role>: {featured, projects, others} }, hidden, expect? }` | 어드민 「저장」(한 change) |
| `PATCH /api/content/hidden` | `{ hide?: [id], show?: [id] }` | 숨김 |
| `GET /api/content/history?limit=20` | – | 최근 change(`changeId` · action · actor · summary · at · keys · undoneBy) |
| `POST /api/content/undo` | `{ changeId? }` 또는 빈 본문 | 되돌리기(없으면 가장 최근의 살아 있는 저장). 되돌리기의 changeId 를 주면 다시 하기. 본문이 깨진 JSON·객체가 아니면 400(가장 최근으로 새지 않는다) |
| `POST /api/content/media` | multipart `file`, `name?` | R2 에 올림 → `{ key, src, contentType, size, shot }` (201). 키 = `<image\|video>/<이름>-<내용 지문 10자>.<확장자>` — 같은 파일은 같은 키(다시 올리면 덮고 목록엔 한 줄) |
| `GET /api/content/media` | – | 올린 것 목록 |
| `GET /media/<key>` | `Range: bytes=…` 가능 | 공개 내보내기(200 · 206 — 끝이 크기를 넘으면 파일 끝까지로 줄여 헤더도 그 값 · 시작이 끝을 넘으면 416) |

`path` 는 `work.projects[kits].tagline` 꼴 — `[번호]` 또는 `[id/slug]`. `expect: { roles: 3, hidden: 1 }` 를 주면 그 버전이 아닐 때 409(화면을 오래 열어 둔 어드민이 쓴다).

## 응답 모양

성공 — 쓰기는 늘 이 모양이다:

| 칸 | 뜻 |
|---|---|
| `ok` | `true` |
| `changeId` | 이 저장의 id(되돌리기에 쓴다). **바뀐 것이 없으면 `null`** 이고 아무것도 다시 그리지 않는다 |
| `changed` | 바뀐 문서 키 목록 |
| `versions` | 저장 뒤 문서별 버전 |
| `revalidated` | 다시 그리게 만든 주소 — 상세에만 보이는 칸은 그 상세 하나, 카드·빌보드 칸은 그 언어 전체(+`/llms.txt`), 역할·숨김은 세 언어 전체, 항목 수가 바뀌면 `/sitemap.xml` |
| `actor` · `summary` | 누가 · 한 줄 요약(이력에 그대로) |
| `undid` | (undo 만) 되돌린 changeId |

실패 — `{ ok: false, error: { code, message, problems? } }`:

| HTTP | code | 언제 | 할 일 |
|---|---|---|---|
| 400 | `bad_json` · `bad_request` · `bad_path` | 본문이 JSON 아님 · 필수 칸 빠짐 · 경로를 못 읽음 | 메시지대로 |
| 401 | `unauthorized` | 쿠키·토큰 없음/틀림 · 비밀번호 틀림 | 로그인 · 토큰 확인 |
| 403 | `bad_origin` | 쿠키로 다른 출처에서 쓰기 | 같은 사이트에서 · 에이전트는 Bearer |
| 404 | `not_found` | 없는 id · 경로 · 역할 · changeId | `GET /api/content` |
| 409 | `exists` | 추가하려는 id 가 이미 있음 | `field` 로 고치기 |
| 409 | `conflict` | 동시 저장 · `expect` 불일치 · 되돌리려는 저장 뒤에 또 바뀜 · 이미 되돌림 · 시드 되돌리기 · 대표작 빼기 | 다시 읽고 다시 · history 확인 |
| 413 · 415 | `too_large` · `unsupported` | 미디어 크기·형식 | 줄이거나 형식 바꿈 |
| 416 | – | `/media/*` 에 채울 수 없는 Range | 구간을 고침 |
| 422 | `invalid` + `problems[{path, message}]` | zod 검사 · 세 언어 모양 · 참조(없는 id, 겹치는 id) | `problems` 경로를 고침 |
| 503 | `no_db` · `not_seeded` · `no_r2` · `no_secret` · `no_snapshot` | 바인딩·시드·비밀·빌드 스냅숏 없음 | 아래 로컬 절차 |
| 500 | `internal` | 그 밖 | `wrangler tail`(운영) · 로컬 로그 |

## 로컬에서 돌리기

```bash
pnpm db:migrate:local && pnpm db:seed:local          # D1 (.wrangler/state) — 처음 한 번
[ -f .dev.vars ] || { umask 077; printf 'CONTENT_API_TOKEN=%s\nADMIN_SESSION_SECRET=%s\n' "$(openssl rand -hex 24)" "$(openssl rand -hex 32)" > .dev.vars; }   # 로컬 비밀(0600)
pnpm cf:build                                        # 스냅숏 → next build → OpenNext
pnpm cf:preview                                      # http://127.0.0.1:8797 (populateCache local + wrangler dev)
scripts/with-workers.sh <명령>                        # 띄우고 → 명령 → 닫기(E2E·검증 스크립트용)
pnpm test                                            # 유닛(vitest — schema · ops · store(node:sqlite 에 같은 마이그레이션))
pnpm cf:build && pnpm e2e:workers                      # E2E(Workers) — e2e/*.spec.ts 전부(정적 스펙 *.static.spec.ts 는 빠진다)
CONTENT_SOURCE=static pnpm build && pnpm e2e:static    # E2E(정적 = 지금 Vercel) — e2e/*.static.spec.ts 만
node scripts/verify-routes.mjs --a https://www.solhun.com --b http://127.0.0.1:8797   # 운영과 경로 대조
```

`next dev`(`pnpm dev`)도 `initOpenNextCloudflareForDev()` 로 같은 로컬 D1 을 읽는다. Vercel 빌드(`VERCEL=1`)나 `CONTENT_SOURCE=static` 은 D1 대신 저장소 TS 파일을 읽고, `/api/content/*` 는 전부 503 `no_db` 이다 — **운영을 옮기는 동안 지금 Vercel 배포가 깨지지 않게** 둔 길이다.
어드민도 그때는 API 를 부르지 않고 예전처럼 브라우저 해시로 열려 변경안 코드·코멘트만 쓴다. 확인: `CONTENT_SOURCE=static pnpm build && pnpm e2e:static`(`e2e/admin.static.spec.ts`).

## 토큰 받은 뒤 할 일 (운영 전환 — 사람 승인 뒤, 순서대로)

계정 `4521ed2f6bd35977301d9344ffcbbc8e`(solhun.com zone 과 같은 계정). 토큰 권한: Workers Scripts · D1 · R2 · Workers Routes(zone) · (선택) Images.

| # | 할 일 | 명령 · 확인 |
|---|---|---|
| 1 | D1 만들기 → `wrangler.jsonc` 두 군데(`DB`·`NEXT_TAG_CACHE_D1`)의 `database_id` 자리표시를 실제 id 로 | `pnpm exec wrangler d1 create solhun-portfolio` |
| 2 | R2 버킷 둘 | `wrangler r2 bucket create solhun-portfolio-cache` · `… solhun-portfolio-media` |
| 3 | 원격 마이그레이션 | `pnpm exec wrangler d1 migrations apply DB --remote` |
| 4 | 원격 시드 — 이 저장소의 시드 스크립트는 `--remote` 를 거절한다. 로컬 시드 SQL(`.wrangler/seed/seed-*.sql`)을 원격에 한 번 | `pnpm db:seed:local --dry-run` 로 SQL 을 만들고 → `wrangler d1 execute DB --remote --file=<그 SQL>` → `SELECT key, version FROM content_doc` 5줄 |
| 5 | 비밀 | `wrangler secret put CONTENT_API_TOKEN` · `ADMIN_SESSION_SECRET` — 값은 1Password lightsoft 「직원」에 같이 둔다. 에이전트용 토큰 파일 `~/.config/portfolio/content-api-token`(0600) |
| 6 | 빌드 명령(Workers Builds) | `pnpm install --frozen-lockfile && node scripts/content-snapshot.mjs --remote && pnpm exec opennextjs-cloudflare build` — 빌드 변수 `NEXT_PUBLIC_DP_FEEDBACK_URL`·`NEXT_PUBLIC_DP_FEEDBACK_KEY`·`CLI_MANAGER_ROUTES=1`(번들에 박히는 값 — Vercel 과 같게) · 배포 명령 `pnpm exec opennextjs-cloudflare deploy`(populateCache remote 포함) · 연결은 `cf-workers-builds` 스킬 |
| 7 | 첫 배포 뒤 `*.workers.dev` 에서 대조 | `node scripts/verify-routes.mjs --a https://www.solhun.com --b https://solhun-portfolio.<계정>.workers.dev --cli-manager 1` 20경로 · 번들의 `dp-agentation-ingest` 세기(docs/DEPLOY.md 5절) |
| 8 | 저장 → 반영 실측(운영) | `pnpm content set kits.summary "…" --locale ko --target prod --base https://…workers.dev` → 상세에 보임 → `undo` |
| 9 | 도메인 전환 | Vercel 에서 `solhun.com`·`www` 를 떼고 Workers Custom Domain 으로 — DNS 가 이미 Cloudflare. 순서·롤백은 사람과 정한다(REPORT) |
| 10 | 피드백 수집 소스 허용 호스트 | 새 `*.workers.dev` 를 쓰려면 `dp update-source-hosts` + `FEEDBACK_HOSTS`(docs/DEPLOY.md 4절) |

확인 못 한 것(조사 세션 결과 `~/Downloads/_batches/task-portfolio-d1-1108/research/opennext-d1-r2.md` 로 채운다): 무료 플랜 Worker CPU 한도로 다시 그리기가 버티는지 ·
압축 번들 크기 상한(로컬 실측 `handler.mjs` gzip 약 1.16MB — wrangler 최종 번들은 안 쟀다) · D1 Time Travel 보존 기간 · R2 무료 한도.
