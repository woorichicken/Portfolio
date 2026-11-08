#!/usr/bin/env bash
# D1 없는 정적 빌드(지금 운영 Vercel 과 같은 길 — CONTENT_SOURCE=static)를 next start 로 띄우고, 명령을 돌린 뒤 정확히 닫는다.
# 빌드는 하지 않는다 — 먼저 `CONTENT_SOURCE=static pnpm build`.
#   STATIC_PORT=3437 scripts/with-static.sh pnpm exec playwright test e2e/admin-static.spec.ts --workers=1
set -u
PORT="${STATIC_PORT:-3437}"
LOG="${STATIC_LOG:-/tmp/portfolio-static-$PORT.log}"
cd "$(dirname "$0")/.."
if lsof -iTCP:"$PORT" -sTCP:LISTEN -P -n >/dev/null 2>&1; then echo "포트 $PORT 사용 중" >&2; exit 3; fi
set -m
CONTENT_SOURCE=static ./node_modules/.bin/next start -p "$PORT" -H 127.0.0.1 > "$LOG" 2>&1 &
SERVER_PID=$!
set +m
trap 'kill -TERM -- "-$SERVER_PID" 2>/dev/null; wait "$SERVER_PID" 2>/dev/null' EXIT
for _ in $(seq 1 60); do
  kill -0 "$SERVER_PID" 2>/dev/null || { echo "next start 가 죽었다 — $LOG" >&2; exit 3; }
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/robots.txt" || true)
  [ "$code" = "200" ] && break
  sleep 1
done
[ "$code" = "200" ] || { echo "60초 안에 안 떴다 — $LOG" >&2; exit 3; }
E2E_BASE_URL="http://127.0.0.1:$PORT" "$@"
