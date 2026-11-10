---
name: solhun-content
description: solhun.com 포트폴리오(이 저장소)의 본문을 콘텐츠 API 로 읽고 고친다 — 문구 수정(세 언어) · 프로젝트 추가 · 역할 화면 배치·대표작 · 숨김 · 오픈소스 행 · 만든 영상 행 · 「코드 보기」(repo) · 사진/영상 올리기 · 되돌리기. 저장하면 바로 사이트에 반영된다(D1 + Cloudflare Workers). 사용자가 "포트폴리오 문구 고쳐줘", "solhun.com 에 프로젝트 추가", "이 프로젝트 맨 앞으로", "대표작 바꿔줘", "이거 숨겨줘", "사진 바꿔줘", "방금 거 되돌려", "영어판 문구도", "오픈소스 저장소 추가", "영상 올려줘", "코드 보기 링크", "content API" 라고 하면 — 저장소 코드를 몰라도 — 이 스킬 하나만 읽고 `pnpm content` 로 한다. 본문 파일(src/content/*.ts)을 직접 고치지 않는다.
---

# solhun-content — 포트폴리오 본문 고치기

**본문은 코드가 아니라 D1 에 있다(2026-11-08~).** `src/content/{ko,en,es}.ts`·`roles.ts` 는 처음 넣을 때 쓴 시드일 뿐이라 고쳐도 사이트가 안 바뀐다.
모든 일은 `pnpm content <명령>` 하나로 한다 — 어드민 화면(`/admin`)의 「저장」도 같은 API 를 부른다.
저장하면 서버가 ① 세 언어 모양 검사(zod) ② D1 에 쓰기(직전 값은 이력) ③ 바뀐 페이지만 다시 그리기까지 한다. 잘못 썼으면 `undo`.

## 0. 시작 전 — 어디에 쓰나

| 대상 | 주소 | 토큰 | 상태(2026-11-10) |
|---|---|---|---|
| 로컬(기본) | `http://127.0.0.1:8797` | `.dev.vars` 의 `CONTENT_API_TOKEN`(자동으로 읽는다) | 쓸 수 있다 |
| 운영 | `--target prod` = `https://www.solhun.com` | `CONTENT_API_TOKEN` 환경변수 또는 `~/.config/portfolio/content-api-token`(0600) | **쓸 수 있다** — 2026-11-09 Cloudflare Workers 로 옮겼다(docs/DEPLOY.md 8절). 운영에 쓰면 바로 사이트에 보인다 — 사람이 시킨 것만 쓰고, 쓴 뒤 출력의 `undo` 명령을 보고에 남긴다 |

로컬 서버 띄우기(처음 한 번은 D1 을 만든다):

```bash
pnpm db:migrate:local && pnpm db:seed:local     # 처음 한 번(여러 번 돌려도 같다 — 이미 고친 본문은 안 덮는다)
pnpm cf:build                                   # D1 스냅숏을 떠서 Workers 용으로 빌드
pnpm cf:preview                                 # 127.0.0.1:8797 에 띄운다(끝나면 Ctrl+C) — 다른 창에서 pnpm content …
scripts/with-workers.sh pnpm -s content get     # 또는: 띄우고 → 명령 하나 → 닫기(사람 없는 세션은 이쪽)
```

## 1. 무엇을 하려면 — 어떤 명령

예시는 실제 id 다(`pnpm content get` 으로 목록).

| 하려는 일 | 명령 |
|---|---|
| 항목 목록(id · 종류 · 숨김 · 역할 몇 번째 · ★대표작) | `pnpm content get` |
| 항목 하나를 세 언어로 | `pnpm content get kits` |
| 칸 하나를 세 언어로 | `pnpm content get kits.tagline` |
| 문구 고치기(한 언어) | `pnpm content set kits.tagline "새 한 줄" --locale ko` |
| 문구 고치기(세 언어 한 번에) | `pnpm content set kits.tagline --ko "…" --en "…" --es "…"` |
| 프로젝트 밖 문구(소개·연락 등) | `pnpm content set hero.lead "…" --locale en` · `get --doc ko --path contact.body` |
| 없던 선택 칸 넣기(배지·지표 등) | **세 언어 같이**: `pnpm content set kits.improvements[0].badge --ko "최신" --en "Latest" --es "Último"` |
| 선택 칸 지우기 | `pnpm content set kits.improvements[0].badge --unset` (세 언어) |
| 칸에 객체 넣기(사진 등) | `--as-json` 을 붙이고 값에 JSON — 아래 5절 |
| 프로젝트 추가 | `pnpm content add-project --template other > new.json` → 고치고 → `pnpm content add-project new.json` (4절) |
| 역할 화면에 넣기·옮기기 | `pnpm content role design --place fair --at 0` (at 은 0부터 · 없으면 맨 뒤) |
| 역할에서 빼기 | `pnpm content role design --remove motion-meme` |
| 대표작(빌보드) 바꾸기 | `pnpm content role design --featured fair` |
| 역할 순서 통째로 | `pnpm content role ax --order automation,fair,cli-manager,kits,ncdigitec,purple,porterx` (`--others-order` 는 「그 외」 줄) |
| 역할 지금 배치 보기 | `pnpm content role design` |
| 숨기기 · 다시 보이기 | `pnpm content hide motion-meme` · `pnpm content hide motion-meme --show` |
| 사진·영상 올리기 | `pnpm content media public/work/kits_round.jpg --name kits-round` → 나온 shot 을 칸에 넣는다(5절) · 목록 `media --list` |
| 최근 저장 보기 | `pnpm content history --limit 10` |
| 마지막 저장 되돌리기 | `pnpm content undo` (부를 때마다 한 칸씩 뒤로) |
| 특정 저장 되돌리기 · 되돌린 걸 다시 하기 | `pnpm content undo <changeId>` (되돌리기의 changeId 를 주면 다시 하기) |
| 오픈소스 행 — 저장소 하나 글 고치기 | `pnpm content set 'openSource.items[nightgate].body' "…" --locale ko` |
| 오픈소스 행 — 저장소 추가(세 언어 같이 · 번호 = 지금 개수) | `pnpm content set 'openSource.items[5]' --as-json --ko '{"id":"…","name":"…","body":"…","repo":"https://github.com/…","homepage":"https://…"}' --en '…' --es '…'` (homepage 는 빼도 된다) |
| 오픈소스 행 — 저장소 빼기 | `pnpm content set 'openSource.items[<id>]' --unset` |
| 오픈소스·영상 행 켜고 끄기(역할마다) | `pnpm content role maker --open-source on\|off` · `pnpm content role design --videos on\|off` · 지금 값 `get --doc roles --path maker.openSource` |
| 영상 제목·설명 고치기 | `pnpm content set 'videos.items[fair-update].title' "…" --locale ko` |
| 영상 추가 | 5.1절 |
| 「GitHub 보러가기」 단추(빌보드·상세 머리) | `pnpm content set kits.repo --ko <URL> --en <URL> --es <URL>` (세 언어 같은 주소) · 빼기 `set kits.repo --unset` |
| 운영에 하기 | 같은 명령 끝에 `--target prod` (0절 상태 확인) |
| 결과를 기계로 읽기 | 아무 명령에 `--json` |

종류 — 큰 프로젝트(`project`, id: kits · fair · cli-manager · automation · purple · porterx · ncdigitec), 「그 외」(`other`, design-atlas 등), 「이전」(`early`, debatetimer 등). 역할: `design` · `product` · `ax` · `maker` · `all`.

## 1.1 어드민에서 하는 법 — 사람이 직접 고칠 때

사람이 「어드민에서 하고 싶다」고 하면 명령 대신 이걸 안내한다. 같은 API 라 **어드민 저장도 `pnpm content history` 에 `admin` 으로 남고, `undo <changeId>` 로 되돌릴 수 있다**(반대로 에이전트 저장도 어드민 「최근 저장」 탭에 「에이전트」로 보인다).

| 하려는 일 | 어드민(`/admin`, 피드백 모드와 같은 비밀번호) |
|---|---|
| 문구(세 언어) · 사진 · alt · GitHub 보러가기 | 목록에서 **항목 이름(또는 연필)** → 편집 패널에서 ko·en·es 나란히 고치고 「저장」. 사진은 칸의 「… 바꾸기」로 파일을 올린다 |
| 오픈소스 · 만든 영상 행 | 「오픈소스」·「만든 영상」 탭 — 줄 추가·빼기·순서 → 「… 저장」 · 「보일 역할」 체크는 누르면 바로 저장 |
| 「그 외」 프로젝트 추가 | 「프로젝트 추가」 탭 — slug · 넣을 역할 · 칸 → 「추가」(add-project 와 같은 검사) |
| 되돌리기 | 「최근 저장」 탭 — 저장마다 「되돌리기」 · 되돌리기 줄은 「다시 하기」 |
| 배치 · 숨김 · 코멘트 | 「항목·배치」 탭(예전 그대로) |

- 422(세 언어 모양 · https 아님 등)는 그 칸 바로 아래에 언어와 함께 뜬다. 409 는 그 사이 다른 저장이 있었다는 뜻 — 패널을 닫고 다시 연다.
- 어드민에 아직 없는 것(큰 프로젝트 추가 · 「이전」 추가 · 역할 이름·소개 글 · 대표작(빌보드) 바꾸기 · 프로젝트 밖 문구 hero·contact 등)은 1절 명령으로 한다.
- 화면 설명과 API 대응표: `docs/content-api.md` 「어드민에서 하는 법」.

## 2. 경로 쓰는 법

- `<id>.<칸>` 으로 시작하면 CLI 가 API 경로로 바꾼다: `kits.tagline` → `work.projects[kits].tagline`, `design-atlas.body` → `others.items[design-atlas].body`.
- 목록은 `[번호]`(0부터) 또는 `[id]`: `kits.improvements[0].title`, `kits.gallery[2].alt`.
- 프로젝트 밖은 맨 위 칸 이름으로: `meta.description` · `hero.lead` · `contact.body` · `timeline.items[3].text` · `awards.items[0].title` · `openSource.items[nightgate].body` · `videos.items[fair-update].title`.
- 대괄호가 든 경로는 따옴표로 감싼다(zsh 가 `[…]` 를 파일 이름 패턴으로 읽는다).
- 칸 이름은 `src/content/types.ts` 가 정본이다. 모르는 칸 이름은 422 로 막힌다(오타가 조용히 무시되지 않는다).

## 3. 세 언어 규칙 — 왜 422 가 나나

세 언어(ko · en · es)는 **글자만 다르고 모양은 같아야 한다**. 서버가 쓸 때마다 검사한다.

- 글자 고치기는 한 언어씩 해도 된다.
- **없던 칸을 넣거나 지우기, 목록 길이 바꾸기(갤러리 한 장 추가 등), 프로젝트 추가**는 세 언어를 한 번에 해야 통과한다 → `--ko --en --es` 또는 `add-project` 파일에 세 언어.
- 사진 파일(`src`·`width`·`height`)과 `id`·`slug`, 그리고 `repo`·`homepage`·영상 `poster`·`project` 는 세 언어가 같아야 한다(`alt`·`body`·`title` 은 언어마다).

## 4. 프로젝트 추가 — 순서

```bash
pnpm content add-project --template other > new.json      # 「그 외」 틀(큰 프로젝트는 --template project)
# new.json 을 고친다: slug(주소 · 소문자-하이픈) 세 언어 같게, 이름·한 줄·상세 문단, roles(넣을 역할과 위치)
pnpm content media ./cover.jpg --name my-new-work          # 표지 사진이 새것이면 먼저 올리고 나온 shot 을 세 언어 shot 에 (alt 만 언어마다)
pnpm content add-project new.json                          # 검사 → 저장 → /projects/<slug> 와 그 역할 화면이 바로 생긴다
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8797/projects/my-new-work   # 200 확인
```

같은 id 가 이미 있으면 409 `exists` — 고치려면 `set` 을 쓴다. 지우는 명령은 없다 — `hide` 로 숨기거나 방금 추가한 것이면 `undo`.

## 5. 사진·영상

- 올리기: `pnpm content media <파일> [--name 이름]` — jpg·png·webp·gif(10MB) · mp4·webm(90MB). R2 에 올라가 `/media/<키>` 로 나간다(영상은 Range 로 넘겨 보기 됨).
- 응답의 `shot`(src·width·height)을 칸에 넣는다. 예 — 퍼플 표지 바꾸기:
  ```bash
  S=/media/image/kits-round-1a2b3c4d5e   # media 가 찍어 준 src(아래 예시는 자리표시 — 꼭 찍힌 값을 쓴다)
  pnpm content set purple.cover --as-json \
    --ko "{\"src\":\"$S\",\"width\":1400,\"height\":900,\"alt\":\"퍼플 표지\"}" \
    --en "{\"src\":\"$S\",\"width\":1400,\"height\":900,\"alt\":\"Purple cover\"}" \
    --es "{\"src\":\"$S\",\"width\":1400,\"height\":900,\"alt\":\"Portada de Purple\"}"
  ```
- 주소는 `/media/<image|video>/<이름>-<내용 지문 10자>.<확장자>` — **같은 파일은 로컬·운영 어디에 몇 번 올려도 같은 주소**다(2026-11-10~. 그 전에 올린 `/media/2026-11/…` 주소도 그대로 산다).
- 올리기만으로는 본문이 안 바뀐다(되돌리기 대상도 아니다). 칸에 넣는 순간부터 이력에 남는다.
- `/media/` 사진은 next/image 최적화를 건너뛴다(원본 그대로) — 크기를 1400px 안팎으로 줄여서 올린다.

### 5.1 영상 행에 영상 하나 더하기

역할 화면 「만든 영상」 행(design · all 에서 켜 있다). 자동재생하지 않고, 누르기 전에는 포스터만 받는다.

```bash
ffmpeg -v error -ss 12 -i clip.mp4 -frames:v 1 -q:v 3 clip-poster.jpg   # 포스터 — 첫 장면 말고 영상을 대표하는 장면(초를 골라서)
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 clip.mp4   # 1920,1080
pnpm content media clip.mp4 --name my-clip            # → /media/video/my-clip-….mp4 (90MB 까지)
pnpm content media clip-poster.jpg --name my-clip-poster
pnpm content get --doc ko --path videos.items        # 지금 개수 = 새 번호
pnpm content set 'videos.items[4]' --as-json \
  --ko '{"id":"my-clip","title":"…","body":"…","src":"/media/video/…","poster":"/media/image/…","width":1920,"height":1080,"project":"cli-manager"}' \
  --en '{…같은 id·src·poster·width·height·project, 글만 영어…}' --es '{…}'
```

`project` 는 선택 — 있는 항목 id 면 카드 아래 「프로젝트 보기 · 이름」 링크가 붙는다. 순서를 바꾸려면 `set videos --as-json` 으로 목록을 통째로 넣는다.

## 6. 반영 확인

저장 응답에 「다시 그린 주소 N곳」이 찍힌다. 상세에만 보이는 칸(요약·맡은 일·바꾼 것·인용·갤러리)은 그 상세 하나, 카드·빌보드에 보이는 칸은 그 언어 전체, 역할·숨김은 세 언어 전체다.
화면으로 확인: `curl -s <주소>/as/design | grep -c '새 문구'` — 1 이상이면 반영됐다. 어드민(`/admin`) 「최근 저장」에도 에이전트 저장이 보인다.

## 7. 실패하면

| 응답 | 뜻 | 할 일 |
|---|---|---|
| `401 unauthorized` | 토큰이 없거나 틀림 | 0절 토큰 위치. 로컬은 `.dev.vars` 에 `CONTENT_API_TOKEN=` 이 있는지 |
| `403 bad_origin` | 쿠키(어드민)로 다른 출처에서 쓰기 | 에이전트는 쿠키가 아니라 Bearer 로 — `pnpm content` 를 쓰면 저절로 |
| `404 not_found` | 없는 id·경로·changeId | `pnpm content get` / `get <id>` 로 이름 확인 |
| `409 exists` | 추가하려는 id 가 이미 있음 | `set` 으로 고치거나 다른 slug |
| `409 conflict` | ① 그 사이 다른 곳이 먼저 저장 ② 되돌리려는 저장 뒤에 같은 문서가 또 바뀜 ③ 대표작을 역할에서 빼려 함 | ① 다시 실행 ② `history` 에서 뒤의 저장부터 `undo <id>` ③ `--featured` 먼저 |
| `422 invalid` + `problems` | 세 언어 모양이 다르거나 모르는 칸·잘못된 값 | `problems` 의 경로를 본다. 「ko 에만 있는 칸」이면 `--ko --en --es` 로 같이 |
| `503 no_db` · `not_seeded` | D1 이 없거나 비었음 | 로컬: `pnpm db:migrate:local && pnpm db:seed:local` 후 `pnpm cf:build`. 운영이 아직 Vercel 이면 운영 쓰기는 불가(0절) |
| 「…에 닿지 못했습니다」 | 서버가 안 떠 있음 | 0절로 띄운다 |

- `pnpm content …` 로 부르면 실패는 모두 종료코드 1 로 나온다(pnpm 이 뭉갠다). 사용법 2 · 서버 없음 3 을 구분하려면 `node scripts/content-cli.mjs …` 로 부른다.
- `undo` 를 계속 부르다 오래된 저장에 닿으면 409 가 날 수 있다(그 뒤 시드 `--force` 등으로 값이 바뀐 경우) — `history` 로 무엇이 남았는지 본다.
- 본문을 저장소 TS 파일 상태로 통째로 되돌리기(로컬 전용): `pnpm db:seed:local --force` — 덮기 전 값은 이력에 남는다.

## 검증 기록

- 2026-11-08 로컬 Workers(127.0.0.1:8797)에서 1절 표의 명령을 전부 차례로 돌렸다 — `set`(ko · 세 언어 · en) → 화면 반영 1회 → `undo` 0회, 선택 칸 ko 만 422 · 세 언어 통과, `add-project` → `/projects/my-new-work` 200 · 역할 화면에 카드 → 같은 파일 다시 409, `hide`/`--show`, `role --place/--featured`(빌보드 FAIR) · `--remove` 대표작 409, `history`, `undo` ×5(추가까지 되돌려 404), `media` 업로드 → GET 200 · Range 206 → `purple.cover` 에 넣어 상세 반영 → undo, 틀린 토큰 401 · 없는 id 404 · `--locale` 빠짐 사용법 · 서버 없음.
- 같은 날 2회차: `get --doc ko --path contact.body`, `role --remove motion-meme`(화면에서 빠짐 0회) → undo, `role ax --order`(같은 순서 = 「바뀐 것 없음」) · `--others-order` → undo,
  `set … --unset`, `undo --json`, 다시 하기(`undo <되돌리기 id>`) 뒤 기본 `undo` 두 번이 한 칸씩 뒤로 감(이 회차에서 고친 버그 — 전에는 오래된 저장으로 건너뛰어 409), `pnpm cf:preview` 4초 기동.
  기록: 배치 폴더 `~/Downloads/_batches/task-portfolio-d1-1108/review/Portfolio/REPORT.md`.
- 2026-11-10 로컬 Workers 에서 1절 표의 새 줄을 차례로 돌렸다 — `get --doc ko --path 'openSource.items[nightgate]'` · `get --doc roles --path maker.openSource`(true),
  `set 'openSource.items[nightgate].body' --locale ko` → 화면 1회 → `undo`, `set 'openSource.items[5]'` 세 언어 → 화면에 저장소 링크 → `--unset` → 0회, 같은 추가를 ko 만 → 422(목록 길이),
  `set 'videos.items[fair-update].title' --locale ko` → 화면 1회 → `undo`, `set kits.repo` 세 언어 → 상세에 링크 → `--unset`, `role maker --open-source off`(행 0회)/`on` · `role design --videos off`/`on` · `--videos maybe` → 사용법 오류.
  5.1 의 `ffprobe` · `get --doc ko --path videos.items`(4개) · `set 'videos.items[4]'` 세 언어 → 화면 영상 5개 → `--unset` → 4개. `media`(영상·포스터)·`set videos`·`role` 순서는 배치 폴더 `fb/apply-prod.sh` 로 운영 모양 로컬 D1 에 돌려 통과(결과 = 시드와 같음). 기록 `fb/doc-commands.log` · `fb/REPORT.md`.
