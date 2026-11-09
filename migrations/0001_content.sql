-- 포트폴리오 본문을 D1 에 둔다(2026-11-08). 자세한 설명: docs/content-api.md
--
-- 문서 다섯 개 — content:ko · content:en · content:es (src/content/types.ts 의 Content 모양 JSON) · roles (역할별 순서) · hidden (숨김 목록).
-- 쓸 때마다 zod 검사(src/content/schema.ts)를 통과해야 하고, 쓰기 직전 값은 content_history 에 남는다.

CREATE TABLE IF NOT EXISTS content_doc (
  key        TEXT PRIMARY KEY,                 -- content:ko | content:en | content:es | roles | hidden
  body       TEXT NOT NULL,                    -- JSON
  version    INTEGER NOT NULL DEFAULT 1,       -- 쓸 때마다 1 씩 오른다(동시에 고치면 409)
  updated_at TEXT NOT NULL,                    -- ISO 시각(UTC)
  updated_by TEXT NOT NULL                     -- admin | agent | seed
);

-- 한 번의 저장(change)이 문서 여러 개를 바꿀 수 있다(예: 프로젝트 추가 = 세 언어 + 역할). 되돌리기는 change 단위다.
CREATE TABLE IF NOT EXISTS content_history (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  change_id  TEXT NOT NULL,
  key        TEXT NOT NULL,
  version    INTEGER NOT NULL,                 -- 이 저장으로 만들어진 버전
  prev_body  TEXT,                             -- 저장 직전 값. NULL = 이 저장이 처음 만들었다
  body       TEXT NOT NULL,                    -- 저장한 값
  action     TEXT NOT NULL,                    -- seed | set | add-project | role | hide | undo
  actor      TEXT NOT NULL,                    -- admin | agent | seed
  summary    TEXT NOT NULL,                    -- 사람이 읽는 한 줄
  at         TEXT NOT NULL,
  undone_by  TEXT                              -- 이 change 를 되돌린 change_id
);
CREATE INDEX IF NOT EXISTS content_history_change ON content_history (change_id);
CREATE INDEX IF NOT EXISTS content_history_key ON content_history (key, id);

-- R2(MEDIA) 에 올린 사진·영상. 사진 크기를 적어 두는 이유는 images.ts 와 같다 — next/image 가 자리를 미리 잡게
CREATE TABLE IF NOT EXISTS media (
  key          TEXT PRIMARY KEY,               -- R2 키 = /media/<key> 주소
  content_type TEXT NOT NULL,
  size         INTEGER NOT NULL,
  width        INTEGER,
  height       INTEGER,
  uploaded_at  TEXT NOT NULL,
  uploaded_by  TEXT NOT NULL
);

-- OpenNext 태그 캐시(d1-next-tag-cache). populateCache 도 같은 문장으로 만든다 — 여기 둔 이유는 마이그레이션만 돌린 DB 에서도 저장 → 무효화가 돌게
CREATE TABLE IF NOT EXISTS revalidations (tag TEXT NOT NULL, revalidatedAt INTEGER NOT NULL, UNIQUE(tag) ON CONFLICT REPLACE);

-- 동시에 두 곳에서 고치면 나중 것이 앞의 것을 조용히 덮지 않게 한다. 쓰는 쪽은 「읽은 버전 + 1」을 넣고,
-- 그 사이 누가 먼저 썼으면 이 트리거가 막는다 → 같은 batch 전체가 되돌아가고 API 는 409 를 낸다.
CREATE TRIGGER IF NOT EXISTS content_doc_version_guard
BEFORE UPDATE ON content_doc
WHEN NEW.version != OLD.version + 1
BEGIN
  SELECT RAISE(ABORT, 'version_conflict');
END;
