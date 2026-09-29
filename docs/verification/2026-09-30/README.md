# 검증 기록 — 2026-09-30 (로컬 `next build` + `next start`, 포트 3427, agent-browser)

| 캡처 | 무엇 |
|---|---|
| `desktop-{ko,en,es}-top.jpg` | 1440×900 첫 화면 |
| `desktop-ko-full.jpg` | 한국어 전체 페이지(축소) |
| `mobile-{ko,en,es}-top.jpg` | 390×844 첫 화면 |
| `mobile-es-full-{1,2}.jpg` | 스페인어 모바일 전체 페이지를 5열로 나눈 것 |
| `gate-1-open.jpg` → `gate-5-sent.jpg` | `?feedback` 관문: 열림 → 틀린 비밀번호 거부 → 통과 후 위젯 → 화면 전체 제보 모달 → "보냈습니다" |

| 확인 | 결과 |
|---|---|
| `/`·`/en`·`/es` 응답, `<html lang>`, canonical·hreflang(ko/en/es/x-default) | 200, 언어별 정확 |
| `/ko` | 404 (한국어 정식 주소는 `/`) |
| 가로 넘침(데스크톱·모바일 × 3언어) | 0px |
| 이미지 로드 | 40/40 (천천히 스크롤한 뒤 기준 — 빠르게 스크롤하면 지연 로딩이 덜 끝난 채 찍힌다) |
| 관문 전 위젯 코드 | 초기 JS 청크 6개에서 위젯 고유 문자열 0건 |
| 관문 통과 후 | 새 청크 3개 로드, 그중 2개에서 위젯 고유 문자열 검출 |
| 실전송 | 라쏘런 도착 `9b20b48c-e2a2-4bb7-8f88-fe92b2c4c171` — url·viewport·session·guest id·screenshot·routes 채워짐. 근거 코멘트 후 `dismissed` |
| `?feedback=off` | 잠금 기억 삭제 확인 |
| `pnpm verify:feedback-gate` | 통과(허용 4·차단 6). 관문을 `return true` 로 풀면 exit 1 — 검사가 실제로 빨간불을 낸다 |
