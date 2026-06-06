#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
JAR_NAME="dataRoomServer.jar"
PID_FILE="$SCRIPT_DIR/dataRoomServer.pid"

if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
  JAVA_CMD="$JAVA_HOME/bin/java"
else
  JAVA_CMD="java"
fi

if ! command -v "$JAVA_CMD" >/dev/null 2>&1; then
  echo "Java runtime not found. Please set JAVA_HOME or add java to PATH."
  exit 1
fi

if [ ! -f "$SCRIPT_DIR/$JAR_NAME" ]; then
  echo "Jar not found: $SCRIPT_DIR/$JAR_NAME"
  exit 1
fi

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "$JAR_NAME is already running. PID=$PID"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

cd "$SCRIPT_DIR"
nohup "$JAVA_CMD" -jar "$JAR_NAME" > /dev/null 2>&1 &
PID=$!
echo "$PID" > "$PID_FILE"

echo "$JAR_NAME started. PID=$PID"
