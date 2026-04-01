#!/bin/bash

# ============================================================
#  幸运转盘 - Docker 部署管理脚本
#  用法: ./deploy.sh [命令]
#  命令: start|stop|restart|logs|build|status|clean
# ============================================================

set -e

# ---------- 配置 ----------
IMAGE_NAME="my-lucky-wheel"
IMAGE_TAG="latest"
CONTAINER_NAME="lucky-wheel"
PORT="${DEPLOY_PORT:-8080}"

# ---------- 路径 ----------
# 兼容 source 执行和直接执行
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
else
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
fi
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOCKERFILE_DIR="${PROJECT_DIR}"

# ---------- 颜色输出 ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

# ---------- 命令 ----------
cmd_build() {
    info "开始构建镜像..."
    # 预拉取基础镜像，避免 BuildKit DNS 解析失败
    info "预拉取基础镜像 node:20-alpine nginx:alpine ..."
    docker pull node:20-alpine && docker pull nginx:alpine || {
        warn "基础镜像拉取失败，尝试直接构建..."
    }
    # 使用 desktop-linux 构建器（docker driver，使用宿主机网络）
    docker buildx build --builder desktop-linux --load \
        -t "${IMAGE_NAME}:${IMAGE_TAG}" \
        "${PROJECT_DIR}"
    local rc=$?
    if [[ $rc -ne 0 ]]; then
        error "镜像构建失败"
        exit $rc
    fi
    info "构建完成！镜像: ${IMAGE_NAME}:${IMAGE_TAG}"
}

cmd_start() {
    # 如果容器已存在，先提示
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        warn "容器 ${CONTAINER_NAME} 已存在，请使用 restart 命令"
        return 0
    fi

    info "启动容器 ${CONTAINER_NAME}..."
    docker run -d \
        --name "${CONTAINER_NAME}" \
        --restart unless-stopped \
        -p "${PORT}:80" \
        "${IMAGE_NAME}:${IMAGE_TAG}"

    sleep 1
    if is_running; then
        info "启动成功！访问地址: http://localhost:${PORT}"
    else
        error "启动失败，请查看日志: $0 logs"
        exit 1
    fi
}

cmd_stop() {
    if ! is_exists; then
        warn "容器 ${CONTAINER_NAME} 不存在，跳过"
        return 0
    fi
    info "停止容器 ${CONTAINER_NAME}..."
    docker stop "${CONTAINER_NAME}" 2>/dev/null || true
    docker rm "${CONTAINER_NAME}" 2>/dev/null || true
    info "已停止并移除容器"
}

cmd_restart() {
    info "重启容器..."
    cmd_stop
    cmd_build
    cmd_start
}

cmd_logs() {
    if ! is_exists; then
        warn "容器 ${CONTAINER_NAME} 不存在，跳过"
        return 0
    fi
    docker logs -f --tail 100 "${CONTAINER_NAME}"
}

cmd_status() {
    if ! is_exists; then
        echo "容器 ${CONTAINER_NAME}: 未创建"
        return 0
    fi
    if is_running; then
        echo "容器 ${CONTAINER_NAME}: 运行中 (http://localhost:${PORT})"
    else
        echo "容器 ${CONTAINER_NAME}: 已停止"
    fi
}

cmd_clean() {
    warn "清理构建缓存..."
    docker builder prune -f
    # 删除旧镜像（保留 latest）
    docker images "${IMAGE_NAME}" --format '{{.Repository}}:{{.Tag}}' | grep -v ":latest" | xargs -r docker rmi 2>/dev/null || true
    info "清理完成"
}

# ---------- 辅助函数 ----------
is_running() {
    docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

is_exists() {
    docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# ---------- 帮助信息 ----------
show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令说明:"
    echo "  (无参数)  - 重新构建并启动（等同于 restart）"
    echo "  build    - 构建 Docker 镜像"
    echo "  start    - 启动容器（需先 build）"
    echo "  stop     - 停止并移除容器"
    echo "  restart  - 重新构建并启动容器"
    echo "  logs     - 查看容器日志"
    echo "  status   - 查看容器状态"
    echo "  clean    - 清理构建缓存"
    echo ""
    echo "环境变量:"
    echo "  DEPLOY_PORT  - 映射端口（默认: 8080）"
    echo ""
    echo "示例:"
    echo "  $0              # 重新构建并启动"
    echo "  DEPLOY_PORT=3000 $0  # 使用 3000 端口"
    echo "  $0 logs         # 查看日志"
}

# ---------- 入口 ----------
case "${1:-}" in
    build)   cmd_build   ;;
    start)   cmd_start   ;;
    stop)    cmd_stop    ;;
    restart) cmd_restart ;;
    logs)    cmd_logs    ;;
    status)  cmd_status  ;;
    clean)   cmd_clean   ;;
    -h|--help|help) show_help ;;
    "")      info "未指定命令，执行 restart（重新构建并启动）"; echo ""; cmd_restart ;;
    *)       error "未知命令: $1"; echo ""; show_help; exit 1 ;;
esac
