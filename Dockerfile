FROM nginx:latest

# 复制静态文件到 nginx 的默认目录
COPY index.html /usr/share/nginx/html/index.html
COPY css/styles.css /usr/share/nginx/html/css/styles.css
COPY js/script.js /usr/share/nginx/html/js/script.js

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
