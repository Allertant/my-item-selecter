# ==================== 构建阶段 ====================
FROM docker.io/library/node:20-alpine AS build

WORKDIR /app

# 先复制依赖文件，利用 Docker 缓存层
COPY package.json package-lock.json ./

# 配置 npm 国内镜像源
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖（ci 保证版本一致性）
RUN npm ci

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 验证构建产物
RUN test -d dist && echo "构建成功，产物大小：" && du -sh dist

# ==================== 运行阶段 ====================
FROM nginx:alpine

# 移除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 nginx 配置
COPY --from=build /app/run/nginx.conf /etc/nginx/conf.d/default.conf


# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
