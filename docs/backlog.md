# 백로그 — 지금 고치지 않고 적어 둔 것

본론 밖에서 발견한 개선점. 근거와 「언제 할지(트리거)」를 함께 적는다. 적어 둔 세션에서는 고치지 않는다.

| 날짜 | 발견 | 근거 | 트리거 |
|---|---|---|---|
| 2026-10-02 | **자동 회귀 테스트가 없다.** 화면 동작(라이트박스 < > · ←/→ · 사진 1장이면 버튼 숨김)을 지키는 게 사람 캡처뿐이다 | `playwright.config.*`·`e2e/` 없음, `package.json` 스크립트는 typecheck·lint·build 뿐. PR #5 검증을 `agent-browser` 수동 스크립트(`~/Downloads/_review-portfolio-fb-1002/capture.sh`)로 했다 | 다음에 동작(클릭·키보드) 제보를 고칠 때 Playwright 스펙 1개(라이트박스)부터 붙인다 |
| 2026-10-02 | **로컬 `origin` 이 아직 `agi040922/Portfolio`** — 리다이렉트로 push·PR 은 되지만 `close-feedback.mjs` 가 제보에 남기는 커밋 URL 이 옛 주소가 된다 | PR #5 종료 코멘트의 커밋 링크가 `github.com/agi040922/Portfolio/commit/db44c29…` | ✅ **해결(2026-10-02)** — `origin` 을 `https://github.com/woorichicken/Portfolio.git` 로 바꿨다(fetch 확인) |
| 2026-10-04 | **`src/docs/i18n.md` 가 지금 구조와 다르다** — `middleware.ts`·`lib/i18n.ts`·`/ko/` 리다이렉트를 설명하는데 실제는 `(ko)`·`(intl)/[locale]` 라우트 그룹과 `i18n/config.ts` 다 | 문서 1–60줄 vs `src/i18n/config.ts`, `src/app/(ko)` | 다음 `/curate-repository-ops` 때 지우거나 README 「구조」표로 흡수 |
| 2026-10-05 | **보류: 디자인 엔지니어 개편 브랜치 `feat/design-engineer-261004`** (로컬 전용, push 안 함) — 히어로 무음 쇼릴, 「영상과 모션」 섹션(가로 1:04·세로 0:30), 케이스 스터디 `/cases/fair-promo`·`/cases/cardnews-film`, 프로젝트 4곳의 영상 줄, ko/en/es. 사용자 판단: 아쉬운 부분이 많아 지금은 머지하지 않는다 | 커밋 `725a9b6` 1개 · 57파일 +1,293/−70. 보고서 `~/Downloads/_review-portfolio-design-1004/report.html`, 쇼릴 원본 `~/Downloads/solhun-showreel`(Remotion), 영상 근거 `docs/media/media-facts.json`(브랜치 안). 열린 결정: ① CLI Manager 시연에 `lightsoft.dev` 계정·내부 프로젝트명·로컬 경로 노출 ② 카드뉴스 캐릭터 권리 미확인 ③ FAIR CRM·Symphony·피드백 위젯 화면 공개 허락 | 다시 손댈 때: 아쉬운 점을 먼저 이 줄에 적고, 브랜치를 `origin/main` 에 머지해 거리부터 0 으로. **저장소가 PUBLIC 이라 ①~③ 정리 전에는 브랜치도 push 하지 않는다**(영상이 그대로 공개된다) |
| 2026-10-04 | **영상 파일을 저장소에 직접 넣는 구조**(위 브랜치의 `public/media` 34MB) — 영상이 늘면 클론·배포가 무거워진다 | 브랜치에서 `du -sh public/media` = 34M | 위 브랜치를 살릴 때, 영상이 50MB 를 넘거나 한 편이 10MB 를 넘으면 Vercel Blob·외부 호스팅으로 옮긴다 |

