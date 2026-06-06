#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
JAR_NAME="dataRoomServer.jar"
PID_FILE="$SCRIPT_DIR/dataRoomServer.pid"

find_pids() {
  if command -v pgrep >/dev/null 2>&1; then
    pgrep -f "$JAR_NAME" 2>/dev/null || true
  else
    ps -eo pid=,command= | grep "$JAR_NAME" | grep -v grep | awk '{ print $1 }' || true
  fi
}

PIDS=""
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    PIDS="$PID"
  else
    rm -f "$PID_FILE"
  fi
fi

if [ -z "$PIDS" ]; then
  PIDS=$(find_pids)
fi

if [ -z "$PIDS" ]; then
  echo "$JAR_NAME is not running."
  exit 0
fi

for PID in $PIDS; do
  kill "$PID" 2>/dev/null || true
done

for _ in 1 2 3 4 5 6 7 8 9 10; do
  RUNNING=""
  for PID in $PIDS; do
    if kill -0 "$PID" 2>/dev/null; then
      RUNNING="1"
      break
    fi
  done
  [ -z "$RUNNING" ] && break
  sleep 1
done

for PID in $PIDS; do
  if kill -0 "$PID" 2>/dev/null; then
    kill -9 "$PID" 2>/dev/null || true
  fi
done

rm -f "$PID_FILE"
echo "$JAR_NAME stopped."
