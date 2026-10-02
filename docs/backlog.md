# 백로그 — 지금 고치지 않고 적어 둔 것

본론 밖에서 발견한 개선점. 근거와 「언제 할지(트리거)」를 함께 적는다. 적어 둔 세션에서는 고치지 않는다.

| 날짜 | 발견 | 근거 | 트리거 |
|---|---|---|---|
| 2026-10-02 | **자동 회귀 테스트가 없다.** 화면 동작(라이트박스 < > · ←/→ · 사진 1장이면 버튼 숨김)을 지키는 게 사람 캡처뿐이다 | `playwright.config.*`·`e2e/` 없음, `package.json` 스크립트는 typecheck·lint·build 뿐. PR #5 검증을 `agent-browser` 수동 스크립트(`~/Downloads/_review-portfolio-fb-1002/capture.sh`)로 했다 | 다음에 동작(클릭·키보드) 제보를 고칠 때 Playwright 스펙 1개(라이트박스)부터 붙인다 |
| 2026-10-02 | **로컬 `origin` 이 아직 `agi040922/Portfolio`** — 리다이렉트로 push·PR 은 되지만 `close-feedback.mjs` 가 제보에 남기는 커밋 URL 이 옛 주소가 된다 | PR #5 종료 코멘트의 커밋 링크가 `github.com/agi040922/Portfolio/commit/db44c29…` | ✅ **해결(2026-10-02)** — `origin` 을 `https://github.com/woorichicken/Portfolio.git` 로 바꿨다(fetch 확인) |
