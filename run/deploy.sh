#!/bin/bash

# 幸运转盘 - Docker 部署脚本

set -e

IMAGE_NAME="my-lucky-wheel"
IMAGE_TAG="latest"
CONTAINER_NAME="lucky-wheel"
PORT="8080"

# 获取项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# 1. 删除旧容器
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# 2. 构建新的镜像
docker build --load -t ${IMAGE_NAME}:${IMAGE_TAG} .

# 3. 启动新的容器
docker run -d -p ${PORT}:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}:${IMAGE_TAG}

echo "部署成功！访问地址: http://localhost:${PORT}"
