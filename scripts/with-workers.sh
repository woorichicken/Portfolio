#!/usr/bin/env bash
# 로컬 Workers 런타임(wrangler dev · 로컬 D1/R2)을 띄우고, 뜨면 넘겨받은 명령을 돌린 뒤 정확한 PID 로 닫는다.
# 빌드는 하지 않는다 — 먼저 `pnpm cf:build`.
#
#   WORKERS_PORT=8797 scripts/with-workers.sh node scripts/verify-routes.mjs --b http://localhost:8797
#
# 종료코드는 넘겨받은 명령의 것. 서버가 60초 안에 안 뜨면 3.
set -u
PORT="${WORKERS_PORT:-8797}"
LOG="${WORKERS_LOG:-/tmp/portfolio-workers-$PORT.log}"
cd "$(dirname "$0")/.."

if lsof -iTCP:"$PORT" -sTCP:LISTEN -P -n >/dev/null 2>&1; then
  echo "포트 $PORT 를 이미 누가 쓰고 있다 — WORKERS_PORT 로 다른 포트를 고른다" >&2
  exit 3
fi

# 빌드가 만든 페이지를 로컬 R2 캐시에 넣고(OpenNext populateCache), wrangler dev 로 띄운다
pnpm exec opennextjs-cloudflare populateCache local > "$LOG" 2>&1 || { echo "populateCache 실패 — $LOG" >&2; exit 3; }
# set -m: 서버를 자기 프로세스 그룹으로 띄워, 닫을 때 그 그룹(wrangler + workerd)만 정확히 닫는다
set -m
./node_modules/.bin/wrangler dev --port "$PORT" --ip 127.0.0.1 --show-interactive-dev-session=false >> "$LOG" 2>&1 &
SERVER_PID=$!
set +m
cleanup() {
  kill -TERM -- "-$SERVER_PID" 2>/dev/null
  wait "$SERVER_PID" 2>/dev/null
}
trap cleanup EXIT

for _ in $(seq 1 60); do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then echo "wrangler dev 가 죽었다 — $LOG" >&2; exit 3; fi
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/robots.txt" || true)
  [ "$code" = "200" ] && break
  sleep 1
done
[ "$code" = "200" ] || { echo "60초 안에 안 떴다 — $LOG" >&2; exit 3; }

"$@"
