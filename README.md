# SOLHUN — 정경훈 포트폴리오

solhun.com 에 올릴 개인 포트폴리오. Next.js 16 (App Router · Turbopack) · 한국어(기본) / English / Español.

## 실행

```bash
pnpm install
pnpm dev                    # http://localhost:3427  (3427 은 피드백 수집 소스에 등록된 로컬 포트)
pnpm typecheck
pnpm build && pnpm start
pnpm verify:feedback-gate   # 피드백 관문 허용/차단 호스트·비밀번호 해시 검사

# Cloudflare Workers(OpenNext) + 본문 D1 — 2026-11-08~ (운영 전환 전 · docs/content-api.md)
pnpm db:migrate:local && pnpm db:seed:local   # 로컬 D1 에 본문 넣기(처음 한 번)
pnpm cf:build && pnpm cf:preview              # http://127.0.0.1:8797
pnpm content get                              # 본문 읽기·고치기 CLI — .claude/skills/solhun-content/SKILL.md
pnpm test                                     # 유닛(zod 검사·되돌리기)
pnpm e2e:workers                              # E2E(Workers · cf:build 뒤) · 정적은 CONTENT_SOURCE=static pnpm build && pnpm e2e:static
```

## 구조

| 경로 | 무엇 |
|---|---|
| **D1 `content_doc`** | **본문의 정본(2026-11-08~)** — ko·en·es · roles · hidden 문서 5개. 고치기는 `pnpm content`(에이전트) 또는 `/admin` 「저장」. 쓸 때마다 zod 로 세 언어 모양을 검사하고 직전 값을 이력에 남긴다 — `docs/content-api.md` |
| `src/content/{ko,en,es}.ts` | D1 의 **시드**(처음 넣은 값)이자 D1 없는 빌드(Vercel)의 본문. 여기를 고쳐도 Workers 사이트는 안 바뀐다 |
| `src/content/schema.ts` · `ops.ts` · `store.ts` | zod 스키마(types.ts 와 같은지 컴파일 때 확인) · 본문 바꾸기(순수 함수) · D1 읽기/쓰기/되돌리기 |
| `src/content/roles.ts` | 역할 id · 화면 글(`SCREEN`, 세 언어 한 줄씩) · 역할 순서/숨김의 **시드값**(`ROLES`·`HIDDEN`). 순서·숨김의 정본은 D1 `roles`·`hidden` |
| `src/content/screen-data.ts` | 역할 화면의 행·비슷한 작품 계산(화면은 이 결과만 그린다) |
| `src/content/images.ts` · `artifacts.ts` | 사진 경로·크기(`public/work/`) · 결과물 목록 |
| `src/app/(ko)/` · `src/app/(intl)/[locale]/` | 한국어 `/` · `/en`·`/es` — 언어마다 루트 레이아웃을 따로 둬서 `<html lang>` 이 정확하다 |
| `/` → `src/components/screen/RolePicker.tsx` | 첫 화면 「어떤 SOLHUN을 볼까요?」 — 역할 타일 4개(좁으면 2×2) + 「전부 볼게요」 · 「정경훈 소개」 창. 고르면 `/as/<역할>` |
| `public/og/home-{ko,en,es}.png` ← `scripts/og-image.mjs` | 홈 링크 미리보기 그림(1200×630) — 운영 첫 화면을 찍어 언어 버튼·단추를 숨기고 이름·주소를 얹은 것(제보 5567b8b0). 역할 이름·첫 화면을 바꿨으면 배포 뒤 `node scripts/og-image.mjs` 로 다시 만들어 커밋한다(카카오톡은 같은 주소의 그림을 캐시한다 — 바꾼 뒤 카카오 공유 디버거에서 캐시 지우기). 상세·역할 화면은 그대로 작품 표지 |
| `/as/<역할>` → `screen/Browse.tsx` | 역할 화면 — 대표작 빌보드 → 가로 행(그 역할의 프로젝트 · 숫자 · 만든 화면과 도구 · 그 외 · 이전) → 연표 → 연락 |
| `/projects/<slug>` → `screen/TitlePage.tsx` | 작품 상세(큰 프로젝트 · 그 외 · 이전 공통) — 그림 → 이름·칩 → 사이트 열기/메일 · 링크 복사 → 탭(개요 · 바꾼 것 · 화면 · 비슷한 작품 · 자세히, `#tab-<id>`) |
| `/design` | **없앴다(2026-11-03)** — 옛 주소는 `next.config.ts` 가 `/as/design#row-artifacts`(308)로 보낸다. 결과물은 역할 화면의 「만든 화면과 도구」 행과 상세 「화면」 탭에만 있다 |
| `/admin` → `admin/Admin.tsx` | 나를 위한 화면(검색 제외). 비밀번호 = 피드백 모드(서버가 확인 → 쿠키). 역할별 순서·숨김을 바꿔 **「저장」하면 바로 반영**(`PUT /api/content/layout`) · 「마지막 저장 되돌리기」. D1 없는 배포에서는 예전처럼 변경안 코드만. 항목별 코멘트는 브라우저에 쌓고 배포본에서는 라쏘런에도 보낸다(`admin/send-comment.ts`) |
| `src/components/screen/Shell.tsx` · `RoleClient.tsx` | 공통 뼈대(머리 · 연락 띠 · 모바일 아래 탭) · 마지막 역할 기억(`localStorage` `solhun:role`) |
| `src/app/globals.css` | **리브랜딩 디자인 시스템 전부** — 어두운 화면 하나, 채널 네 색 = 역할 네 색, 대비 비율은 주석에. 색 글자(#…)는 `:root` 토큰 블록에만 |
| `src/components/feedback/` · `src/lib/feedback-gate.ts` | `?feedback` 관문 + feedback-kit 위젯 |
| `next.config.ts` | `/design` → 역할 화면 308(늘 켬) · CLI Manager 옛 경로 301/프록시 — 기본 꺼짐(`CLI_MANAGER_ROUTES=1`) |
| `docs/DEPLOY.md` | Vercel·env·도메인 이전·피드백 운영 — **배포 전에 읽을 것** |
| `docs/content-api.md` · `wrangler.jsonc` · `open-next.config.ts` · `migrations/` | Cloudflare Workers 이전 — API 표·응답/오류 모양·「토큰 받은 뒤 할 일」 |
| `docs/verification/` | 검증 캡처 |

## 피드백 모드는 방문자와 같은 화면이다

예전에는 피드백 모드(`?feedback`)에서만 「예시」 점선 칸(자료를 채울 자리)이 보였다. 사용자: 「점선칸, 피드백 모드에서만 보이는건 전부 삭제하고 싶음.
다른 사람들이 보는거 그대로 보고 싶음」(2026-11-02 제보 0b0a478c) — 그래서 지웠다. 피드백 모드가 더하는 것은 의견 다는 위젯 하나뿐이다.
채울 자리 목록은 `docs/backlog.md` 「결과물 — 자료를 채울 자리」에 있고, 채울 때는 사진을 `public/work/`·`images.ts` 에 넣고 `artifacts.ts` 에 한 줄 더한다.

## 디자인 결정 — 2026-11 리브랜딩 (스탠드업 메모 「solhun rebranding」)

- **2회차(2026-11-01): 치수는 넷플릭스에서 재 왔다.** 사용자 「실제 aside 로 들어가서 디자인 시스템 가져왔으면」. Aside 로 로그인한 넷플릭스 웹(2026 화면)에서
  프로필 선택 · 홈 · 상세 창의 `getComputedStyle` 을 390/768/1024/1440 폭으로 재서(원자료 `~/Downloads/_batches/task-portfolio-gaps-1101/r2/netflix/*.json`)
  `globals.css` 토큰으로 옮겼다 — 머리 80px · 알약 메뉴 · 둥근 카드 빌보드(반지름 24, 2.18:1, 작은 화면 세로) · 행 제목 500 굵기 · 카드 16:9 간격 8 · 한 줄 2~6장 ·
  알약 버튼 48/40px · 상세는 가운데 시트(16:9 위 · 정보 2:1 · 회차 목록 · 3열 비슷한 작품). 빨강·넷플릭스 글꼴·아이콘·문구는 여전히 안 옮긴다.
  회색은 넷플릭스와 같은 중성 회색으로 바꿨고(남색 바탕 → `#141414`), 넷플릭스의 라벨 회색 `#777` 은 14px 에서 AA 가 안 돼 `#8c8c8c` 로 올렸다.
- **4회차(2026-11-01): 움직임도 넷플릭스에서 재 왔다.** Aside 숨은 탭에서 `document.getAnimations()` 로 길이·곡선을 읽었다(`~/Downloads/_batches/task-portfolio-gaps-1101/r4/netflix-motion/`).
  페이지 사이는 브라우저 문서 간 View Transitions(`src/components/view-transitions.ts`) — 누른 카드 그림이 상세 큰 그림으로 이어지고(0.34초) 닫으면 되돌아간다.
  줄 넘김 0.75초 cubic-bezier(.4,0,.2,1) · 메뉴 0.25초 · 탭·사진 크게 보기 0.2초대. 「움직임 줄이기」와 미지원 브라우저(파이어폭스)는 지금처럼 바로 넘어간다.
- **3회차(2026-11-01): 좁은 화면도 넷플릭스 웹에서 재 왔다.** 사용자 「모바일 반응형은 실제 반응형 넷플릭스랑 다르다는 느낌」. Aside 숨은 탭에서
  390·768 화면 9장을 찍어(`~/Downloads/_batches/task-portfolio-gaps-1101/r3/netflix/`) 맞췄다 — 아래 탭 막대(앱 방식)를 빼고 머리 「메뉴 ▾」 하나로 접기,
  머리 80px, 프로필 화면처럼 그림 72·이름 14px·한 줄 세 칸, 상세는 양옆 4px 만 남긴 카드에 이름을 그림 위로. 같은 회차 리뷰로 빌보드 숫자 칩 · 「숫자로 본 지난 1년」 행 ·
  상세의 결과 숫자 · 메일 보내기 · 링크 복사를 뺐고, 결과물 행은 프로젝트마다 한 장만 둔다. 상세 둘째 탭은 「맡은 일」(회차 목록) + 「특별편 — 바꾼 것」.
- **6회차(2026-11-03): 결과물 화면(`/design`)을 없앴다(리뷰 A안).** 역할 화면의 「만든 화면과 도구」 행과 겹쳤다 — 머리 메뉴는 홈 · 연표 · 연락 셋.
  같은 회차 제보 넷: 역할 타일은 네 장이 한 줄에 안 들어가면 2×2(3+1 금지) · 제목 「어떤 SOLHUN을 볼까요?」 · 연표·연락을 보고 있으면 머리 메뉴 선택 표시가
  그 항목으로 옮겨 간다(역할 화면의 머리 링크는 지금 역할로 간다 — 처음 들어온 화면에서 「연표」가 `/as/all` 로 넘어가던 것도 고침) · 피드백 모드 전용 화면 삭제.
- **넷플릭스 같은 구조, 우리 모양.** 계정 대신 역할을 고르고(`/`), 역할마다 대표작 빌보드와 가로 행, 상세는 탭. 넷플릭스의 빨강·얼굴 아이콘·문구는 옮기지 않았다 — 구조만 빌렸다(근거 그림: `~/Downloads/_batches/task-portfolio-gaps-1101/mobbin/`).
- **어두운 화면 하나.** 작업 사진이 주인공이라 바탕이 빛을 먹는 쪽이 낫다. 채널 네 색(이끼·남색·도장·얼굴)은 역할 타일 네 개에 한 색씩 준다.
- **모바일이 먼저.** 행은 손가락으로 넘기고(scroll-snap), 좁은 화면은 머리 「메뉴 ▾」 하나로 접는다(3회차에 아래 탭을 뺐다). 가로 넘침 0 을 검사한다.
- 아래 「2026-10 개편」 결정 중 홈의 비대칭 격자·스크롤 그림(검수대·기록계)은 이번에 행·빌보드로 바뀌었다. `public/figures/` 는 쓰는 곳이 없어졌다(지우지 않고 둠 — 백로그).

## 디자인 결정 (2026-10 개편, 시안 A 4~7회차 · 2026-10-18 채널 색) — 일부는 리브랜딩으로 바뀜

사용자가 회차 리뷰에서 정한 것이다. 바꾸기 전에 그 회차 코멘트를 먼저 본다 — 근거는 `src/app/portfolio.css` 의 부품별 주석과 git 이력(커밋 `1dc66c3`·`1539a9d` 의 회차 주석)에 있다.

- **색은 채널(solhun) 색으로 통일했다 — 종이 `#F7ECE4` · 남색 `#1E2834` · 얼굴 `#EDDDCA` · 이끼 `#4B6250`, 파랑·핑크 글로우는 버렸다**(2026-10-18 사용자 결정).
  강조·링크·화살표는 이끼, 연락 띠는 남색, 「예시」·오류 같은 작은 주의 표시(`--mark`)만 도장색 `#A63F2A`. 글자로 쓰는 색 쌍은 전부 WCAG AA 이상(비율은 `globals.css` 주석).
  서체·카드 모양은 그대로다. 다른 사이트를 그대로 옮긴 레퍼런스는 「너무 다르다」로 거절됐다(2026-10 개편).
- **홈 프로젝트와 `/design` 은 크기가 섞인 비대칭 격자다**(`SHAPE`·`MOBILE`, `grid-auto-flow: dense`). 「모두 같은 앨범형」은 거절됐고, 모바일에서도 한 줄·반 칸·가로 행을 섞는다.
- **가운데에 놓는 것은 정확히 가운데에 놓는다.** 이전 → 이후는 같은 폭 두 상자이고, 화살표(`.ba-arrow`)는 그 사이 정가운데에 둔다. 「비대칭이 심하다」 코멘트로 고쳤다.
- **결과물 사진은 자르지 않는다**(`object-fit: contain`, 영상 포스터만 채움). 가로로 넓은 대표 사진은 글 위에 통째로 둔다(`is-feature`, 2.2:1). 「과하게 잘린다」 코멘트로 고쳤다.
- **결과물 칸에는 설명을 붙이지 않고 그림과 짧은 이름만 둔다.**
- **상세 목차는 스크롤을 따라온다**(`position: sticky`). 전체 페이지 캡처에는 맨 위에만 찍혀서 고정이 안 된 것처럼 보이니, 확인은 스크롤 중간 화면이나 GIF로 한다.

## 내용의 정본

`~/Downloads/portfolio-2026` (정경훈_포트폴리오_AX.pdf, `drafts/03_전체이력_총정리.md`, `drafts/portfolio/portfolio.html`).
숫자·인용은 전부 거기서 옮겼다. 새 수치를 넣을 때는 자료에 근거를 먼저 남기고, 세 언어를 함께 고친다.

**정본도 틀릴 수 있다.** `sources/` 의 아카이브·요약은 대부분 AI 가 만든 2차 기록이다. 사이트 문구와 다르면 사이트를
「사실 오류」로 고치기 전에 1차 근거(git log·GitHub API·원본 메일)로 재거나 본인에게 묻는다. 2026-10-11 리뷰에서 기록 쪽이
틀린 것: KITS 「3시간 만에 22건」(기록은 「4일」), KITS 역할(백엔드는 고객사 담당), PorterX 시작(저장소 최초 커밋 2025-08 ≠ 본인
첫 커밋 2025-11-12). 바로잡은 사실은 `drafts/03_전체이력_총정리.md` 에 「사용자 확인」으로 적어 두었다.

**글을 고치는 순서**: 한 번 목업으로 방향을 정한 뒤에는 반영 → 배포 → 배포 직전·직후 운영 화면을 나란히 놓고 다음 피드백을
받는다(사용자 2026-10-11 — 목업 회차를 늘리는 것보다 빠르다). 리뷰 페이지는 `before-after-review` 스킬.

## 피드백

`https://solhun.com/?feedback` → 비밀번호 → 오른쪽 아래 피드백 버튼. `?feedback=off` 로 끈다.
제보는 라쏘런 프로젝트 「포트폴리오 (solhun.com)」로 간다. 자세한 건 `docs/DEPLOY.md` 4절.
