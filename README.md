# SOLHUN — 정경훈 포트폴리오

solhun.com 에 올릴 개인 포트폴리오. Next.js 15 (App Router) · 한국어(기본) / English / Español.

## 실행

```bash
pnpm install
pnpm dev                    # http://localhost:3427  (3427 은 피드백 수집 소스에 등록된 로컬 포트)
pnpm typecheck
pnpm build && pnpm start
pnpm verify:feedback-gate   # 피드백 관문 허용/차단 호스트·비밀번호 해시 검사
```

## 구조

| 경로 | 무엇 |
|---|---|
| `src/content/{ko,en,es}.ts` | 본문 전부. 셋은 `types.ts` 의 같은 모양이라 한 언어에서 항목을 빠뜨리면 타입체크가 잡는다 |
| `src/content/images.ts` | 사진 경로·크기(`public/work/`) |
| `src/app/(ko)/` | 한국어 `/` — 언어마다 루트 레이아웃을 따로 둬서 `<html lang>` 이 정확하다 |
| `src/app/(intl)/[locale]/` | `/en`, `/es` (그 밖은 404) |
| `src/components/Portfolio.tsx` | 홈(서버 컴포넌트) — 스크롤 첫 화면 → 소개·숫자 → 프로젝트 카드(크기가 섞인 배치) → 디자인 엔지니어로서 미리보기 → 연표 → 연락 |
| `src/components/scroll/` · `public/figures/<bench\|recorder>/figure.html` | 홈 스크롤 그림. 첫 화면은 내리는 만큼 그림이 한 바퀴(`ScrollStage` → `setPose(t)`), 섹션 머리마다 부품 하나가 확대돼 다시 나온다(`PartSlot`). `?fig=bench\|recorder` 로 바꾼다(기본 bench). 어느 부품·t 구간을 쓸지는 `figures.ts` 한 곳. 그림 파일은 anatomy 로 그린 단독 HTML(같은 출처 iframe) — 바꿀 때는 파일만 덮고 `figures.ts` 의 부품 이름을 맞춘다 |
| `src/components/ProjectCase.tsx` | 큰 프로젝트 상세 `/projects/<id>` — 머리 띠 + 따라오는 목차(`CaseToc`) + 장(개요·디자인 엔지니어링·바꾼 것·결과·말·화면·배운 점) |
| `src/components/WorkDetail.tsx` | 「그 외」·「이전」 프로젝트 상세 — 같은 `/projects/<slug>` 주소, 홈에는 링크가 없다(2026-10 개편에서 뺐다) |
| `src/components/DesignWall.tsx` · `src/content/artifacts.ts` | 「디자인 엔지니어로서」 결과물 화면 `/design` 과 결과물 목록(3개 언어 이름). **영상은 공개 권리 확인 전이라 넣지 않았다** |
| `src/app/globals.css` | 색 토큰(채널 색 — 글자로 쓰는 쌍은 대비 비율을 주석에) · 머리 · 공통 조각 · 라이트박스 · 연락 띠 · 피드백 관문. **색 글자(#…)는 `:root` 토큰 블록에만** |
| `src/app/portfolio.css` | 화면별 배치 — 홈(무대·섹션·카드 격자·결과물 칸) · 상세 · 결과물 화면. 색 글자 없이 토큰만 쓴다(2026-10-18 회차 클래스 `lab*` 를 정리했다) |
| `src/components/feedback/` · `src/lib/feedback-gate.ts` | `?feedback` 관문 + feedback-kit 위젯 |
| `next.config.ts` | CLI Manager 옛 경로 301/프록시 — 기본 꺼짐(`CLI_MANAGER_ROUTES=1`) |
| `docs/DEPLOY.md` | Vercel·env·도메인 이전·피드백 운영 — **배포 전에 읽을 것** |
| `docs/verification/` | 검증 캡처 |

## 「예시」 칸

`artifacts.ts` 에서 `example: true` 인 결과물은 자료를 채우는 중인 자리다. **일반 방문자에게는 숨기고**, 피드백 모드
(`?feedback` 통과 → `<html data-feedback="on">`)에서만 점선 칸으로 보인다 — 피드백 위젯으로 그 자리에 무엇을 넣을지 남기면 된다.
채울 때는 사진을 `public/work/` 와 `images.ts` 에 넣고 그 항목의 `example: true` 를 `image: '<id>'` 로 바꾼다.

## 디자인 결정 (2026-10 개편, 시안 A 4~7회차 · 2026-10-18 채널 색)

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
