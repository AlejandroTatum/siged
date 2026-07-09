#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/siged/backend"
FRONTEND_DIR="$ROOT_DIR/siged/frontend"
BACKEND_HOST="127.0.0.1"
BACKEND_PORT="8000"
FRONTEND_HOST="127.0.0.1"
FRONTEND_PORT="3000"
BACKEND_PID=""
FRONTEND_PID=""

print_step() {
  printf '\n\033[1;34m==> %s\033[0m\n' "$1"
}

fail() {
  printf '\n\033[1;31mError:\033[0m %s\n' "$1" >&2
  exit 1
}

is_port_busy() {
  local port="$1"

  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN -n -P >/dev/null 2>&1
    return $?
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn | awk '{print $4}' | grep -Eq "(^|:)${port}$"
    return $?
  fi

  return 1
}

stop_process_group() {
  local pid="$1"

  if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
    kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  fi
}

cleanup() {
  print_step "Stopping SIGED services"
  stop_process_group "$FRONTEND_PID"
  stop_process_group "$BACKEND_PID"
}

trap cleanup INT TERM EXIT

[[ -d "$BACKEND_DIR" ]] || fail "Backend directory not found: $BACKEND_DIR"
[[ -d "$FRONTEND_DIR" ]] || fail "Frontend directory not found: $FRONTEND_DIR"
[[ -x "$BACKEND_DIR/.venv/bin/python" ]] || fail "Backend virtualenv not found. Run: cd siged/backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
[[ -d "$FRONTEND_DIR/node_modules" ]] || fail "Frontend dependencies not installed. Run: cd siged/frontend && npm install"

if is_port_busy "$BACKEND_PORT"; then
  fail "Port $BACKEND_PORT is already in use. Stop the existing backend first."
fi

if is_port_busy "$FRONTEND_PORT"; then
  fail "Port $FRONTEND_PORT is already in use. Stop the existing frontend first."
fi

print_step "Preparing backend database"
(
  cd "$BACKEND_DIR"
  .venv/bin/python manage.py migrate --noinput
  .venv/bin/python manage.py seed_superuser
)

print_step "Starting backend on http://$BACKEND_HOST:$BACKEND_PORT"
setsid bash -c "cd '$BACKEND_DIR' && exec .venv/bin/python manage.py runserver '$BACKEND_HOST:$BACKEND_PORT'" &
BACKEND_PID="$!"

print_step "Starting frontend on http://$FRONTEND_HOST:$FRONTEND_PORT"
setsid bash -c "cd '$FRONTEND_DIR' && exec npm run dev -- --host '$FRONTEND_HOST' --port '$FRONTEND_PORT'" &
FRONTEND_PID="$!"

printf '\nSIGED is starting:\n'
printf '  Backend:  http://%s:%s\n' "$BACKEND_HOST" "$BACKEND_PORT"
printf '  Frontend: http://%s:%s\n' "$FRONTEND_HOST" "$FRONTEND_PORT"
printf '\nPress Ctrl+C to stop both services.\n\n'

wait -n "$BACKEND_PID" "$FRONTEND_PID"
