# 배포 · CI/CD · 도메인

> **2026-11-09 부터 운영은 Cloudflare Workers 다** — `solhun.com`·`www.solhun.com` → Worker `solhun-portfolio`, 배포 = `main` 머지(Workers Builds). 지금 상태·되돌리기는 **8절**. 1~7절은 Vercel 시절 기록(2026-09-30 실측)이다. **Vercel 프로젝트 `solhun-portfolio` 는 2026-11-10 삭제했다**(사람 결정) — 도메인 등록(`solhun.com`, 등록처 Vercel · 자동 갱신 켜짐 · 만료 2026-12-01 · $12.03)은 프로젝트와 별개라 그대로 남는다.

이 문서는 **사람이 결정할 것과 그 절차**를 담는다. 2026-09-30 에 2절 추천안(새 프로젝트)으로 배포했다 —
도메인(`solhun.com`) 이전과 `CLI_MANAGER_ROUTES` 도 **끝났다**(2026-10-04 실측 — 아래 표 `solhun.com` 행).

## 1. 지금 상태 (실측)

| 항목 | 상태 | 근거 |
|---|---|---|
| **새 배포처** | 팀 `gyeonghunjeong-7007s-projects` 의 **`solhun-portfolio`** (`prj_6L8ZpedYsO8XUD4wV8MvEBkFn6HR`). 프로덕션 **https://solhun-portfolio.vercel.app** | `GET /v9/projects/<id>/domains` |
| 새 프로젝트 Git 연결 | `woorichicken/Portfolio`, production branch `main`. REST `POST /v11/projects` 에 `gitRepository` 를 넣어 만들었고 조직 권한 문제 없이 붙었다 | PR #1 체크 `Vercel – solhun-portfolio` |
| 새 프로젝트 env | `NEXT_PUBLIC_DP_FEEDBACK_URL`·`NEXT_PUBLIC_DP_FEEDBACK_KEY` (Production+Preview) | `GET /v9/projects/<id>/env` |
| 첫 배포 주의 | 프로덕션 배포가 없는 새 프로젝트라 **첫 브랜치 push(`d92eea7`)가 프로덕션으로 올라갔다**(Vercel 동작). 머지 뒤부터는 `main` 만 프로덕션 | `dpl_3FGUB761cVQUPN3KmVK8Wmm2N9hs` target=production |
| Deployment Protection | Standard(`all_except_custom_domains`) — 프로덕션 주소 `solhun-portfolio.vercel.app` 는 공개, 해시 붙은 배포 주소·프리뷰는 Vercel 로그인 필요 | 프로젝트 `ssoProtection` |
| GitHub 저장소 | `woorichicken/Portfolio` (repoId 1034202255). 옛 `agi040922/Portfolio` 는 리다이렉트 | `gh api repos/woorichicken/Portfolio --jq .id` |
| 로컬 `origin` | 아직 `https://github.com/agi040922/Portfolio.git` — 리다이렉트로 push 까지 동작 | `git remote -v` |
| 옛 배포처 | 팀 **`jkh040922-gmailcoms-projects`**(다른 Vercel 계정)의 `portfolio`. 홈페이지 `portfolio-sage-five-xdfwq9lj38.vercel.app` | GitHub deployments status |
| 옛 프로젝트 Git 연동 | ✅ **정리됨(2026-09-30)** — Aside 로 옛 계정에 로그인해 Git 해제를 시도(Vercel `Not authorized`) → Ignored Build Step `exit 0` → 사용자 승인으로 **프로젝트 삭제**. 이제 `main` push 는 `solhun-portfolio` 에만 배포된다 | `portfolio-sage-five-xdfwq9lj38.vercel.app` 404 |
| (기록) 머지 뒤 옛 프로젝트 | PR #1 머지(`d9c72b3`)로 옛 `portfolio` 도 **프로덕션 재배포** — `portfolio-sage-five-xdfwq9lj38.vercel.app` 가 새 사이트(ko/en/es 200)를 서빙한다. 단 그 빌드엔 피드백 env 가 **없다**(동적 청크의 `dp-agentation-ingest` 0) → 그 주소에서 `?feedback` 은 관문까지만 되고 위젯은 안 뜬다. 피드백은 새 주소에서 받는다 | `gh api …/deployments` Production – portfolio `d9c72b3`, 5절 청크 세기 |
| (기록) 옛 프로젝트 env | **미확인** (접근 불가). 저장소에 `.env*`·`vercel.json` 은 없다 | – |
| `solhun.com`·`www.solhun.com` | **`solhun-portfolio`**(이 저장소)에 연결 — 이전 완료. apex → www 307. `climanager.solhun.com` 은 `solhun-web-page`. `CLI_MANAGER_ROUTES` 켜짐(`/changelog` 301 → climanager, `/privacy` 200) | `vercel domains inspect solhun.com --scope gyeonghunjeong-7007s-projects` (2026-10-04) · `curl -sI https://www.solhun.com/changelog` |
| DNS | 네임서버 Cloudflare. `*.solhun.com` 와일드카드 CNAME 이 Vercel 로 감 | `dig NS solhun.com` |
| 도메인 등록 만료 | ⚠️ **2026-12-01** (Vercel 등록) | 같은 명령 |
| GitHub Actions | 없음(워크플로 0) · `main` 브랜치 보호 없음 | `gh api …/actions/workflows`, `…/branches/main/protection` → 404 |

## 2. 선택지 — 어느 Vercel 계정에 둘 것인가 (사람 결정)

### ✅ 추천: `gyeonghunjeong-7007s-projects` 에 새 프로젝트를 만들고 `woorichicken/Portfolio` 를 Git 연결

- **도메인 이동이 같은 계정 안에서 끝난다.** `solhun.com` 이 이미 이 계정에 등록돼 있어서 `solhun-web-page` 에서 떼고
  새 프로젝트에 붙이면 된다 — TXT 소유 확인이 필요 없고, DNS 도 바꾸지 않는다.
- 지금 CLI·API 로 관리하는 계정이라 env·배포·로그를 이 머신에서 바로 확인할 수 있다(옛 계정은 접근 불가였다).
- 저장소 이전(agi040922 → woorichicken) 뒤 Git 연동이 살아 있는지 확인할 필요가 없어진다 — 새로 연결하니까.
- 대가: 옛 프로젝트의 배포 이력·Analytics 는 옛 계정에 남는다. `portfolio-sage-five-xdfwq9lj38.vercel.app` 주소도 옛 계정 것이라
  새 프로젝트에서는 다른 `*.vercel.app` 주소가 생긴다(→ 피드백 소스 허용 호스트에 그 주소를 추가, 아래 4절).

절차(사람이 실행):

```bash
# 1) 이 브랜치를 main 에 머지하고 woorichicken/Portfolio 에 push (사람 결정)
# 2) Vercel 대시보드 → gyeonghunjeong-7007s-projects → Add New Project → Import woorichicken/Portfolio
#    (Vercel GitHub App 이 woorichicken 계정의 이 저장소에 접근 가능해야 한다)
#    Framework: Next.js · Install: pnpm install · Build: pnpm build · Node: 22.x 이상
# 3) env 등록 (3절 표) — 값은 ~/.config/portfolio/source.json 에서. 화면·로그에 찍지 않는다
vercel env add NEXT_PUBLIC_DP_FEEDBACK_URL production --scope gyeonghunjeong-7007s-projects
vercel env add NEXT_PUBLIC_DP_FEEDBACK_KEY production --scope gyeonghunjeong-7007s-projects
# 4) 첫 배포 뒤 5절 검증 → 도메인 이전(6절)
# 5) 옛 계정의 프로젝트는 도메인 이전이 끝난 뒤 정리(삭제 또는 Git 연결 해제) — 같은 저장소 push 가 두 곳에 배포되지 않게
```

### 대안: 기존 계정(`jkh040922-gmailcoms-projects`) 유지 + TXT 소유 확인으로 도메인 추가

- 배포 이력·기존 `*.vercel.app` 주소를 그대로 쓴다.
- 대신 **계정을 넘는 도메인 작업**이 된다: `solhun-web-page`(다른 계정)에서 도메인을 뗀 뒤 옛 계정에서 추가하면 Vercel 이
  `_vercel` TXT 레코드를 요구한다 → Cloudflare 에 미리 넣어 두고 진행. 또는 `vercel domains move` 로 도메인 자체를 옮기는데,
  그러면 같은 도메인에 걸린 `excel.solhun.com`·`india.solhun.com`·`climanager.solhun.com` 연결 영향부터 확인해야 한다.
- 먼저 그 계정으로 `vercel login` 해서 **저장소 이전 뒤 Git 연결이 살아 있는지**(프로젝트 Settings → Git 의 저장소가
  `woorichicken/Portfolio` 인지)부터 확인해야 한다. 끊겨 있으면 push 해도 배포되지 않는다.
- 도메인 만료(2026-12-01) 갱신 주체와 사이트 운영 계정이 갈린다.

## 3. 필요한 env

| 이름 | 환경 | 값 | 없으면 |
|---|---|---|---|
| `NEXT_PUBLIC_DP_FEEDBACK_URL` | Production (Preview 는 선택*) | 라쏘런 수집 URL (`…/dp-agentation-ingest/93045b0c-…`) | 관문을 통과해도 위젯이 **조용히 안 뜬다** |
| `NEXT_PUBLIC_DP_FEEDBACK_KEY` | Production (Preview 는 선택*) | publishable 키 `dp_ingest_…` | 같음 |
| `NEXT_PUBLIC_SITE_URL` | 선택 | 기본 `https://solhun.com`. canonical·hreflang·sitemap 의 기준 | 기본값 사용. apex 대신 www 를 정본으로 두면 `https://www.solhun.com` |
| `CLI_MANAGER_ROUTES` | **Production 만**, 도메인 이전 시점에 | `1` | CLI Manager 옛 경로(`/changelog` 등)가 404 — 6절 |

\* 수집 소스는 호스트 와일드카드를 받지 않는다(`hostPatterns에는 … wildcard를 사용할 수 없습니다`). 프리뷰마다 주소가
바뀌므로 Preview 에 넣어도 전송은 403 이다. 프리뷰에서 쓰려면 브랜치 별칭 주소를 소스에 추가한다.

`NEXT_PUBLIC_*` 는 **빌드 때 번들에 박힌다.** env 만 바꾸고 재배포하지 않으면 반영되지 않는다.

## 4. 피드백 관문 운영

| 항목 | 값 |
|---|---|
| 동작 | `?feedback` 로 열기 → 비밀번호 → 통과한 브라우저에서만 위젯 청크를 동적 import. `?feedback=off` 로 끔 |
| 성격 | **보안 장치가 아니라 가림막.** 키는 원래 publishable 이고, 실제로 막는 건 수집 소스의 허용 호스트 |
| 라쏘런 프로젝트 | `포트폴리오 (solhun.com)` — `6a0cb795-f52c-47bd-bb61-ada9749afbde` |
| 수집 소스 | `portfolio-web` — `93045b0c-03e3-4f8d-916e-9ed60b127f45` |
| 소스 허용 호스트 | `solhun.com`, `www.solhun.com`, `portfolio-sage-five-xdfwq9lj38.vercel.app`, `localhost:3427`, `solhun-portfolio.vercel.app`(2026-09-30 추가) |
| 관문 허용 호스트 | `src/lib/feedback-gate.ts` 의 `FEEDBACK_HOSTS` — **소스와 같게 둔다** |
| 비밀번호 원문 | `~/.config/portfolio/feedback-password.txt` (0600, 저장소에 없음). 번들엔 솔트+SHA-256 해시만. **어드민(`/admin`)도 같은 비밀번호** · 1Password lightsoft 「직원」(Employee) 항목 「solhun.com 포트폴리오 — 피드백·어드민 비밀번호」(2026-11-02 등록 · 값 대조 통과). 바꾸면 두 곳을 같이 고친다 |
| 키·소스 원본 | `~/.config/portfolio/source.json` (0600) |
| 로컬 포트 | `3427` (`pnpm dev` / `pnpm start`). 3417 은 다른 저장소 세션이 쓰고 있어 옮겼다 |

호스트를 늘릴 때(예: 새 Vercel 프로젝트 주소):

```bash
dp update-source-hosts 93045b0c-03e3-4f8d-916e-9ed60b127f45 --add-host <새호스트>   # 소스 먼저 — 키는 그대로
# 그다음 FEEDBACK_HOSTS 에 같은 값 추가 → pnpm verify:feedback-gate
```

비밀번호를 바꿀 때: 새 무작위 문자열로 `FEEDBACK_PASSWORD_HASH` 를 다시 계산(`solhun-portfolio/feedback/v1:<비번>` 의 SHA-256)하고
원문 파일을 교체한다. 해시가 바뀌면 이미 통과한 브라우저도 자동으로 잠긴다.

## 5. 배포 뒤 검증

### 2026-09-30 실측 (`https://solhun-portfolio.vercel.app`, 커밋 `d92eea7` → 머지 `d9c72b3` 재확인)

| 항목 | 결과 |
|---|---|
| `/`·`/en`·`/es`·`/sitemap.xml`·`/robots.txt`·`/?feedback` | 전부 200. `/en` 은 `lang="en"` + hreflang ko/en/es/x-default |
| 번들의 env | 동적 청크 `216.951df721d3217408.js` 에 `dp-agentation-ingest` **1**, `dp_ingest_` **1** (다른 청크 0) |
| 머지 뒤 프로덕션(`dpl_67DB2fL34u36JfLcQvtcvKQH7tzy`, `d9c72b3`) | `/`·`/en`·`/es` 200, 위젯 청크 해시 동일(`216.951df721d3217408`) · ingest 1 · key 1 — 머지 델타가 문서뿐이라 실전송은 재실행하지 않았다 |
| 실전송 | `?feedback` → 비밀번호 → 「피드백 보내기」 → 화면 전체 → 「보냈습니다」 → 라쏘런 제보 `16a0358c-2ece-4af6-b3b7-874cd2d66b5d` 도착(page_url 이 새 주소). 근거 코멘트 후 resolved(`resolved_by` = PR #1) |

```bash
P=https://<배포주소>
for p in / /en /es /sitemap.xml /robots.txt; do curl -s -o /dev/null -w "$p %{http_code}\n" "$P$p"; done   # 전부 200
curl -s "$P/en" | grep -oE '<html lang="[a-z]+"|hrefLang="[^"]+"'                                       # en + ko/en/es/x-default

# 피드백 env 가 번들에 들어갔나 — 위젯 청크는 관문 뒤에만 로드되므로, 빌드 산출물 전체에서 센다
# (로컬: 빌드 직후) grep -rl "dp-agentation-ingest" .next/static/chunks | wc -l   → 1 이상이어야 한다
# (배포본) 브라우저로 $P/?feedback → 비밀번호 → 오른쪽 아래 "피드백" 버튼이 떠야 한다. 안 뜨면 1순위 용의자는 env
# (배포본, 브라우저 없이) 위젯은 동적 청크라 HTML 의 <script> 에 없다. webpack-*.js 의 청크 맵에서 이름을 뽑아 받는다:
#   curl -s $P/ | grep -oE '/_next/static/chunks/webpack-[^"]+\.js' → 그 파일의 {id:"hash"} 맵 → /_next/static/chunks/<id>.<hash>.js
#   각 파일에서 grep -c dp-agentation-ingest / dp_ingest_  → 합계 1 이상
```

AI 검색용 구조화 데이터·llms.txt(2026-10-30 추가)는 화면에 안 보여서 눌러 보는 검증으로는 빠진 걸 못 센다. 배포본에서 직접 센다:

```bash
curl -s -o /dev/null -w "llms.txt %{http_code}\n" "$P/llms.txt"                       # 200
for p in / /en /es; do echo "$p $(curl -s "$P$p" | grep -o '"@type":"Person"' | wc -l | tr -d ' ')"; done   # 각 1
node ~/Downloads/geo-tracker/audit.mjs "$P"                                             # GEO 의 구조화 데이터·sameAs·llms.txt·갱신 시점 통과
```

실전송 검증을 했으면 시험 제보는 근거 코멘트를 달고 닫는다(`dp add-annotation-comment` → `dp set-annotation --status resolved --resolved-by <PR/커밋 링크>`).
링크가 없으면 resolved 는 서버가 거부한다 — 그때는 `dismissed`.

## 6. 도메인 이전 — solhun.com 을 CLI Manager 에서 넘겨받기

정본: `solhun-web-page` 저장소 `docs/domain-migration-climanager.md`
(작업 위치 `~/Downloads/worktrees/solhun-web-page/feat-climanager-domain-prep-260929/`). 목표 구조:

| 주소 | 프로젝트 |
|---|---|
| `solhun.com`, `www.solhun.com` | **Portfolio**(이 저장소) |
| `climanager.solhun.com` | `solhun-web-page`(CLI Manager 사이트) — 이미 연결·검증됨 |

이 저장소가 떠안는 것은 **CLI Manager 옛 경로 처리**다. 그 문서의 스니펫을 `next.config.ts` 에 옮겨 두었고,
**기본은 꺼져 있다**(`CLI_MANAGER_ROUTES=1` 일 때만 켜짐):

| 옛 경로 | 켜졌을 때 |
|---|---|
| `/changelog`, `/docs`, `/gallery`, `/roadmap`, `/feedback`, `/compare/*`, `/products/*` (`/admin/*` 는 2026-11-01 뺐다 — 포트폴리오 어드민 자리, CLI Manager 쪽은 404) | 301 → `climanager.solhun.com` 같은 경로(쿼리 유지). `/changelog` 는 구버전 앱이 계속 연다 — **지우지 않는다** |
| `/api/*` | 308 (메서드·본문 유지) |
| `/privacy`, `/terms`, `/apps/fair-social-ops` | rewrite 프록시 — 주소 유지(Google OAuth 동의 화면 등록 URL) |
| Portfolio 에 없는 이미지·영상 | fallback 프록시 |
| `/`, `/en`, `/es`, `/robots.txt`, `/sitemap.xml` | Portfolio 자체 것 |

- `MOVED_TO_CLI_MANAGER` 목록은 solhun-web-page 의 `LEGACY_MOVED_PATHS` 와 **함께 고친다.**
- 포트폴리오의 피드백 관문은 경로가 아니라 **쿼리**(`/?feedback`)라 `/feedback` 301 과 겹치지 않는다(아래 검증에서 둘 다 확인).

### 로컬 검증 (2026-09-30, `next build` + `next start` 두 벌)

| 빌드 env | 결과 |
|---|---|
| 기본 | `/changelog`·`/privacy`·`/api/changelogs`·`/solhun-logo.png` 404, `/`·`/en`·`/es` 200 — **지금과 동일** |
| `CLI_MANAGER_ROUTES=1` | 이동 경로 8개 301(`/docs?x=1` 쿼리 유지), `/api/changelogs` 308, 프록시 3경로 200(`<title>Privacy Policy — solhun.com \| CLI Manager</title>`), `/solhun-logo.png` 200(fallback), `/`·`/?feedback`·`/en`·`/es`·`/sitemap.xml`·`/robots.txt`·`/work/*.jpg` 200 |

### 전환 순서 (Portfolio 쪽)

1. 2절에서 계정을 정하고 Portfolio 프로덕션 배포 — Production env 에 `CLI_MANAGER_ROUTES=1` 을 넣고 배포해도 된다.
   경로 기준이라 `*.vercel.app` 주소에서 도메인 이동 전에 정본 문서의 「검증 명령」을 그대로 돌릴 수 있다.
2. solhun-web-page 쪽 2단계(새 주소 기준 재배포)는 그쪽 문서대로.
3. `solhun.com`·`www.solhun.com` 을 solhun-web-page 에서 떼고 Portfolio 에 붙인다(추천안이면 같은 계정 안의 이동).
   `vercel domains rm` 은 **계정에서 도메인 자체를 지우는 명령이라 쓰지 않는다** — 대시보드 또는 프로젝트 도메인 API.
4. apex 와 www 중 정본을 정하고 `NEXT_PUBLIC_SITE_URL` 을 맞춘다(지금 기본값은 `https://solhun.com`).
5. 피드백 소스·관문 허용 호스트에 새 프로젝트 주소 반영(4절).
6. Search Console 에 solhun.com 속성 sitemap 재제출(주소 변경 도구는 쓰지 않는다 — 사이트 이동이 아니라 주인이 바뀐 것).

롤백: 도메인을 Portfolio 에서 떼고 solhun-web-page 에 다시 붙인다. 301 은 브라우저가 영구 캐시하지만 대상(CLI Manager 경로)이
새 주소에 살아 있는 한 무해하다.

## 7. 남은 사람 결정

| # | 결정 | 추천 |
|---|---|---|
| 1 | ~~Vercel 계정~~ | ✅ 새 프로젝트 `solhun-portfolio` 로 결정·배포(2026-09-30) |
| 2 | ~~이 브랜치 머지·push~~ | ✅ PR #1 로 머지(2026-09-30) |
| 3 | ~~도메인 이전 실행~~ | ✅ 이전 완료(2026-10-04 실측). apex → www 307 이라 지금 정본은 사실상 www — `NEXT_PUBLIC_SITE_URL` 기본값(`https://solhun.com`)과 맞출지는 남은 결정 |
| 4 | 옛 계정 프로젝트 정리(삭제/Git 해제) — **Git 연동이 살아 있어 main push 마다 옛 주소에도 배포된다** | 도메인 이전 확인 뒤 |
| 5 | 로컬 `origin` 을 `woorichicken/Portfolio` 로 바꿀지 | 바꾸는 편이 명확 |
| 6 | solhun.com 도메인 갱신(2026-12-01 만료) | 자동 갱신 확인 |

## 8. Cloudflare Workers — 2026-11-09 이전 (실측)

배포 = `main` 머지 → **Workers Builds** 가 검사·빌드·배포한다. 수동 배포는 비상용(`docs/content-api.md` 「토큰 받은 뒤 할 일」 6의 명령을 로컬에서).

| 항목 | 값 |
|---|---|
| 계정 | 개인 `4521ed2f6bd35977301d9344ffcbbc8e`(jkh040922 — solhun.com zone 과 같은 계정) |
| Worker | `solhun-portfolio` · https://solhun-portfolio.jkh040922.workers.dev |
| D1 | `solhun-portfolio` `e19ff0c9-85cd-4c53-aaa0-aa73b987ddb3` — 마이그레이션 0001~0003 적용 · 시드 5문서(2026-11-09) |
| R2 | `solhun-portfolio-cache`(페이지 캐시) · `solhun-portfolio-media`(사진·영상, `/media/*`) |
| Worker secret | `CONTENT_API_TOKEN` · `ADMIN_SESSION_SECRET` |
| Workers Builds | 연결 `c5c479c0-f07b-41e4-bb07-c919860c15b1` · 트리거 `800a28cb-720a-4870-9f5f-47558746f186` · 브랜치 `main` · 제외 `docs/*,docs/**,README.md,CLAUDE.md,AGENTS.md` |
| 빌드 명령 | `pnpm install --frozen-lockfile && pnpm exec tsc --noEmit && pnpm exec vitest run && CLOUDFLARE_API_TOKEN=$PORTFOLIO_CF_TOKEN node scripts/content-snapshot.mjs --remote && pnpm exec opennextjs-cloudflare build` |
| 배포 명령 | `CLOUDFLARE_API_TOKEN=$PORTFOLIO_CF_TOKEN pnpm exec opennextjs-cloudflare deploy` |
| 빌드 변수 키 | `NODE_VERSION` · `PNPM_VERSION` · `SKIP_DEPENDENCY_INSTALL` · `CLI_MANAGER_ROUTES` · `CLOUDFLARE_ACCOUNT_ID` · 비밀 `PORTFOLIO_CF_TOKEN` · `NEXT_PUBLIC_DP_FEEDBACK_URL` · `NEXT_PUBLIC_DP_FEEDBACK_KEY` |

- **왜 `PORTFOLIO_CF_TOKEN` 을 따로 두나**: 빌드가 운영 D1 을 읽고(스냅숏), 배포가 R2 페이지 캐시를 채운다. Workers Builds 기본 빌드 토큰에 그 권한이 있는지 확인하지 않았다 — 권한을 좁힌 우리 토큰을 그 두 명령에만 준다.
- **비밀값 위치**: 1Password lightsoft 「직원」 — 「solhun.com 포트폴리오 - Cloudflare API 토큰 (D1·R2·Workers 배포)」(토큰 id `52691633…`) · 「… 콘텐츠 API 토큰」 · 「… 어드민 세션 서명 비밀」. 로컬 사본 `~/.config/portfolio/{cf-api-token,content-api-token,admin-session-secret}`(0600).
- **피드백 env 를 바꾸면** 빌드 변수(비밀)도 바꾼다 — `NEXT_PUBLIC_*` 는 번들에 박힌다(`wb.mjs vars`).
- 배포 확인: `node ~/.claude/skills/cf-workers-builds/scripts/commit-status.mjs --repo woorichicken/Portfolio --sha <커밋> --excludes '<위 제외>'` → 0.
- 2026-11-09 workers.dev 실측: verify-routes 21/21 · 원격 `pnpm content set` → 26곳 다시 그림 → `undo` · 피드백 위젯 청크 2개에 ingest 주소.

### 도메인 전환 (2026-11-09 23:5x KST)

| 항목 | 값 |
|---|---|
| 한 일 | DNS 의 Vercel CNAME 두 줄(`solhun.com`·`www.solhun.com` → `fa967484a7ac7eef.vercel-dns-017.com`, DNS only) 삭제 → Workers 커스텀 도메인 두 개 연결(API). `wrangler.jsonc` `routes` 에도 적었다 |
| apex → www | 앱이 307(`next.config.ts` `APEX_TO_WWW`) — Vercel 때는 도메인 설정이 하던 일 |
| 전환 뒤 실측 | 인증서 발급까지 약 80초 · `www` 200(`server: cloudflare`) · apex 307 → www · verify-routes 21/21(www ↔ workers.dev) · `climanager`·`design`·`standup` 하위 도메인 200 · 운영 `pnpm content set` → 반영 → `undo` |
| 되돌리기 | ~~Vercel 로 DNS 되돌리기(`rollback.sh`)~~ — **2026-11-10 Vercel 프로젝트를 지워 더는 쓸 수 없다.** 이제 되돌리기는 Workers 안에서 한다: 코드는 대시보드 Deployments 의 이전 버전으로 롤백(또는 `wrangler rollback`), 본문은 `pnpm content undo`·어드민 「최근 저장」, D1 통째로는 Time Travel |
| Vercel | Git 연결 끊음(2026-11-10) → **같은 날 프로젝트 삭제**(사람: 「vercel 은 바로 삭제하면 될거 같고」). 환경변수 3개(`CLI_MANAGER_ROUTES`·`NEXT_PUBLIC_DP_FEEDBACK_URL`·`…_KEY`)는 Workers Builds 빌드 변수에 이미 있다 |

## 9. 요금 — 과다 청구가 날 수 있나 · 브레이크 (2026-11-10 실측)

계정 `4521ed2f…` 는 **Workers Paid($5/월) + R2 Paid** 다(이 사이트만이 아니라 content-ops·standup·pc-sites 등과 같이 쓴다). 유료 플랜이라 **포함량을 넘으면 그만큼 청구되고, 자동으로 멈추는 상한은 없다**(공식 요금 문서에 지출 상한 없음).

| 항목 | 포함량(월) | 넘으면 | 11-01~11-10 계정 전체 실측 |
|---|---|---|---|
| Workers 요청 | 1천만 | $0.30 / 100만 | 약 28만(이 사이트 3,553) |
| Workers CPU | 3천만 ms | $0.02 / 100만 ms | 약 85만 ms(이 사이트 128,813 ms · 요청당 평균 약 36ms) |
| D1 읽기 · 쓰기 | 250억 · 5천만 행 | $0.001 · $1.00 / 100만 행 | 이 사이트 9,389 · 1,922 |
| R2 저장 | 10GB | $0.015 / GB | 약 16.6GB(대부분 `solhun-downloads` 12.2GB · `content-ops-media-dev` 4.3GB) — 이 사이트 약 0.1GB |
| R2 Class A · B | 100만 · 1천만 | $4.50 · $0.36 / 100만 | 이 사이트 GetObject 1,584 · PutObject 845 |
| R2 내보내기(egress) | 무료 | — | — |

- **브레이크**: ① 예산 알림 — 이번 달 사용료가 **$10** 이 되면 메일(자동 생성, 켜짐). ② 제품별 사용량 알림(`billing_usage_alert`) — 없음, 만들 수 있음. ③ Worker 요청당 CPU 상한(`wrangler.jsonc` `limits.cpu_ms` · 대시보드 Settings > CPU Limits) — 지금 기본값. 셋 다 **알리거나 한 요청을 끊을 뿐 청구를 멈추지는 않는다.**
- 측정: 대시보드 GraphQL(`workersInvocationsAdaptive`·`r2OperationsAdaptiveGroups`·`r2StorageAdaptiveGroups`·`d1AnalyticsAdaptiveGroups`) — 배포 토큰에는 결제·분석 권한이 없어 로그인된 대시보드 탭(Aside)에서 읽었다.

