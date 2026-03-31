#!/bin/bash

# 幸运转盘 - Docker 部署脚本

set -e

IMAGE_NAME="my-lucky-wheel"
IMAGE_TAG="latest"
CONTAINER_NAME="lucky-wheel"
PORT="8080"

# 获取脚本所在目录和项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Dockerfile 所在目录（与部署脚本同目录）
DOCKERFILE_DIR="${SCRIPT_DIR}"

# 1. 删除旧容器
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# 2. 构建新的镜像（使用 run 目录下的 Dockerfile，以项目根目录为构建上下文）
docker build --load -f ${DOCKERFILE_DIR}/Dockerfile -t ${IMAGE_NAME}:${IMAGE_TAG} ${PROJECT_DIR}

# 3. 启动新的容器
docker run -d -p ${PORT}:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}:${IMAGE_TAG}

echo "部署成功！访问地址: http://localhost:${PORT}"
