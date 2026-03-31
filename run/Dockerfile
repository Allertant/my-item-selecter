FROM nginx:latest

# 复制静态文件到 nginx 的默认目录
COPY src/index.html /usr/share/nginx/html/index.html
COPY src/styles.css /usr/share/nginx/html/styles.css
COPY src/script.js /usr/share/nginx/html/script.js

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
