#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
RELEASE_DIR="$PROJECT_ROOT/RELEASE"
FRONT_BUILD_DIR="$PROJECT_ROOT/dataRoomFront/front"

require_file() {
    local path="$1"
    if [[ ! -f "$path" ]]; then
        echo "缺少文件: $path" >&2
        exit 1
    fi
}

require_dir() {
    local path="$1"
    if [[ ! -d "$path" ]]; then
        echo "缺少目录: $path" >&2
        exit 1
    fi
}

cleanup_target() {
    local path="$1"
    case "$path" in
        "$RELEASE_DIR"/*)
            rm -rf "$path"
            ;;
        *)
            echo "拒绝删除非RELEASE目录内容: $path" >&2
            exit 1
            ;;
    esac
}

extract_version() {
    local version
    version="$(grep -A 1 '<artifactId>DataRoom</artifactId>' "$PROJECT_ROOT/pom.xml" | grep '<version>' | sed 's/.*<version>\(.*\)<\/version>.*/\1/' | xargs)"
    if [[ -z "$version" ]]; then
        echo "无法从 pom.xml 读取版本号" >&2
        exit 1
    fi
    printf '%s\n' "$version"
}

cd "$PROJECT_ROOT"

require_file "$PROJECT_ROOT/pom.xml"
require_dir "$PROJECT_ROOT/dataRoomFront"
require_dir "$PROJECT_ROOT/dataRoomServer"

VERSION="$(extract_version)"
PACKAGE_NAME="dataRoom-${VERSION}"
PACKAGE_DIR="$RELEASE_DIR/$PACKAGE_NAME"
ZIP_PATH="$RELEASE_DIR/$PACKAGE_NAME.zip"

echo "当前版本号: $VERSION"

echo "准备打包前端"
cd "$PROJECT_ROOT/dataRoomFront"
npm run build
echo "前端打包完毕"

require_dir "$FRONT_BUILD_DIR"

cd "$PROJECT_ROOT"
echo "准备打包后端"
mvn clean package -Dmaven.test.skip=true
echo "后端打包完毕"

require_file "$PROJECT_ROOT/dataRoomServer/target/dataRoomServer.jar"

echo "准备构建RELEASE包"
mkdir -p "$RELEASE_DIR"
cleanup_target "$PACKAGE_DIR"
rm -f "$ZIP_PATH"

mkdir -p "$PACKAGE_DIR/dataRoomFront"
mkdir -p "$PACKAGE_DIR/config"

cp "$PROJECT_ROOT/dataRoomServer/target/dataRoomServer.jar" "$PACKAGE_DIR/"
cp -r "$FRONT_BUILD_DIR/." "$PACKAGE_DIR/dataRoomFront"
cp "$PROJECT_ROOT"/dataRoomServer/src/main/resources/*.yml "$PACKAGE_DIR/config"

(
    cd "$RELEASE_DIR"
    zip -r "$ZIP_PATH" "$PACKAGE_NAME"
)
echo "${PACKAGE_NAME}.zip包构建完毕"

cleanup_target "$PACKAGE_DIR"
