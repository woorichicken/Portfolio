-- 되돌리기(undo) 가 어느 change 를 되돌렸는지 적는다(2026-11-08).
-- 「다시 하기」(되돌리기를 되돌림)를 하면 원래 저장이 다시 살아 있어야 다음 undo 가 그걸 고른다 — 그 연결을 이 칸으로 따라간다.
ALTER TABLE content_history ADD COLUMN undoes TEXT;
