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
| `src/components/Portfolio.tsx` | 홈(서버 컴포넌트) — 첫 화면·숫자 → 프로젝트 카드(크기가 섞인 배치) → 디자인 엔지니어로서 미리보기 → 연표 → 연락 |
| `src/components/ProjectCase.tsx` | 큰 프로젝트 상세 `/projects/<id>` — 머리 띠 + 따라오는 목차(`CaseToc`) + 장(개요·디자인 엔지니어링·바꾼 것·결과·말·화면·배운 점) |
| `src/components/WorkDetail.tsx` | 「그 외」·「이전」 프로젝트 상세 — 같은 `/projects/<slug>` 주소, 홈에는 링크가 없다(2026-10 개편에서 뺐다) |
| `src/components/DesignWall.tsx` · `src/content/artifacts.ts` | 「디자인 엔지니어로서」 결과물 화면 `/design` 과 결과물 목록(3개 언어 이름). **영상은 공개 권리 확인 전이라 넣지 않았다** |
| `src/app/portfolio.css` | 위 화면들의 배치. 색·서체는 `globals.css` 토큰 그대로. `lab*` 접두어는 시안 회차 이름 |
| `src/components/feedback/` · `src/lib/feedback-gate.ts` | `?feedback` 관문 + feedback-kit 위젯 |
| `next.config.ts` | CLI Manager 옛 경로 301/프록시 — 기본 꺼짐(`CLI_MANAGER_ROUTES=1`) |
| `docs/DEPLOY.md` | Vercel·env·도메인 이전·피드백 운영 — **배포 전에 읽을 것** |
| `docs/verification/` | 검증 캡처 |

## 「예시」 칸

`artifacts.ts` 에서 `example: true` 인 결과물은 자료를 채우는 중인 자리다. **일반 방문자에게는 숨기고**, 피드백 모드
(`?feedback` 통과 → `<html data-feedback="on">`)에서만 점선 칸으로 보인다 — 피드백 위젯으로 그 자리에 무엇을 넣을지 남기면 된다.
채울 때는 사진을 `public/work/` 와 `images.ts` 에 넣고 그 항목의 `example: true` 를 `image: '<id>'` 로 바꾼다.

## 내용의 정본

`~/Downloads/portfolio-2026` (정경훈_포트폴리오_AX.pdf, `drafts/03_전체이력_총정리.md`, `drafts/portfolio/portfolio.html`).
숫자·인용은 전부 거기서 옮겼다. 새 수치를 넣을 때는 자료에 근거를 먼저 남기고, 세 언어를 함께 고친다.

## 피드백

`https://solhun.com/?feedback` → 비밀번호 → 오른쪽 아래 피드백 버튼. `?feedback=off` 로 끈다.
제보는 라쏘런 프로젝트 「포트폴리오 (solhun.com)」로 간다. 자세한 건 `docs/DEPLOY.md` 4절.
