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
| `src/components/Portfolio.tsx` | 페이지 전체(서버 컴포넌트) |
| `src/components/feedback/` · `src/lib/feedback-gate.ts` | `?feedback` 관문 + feedback-kit 위젯 |
| `next.config.ts` | CLI Manager 옛 경로 301/프록시 — 기본 꺼짐(`CLI_MANAGER_ROUTES=1`) |
| `docs/DEPLOY.md` | Vercel·env·도메인 이전·피드백 운영 — **배포 전에 읽을 것** |
| `docs/verification/` | 검증 캡처 |

## 내용의 정본

`~/Downloads/portfolio-2026` (정경훈_포트폴리오_AX.pdf, `drafts/03_전체이력_총정리.md`, `drafts/portfolio/portfolio.html`).
숫자·인용은 전부 거기서 옮겼다. 새 수치를 넣을 때는 자료에 근거를 먼저 남기고, 세 언어를 함께 고친다.

## 피드백

`https://solhun.com/?feedback` → 비밀번호 → 오른쪽 아래 피드백 버튼. `?feedback=off` 로 끈다.
제보는 라쏘런 프로젝트 「포트폴리오 (solhun.com)」로 간다. 자세한 건 `docs/DEPLOY.md` 4절.
