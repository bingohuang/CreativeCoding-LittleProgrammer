# 小小程序员逻辑思维训练器 - Docker 镜像
# 使用 Nginx 作为静态文件服务器

FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 复制静态文件到 Nginx 目录
COPY dist/index.html /usr/share/nginx/html/

# 复制自定义 Nginx 配置
RUN echo 'server { \
    listen 2026; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { \
        root /usr/share/nginx/html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 2026

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:2026/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
