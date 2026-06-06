#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

"$SCRIPT_DIR/shutdown.sh"
sleep 1
"$SCRIPT_DIR/startup.sh"
