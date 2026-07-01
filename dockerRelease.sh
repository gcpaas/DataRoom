#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
DEFAULT_IMAGE="gcpaas/dataroom"

usage() {
    cat <<'EOF'
用法: ./dockerRelease.sh [选项]

根据 pom.xml 版本号和当前时间生成 Docker 镜像版本号，确认后自动执行:
1. ./release.sh
2. docker build
3. docker tag latest
4. docker push 版本号和 latest

选项:
  -i, --image IMAGE       镜像名称，默认 gcpaas/dataroom
  -v, --version VERSION   指定版本号，仍会提示确认
  -y, --yes               使用生成或指定的版本号，不再交互确认
  --use-existing-release  复用 RELEASE 目录中已有的 dataRoom-*.zip，不重新打包项目
  --no-latest             不构建和推送 latest 标签
  --no-push               只构建镜像，不推送
  -h, --help              显示帮助

默认版本号格式:
  <pom.xml版本号>.<yyyyMMddHHmmss>
  例如: 3.4.0.20260630153045

交互说明:
  直接回车或输入 y     使用推荐版本号继续
  输入新的版本号       改用你输入的版本号
  输入 n 或 q          取消发布
EOF
}

require_command() {
    local command_name="$1"
    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "缺少必要工具: $command_name" >&2
        echo "请先安装或配置好 $command_name，然后重新运行脚本。" >&2
        exit 1
    fi
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

current_timestamp() {
    date '+%Y%m%d%H%M%S'
}

validate_tag() {
    local tag="$1"
    if [[ ${#tag} -gt 128 || ! "$tag" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]*$ ]]; then
        echo "版本号格式不正确: $tag" >&2
        echo "版本号只能包含字母、数字、下划线、点和短横线，且不能以点或短横线开头，最长 128 字符。" >&2
        return 1
    fi
}

confirm_version() {
    local selected_version="$1"
    local generated="$2"
    local image="$3"
    local push_image="$4"
    local tag_latest="$5"
    local use_existing_release="$6"
    local release_zip="$7"
    local input

    while true; do
        echo >&2
        echo "即将发布 Docker 镜像" >&2
        echo "----------------------------------------" >&2
        if [[ "$generated" == true ]]; then
            echo "脚本已自动生成推荐版本号: $selected_version" >&2
            echo "生成规则: pom.xml 版本号 + 当前时间" >&2
        else
            echo "你指定的版本号: $selected_version" >&2
        fi
        echo "镜像名称: $image:$selected_version" >&2
        if [[ "$tag_latest" == true ]]; then
            echo "latest 标签: 会同步更新为 $image:latest" >&2
        else
            echo "latest 标签: 不更新" >&2
        fi
        if [[ "$push_image" == true ]]; then
            echo "镜像推送: 会推送到镜像仓库" >&2
        else
            echo "镜像推送: 跳过，只在本机生成镜像" >&2
        fi
        if [[ "$use_existing_release" == true ]]; then
            echo "项目打包: 跳过，直接使用已有 RELEASE 包" >&2
            echo "RELEASE 包: $release_zip" >&2
        else
            echo "项目打包: 会先重新执行 ./release.sh" >&2
        fi
        echo "----------------------------------------" >&2
        if [[ "$use_existing_release" == true ]]; then
            echo "接下来会直接构建 Docker 镜像，不会重新打包项目。" >&2
        else
            echo "接下来会先打包项目，再构建 Docker 镜像。" >&2
        fi
        printf "直接回车或输入 y 继续；输入新版本号改用它；输入 n 或 q 取消: " >&2
        read -r input
        case "$input" in
            ""|y|Y|yes|YES|Yes)
                VERSION="$selected_version"
                return
                ;;
            n|N|no|NO|No|q|Q|quit|QUIT|Quit)
                echo "已取消发布"
                exit 0
                ;;
            *)
                if ! validate_tag "$input"; then
                    echo "请重新输入。" >&2
                    continue
                fi
                selected_version="$input"
                generated=false
                ;;
        esac
    done
}

find_latest_release_zip() {
    local latest_zip
    latest_zip="$(find "$PROJECT_ROOT/RELEASE" -maxdepth 1 -type f -name 'dataRoom-*.zip' -print 2>/dev/null | sort -r | head -n 1 || true)"
    if [[ -z "$latest_zip" ]]; then
        echo "未找到已有 RELEASE 包: $PROJECT_ROOT/RELEASE/dataRoom-*.zip" >&2
        echo "请先运行 ./release.sh 生成部署包，或去掉 --use-existing-release 让脚本自动重新打包。" >&2
        exit 1
    fi
    printf '%s\n' "$latest_zip"
}

IMAGE="$DEFAULT_IMAGE"
VERSION=""
VERSION_WAS_GENERATED=false
ASSUME_YES=false
PUSH_IMAGE=true
TAG_LATEST=true
USE_EXISTING_RELEASE=false
RELEASE_ZIP=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -i|--image)
            IMAGE="${2:-}"
            if [[ -z "$IMAGE" ]]; then
                echo "$1 需要镜像名称" >&2
                exit 1
            fi
            shift 2
            ;;
        -v|--version)
            VERSION="${2:-}"
            if [[ -z "$VERSION" ]]; then
                echo "$1 需要版本号" >&2
                exit 1
            fi
            shift 2
            ;;
        -y|--yes)
            ASSUME_YES=true
            shift
            ;;
        --use-existing-release)
            USE_EXISTING_RELEASE=true
            shift
            ;;
        --no-latest)
            TAG_LATEST=false
            shift
            ;;
        --no-push)
            PUSH_IMAGE=false
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "未知参数: $1" >&2
            usage
            exit 1
            ;;
    esac
done

cd "$PROJECT_ROOT"

require_command docker
require_command grep
require_command sed
require_command xargs

if [[ "$USE_EXISTING_RELEASE" == true ]]; then
    RELEASE_ZIP="$(find_latest_release_zip)"
fi

if [[ -z "$VERSION" ]]; then
    BASE_VERSION="$(extract_version)"
    VERSION="${BASE_VERSION}.$(current_timestamp)"
    VERSION_WAS_GENERATED=true
fi

validate_tag "$VERSION" || exit 1

if [[ "$ASSUME_YES" != true ]]; then
    confirm_version "$VERSION" "$VERSION_WAS_GENERATED" "$IMAGE" "$PUSH_IMAGE" "$TAG_LATEST" "$USE_EXISTING_RELEASE" "$RELEASE_ZIP"
elif [[ "$VERSION_WAS_GENERATED" == true ]]; then
    echo "脚本已自动生成版本号: $VERSION"
fi

VERSION_IMAGE="$IMAGE:$VERSION"
LATEST_IMAGE="$IMAGE:latest"

echo
echo "发布信息"
echo "----------------------------------------"
echo "镜像名称: $IMAGE"
echo "发布版本: $VERSION"
echo "版本镜像: $VERSION_IMAGE"
if [[ "$TAG_LATEST" == true ]]; then
    echo "latest镜像: $LATEST_IMAGE"
fi
if [[ "$USE_EXISTING_RELEASE" == true ]]; then
    echo "RELEASE包: $RELEASE_ZIP"
else
    echo "RELEASE包: 重新生成"
fi
echo "----------------------------------------"

if [[ "$USE_EXISTING_RELEASE" == true ]]; then
    echo "跳过项目打包，直接使用已有 RELEASE 包: $RELEASE_ZIP"
else
    echo "准备生成 RELEASE 部署包"
    "$PROJECT_ROOT/release.sh"
fi

echo "准备构建镜像: $VERSION_IMAGE"
docker build -t "$VERSION_IMAGE" .

if [[ "$TAG_LATEST" == true ]]; then
    echo "准备标记 latest: $LATEST_IMAGE"
    docker tag "$VERSION_IMAGE" "$LATEST_IMAGE"
fi

if [[ "$PUSH_IMAGE" == true ]]; then
    echo "准备推送镜像: $VERSION_IMAGE"
    docker push "$VERSION_IMAGE"

    if [[ "$TAG_LATEST" == true ]]; then
        echo "准备推送镜像: $LATEST_IMAGE"
        docker push "$LATEST_IMAGE"
    fi
else
    echo "已跳过镜像推送"
fi

echo "Docker 发布完成: $VERSION_IMAGE"
