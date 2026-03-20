#!/bin/bash

# 幸运转盘 - Docker 部署脚本
# 功能：停止旧容器 -> 重新构建镜像 -> 启动新容器

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
IMAGE_NAME="my-lucky-wheel"
IMAGE_TAG="latest"
CONTAINER_NAME="lucky-wheel"
PORT="8080"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  幸运转盘 - Docker 自动部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 获取脚本所在目录的上一级目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
echo -e "${GREEN}项目目录: ${PROJECT_DIR}${NC}"

# 切换到项目根目录
cd "$PROJECT_DIR"

# 1. 停止并删除旧容器
echo ""
echo -e "${YELLOW}[步骤 1/4] 停止并删除旧容器...${NC}"

if [ "$(docker ps -q -f name=${CONTAINER_NAME})" ]; then
    echo -e "${YELLOW}  正在停止容器 ${CONTAINER_NAME}...${NC}"
    docker stop ${CONTAINER_NAME}
    echo -e "${GREEN}  ✓ 容器已停止${NC}"
else
    echo -e "${BLUE}  未发现运行中的容器${NC}"
fi

if [ "$(docker ps -aq -f name=${CONTAINER_NAME})" ]; then
    echo -e "${YELLOW}  正在删除容器 ${CONTAINER_NAME}...${NC}"
    docker rm ${CONTAINER_NAME}
    echo -e "${GREEN}  ✓ 容器已删除${NC}"
fi

# 2. 删除旧镜像（可选）
echo ""
echo -e "${YELLOW}[步骤 2/4] 检查旧镜像...${NC}"

if [ "$(docker images -q ${IMAGE_NAME}:${IMAGE_TAG})" ]; then
    read -p "  是否删除旧镜像 ${IMAGE_NAME}:${IMAGE_TAG}? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}  正在删除旧镜像...${NC}"
        docker rmi ${IMAGE_NAME}:${IMAGE_TAG}
        echo -e "${GREEN}  ✓ 旧镜像已删除${NC}"
    else
        echo -e "${BLUE}  跳过删除旧镜像${NC}"
    fi
else
    echo -e "${BLUE}  未发现旧镜像${NC}"
fi

# 3. 构建新镜像
echo ""
echo -e "${YELLOW}[步骤 3/4] 构建 Docker 镜像...${NC}"
echo -e "${BLUE}  构建命令: docker build --load -t ${IMAGE_NAME}:${IMAGE_TAG} .${NC}"
echo ""

docker build --load -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ 镜像构建成功！${NC}"
else
    echo ""
    echo -e "${RED}✗ 镜像构建失败！${NC}"
    exit 1
fi

# 4. 启动新容器
echo ""
echo -e "${YELLOW}[步骤 4/4] 启动新容器...${NC}"
echo -e "${BLUE}  启动命令: docker run -d -p ${PORT}:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}:${IMAGE_TAG}${NC}"
echo ""

docker run -d -p ${PORT}:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}:${IMAGE_TAG}

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ 部署成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}访问地址: http://localhost:${PORT}${NC}"
    echo ""
    echo -e "${YELLOW}常用命令:${NC}"
    echo -e "  查看日志: docker logs ${CONTAINER_NAME}"
    echo -e "  停止容器: docker stop ${CONTAINER_NAME}"
    echo -e "  启动容器: docker start ${CONTAINER_NAME}"
    echo -e "  重启容器: docker restart ${CONTAINER_NAME}"
    echo ""
    echo -e "${BLUE}容器状态:${NC}"
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ 容器启动失败！${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}使用以下命令查看错误信息:${NC}"
    echo -e "  docker logs ${CONTAINER_NAME}"
    exit 1
fi
