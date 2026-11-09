-- 쓰기는 「바꾼 문서」만이 아니라 「검사에 쓴 문서 전부」의 버전을 지켜야 한다(2026-11-08 수정 1회차 P2b).
-- 예: 추가 되돌리기가 읽은 뒤 다른 요청이 그 항목을 숨기면, 되돌리기는 hidden 을 안 바꿔도 hidden 이 없어진 항목을 가리키게 된다.
-- 쓰는 쪽은 안 바꾼 문서마다 「읽은 버전과 다르면」 이 표에 한 줄 넣고, 트리거가 그 즉시 batch 전체를 되돌린다(→ API 409).
CREATE TABLE IF NOT EXISTS content_version_check (key TEXT NOT NULL);
CREATE TRIGGER IF NOT EXISTS content_version_check_abort
BEFORE INSERT ON content_version_check
BEGIN
  SELECT RAISE(ABORT, 'version_conflict');
END;
