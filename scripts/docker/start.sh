#!/bin/bash

# 小小程序员逻辑思维训练器 - Docker 容器启动脚本
# 支持多架构镜像 (amd64/arm64)

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# 读取版本号
VERSION_FILE="${PROJECT_ROOT}/VERSION"
if [ -f "$VERSION_FILE" ]; then
    VERSION=$(cat "$VERSION_FILE" | tr -d '[:space:]')
else
    echo "❌ 错误：找不到 VERSION 文件"
    exit 1
fi

# 配置
IMAGE_NAME="xbingo/little-programmer"
FULL_IMAGE_NAME="${IMAGE_NAME}:${VERSION}"
CONTAINER_NAME="little-programmer"
HOST_PORT="2026"
CONTAINER_PORT="2026"

echo "=========================================="
echo "🐳 Docker 容器启动"
echo "=========================================="
echo "📦 项目: 小小程序员逻辑思维训练器"
echo "🏷️  版本: ${VERSION}"
echo "🖼️  镜像: ${FULL_IMAGE_NAME}"
echo "📛 容器: ${CONTAINER_NAME}"
echo "🌐 端口: ${HOST_PORT}:${CONTAINER_PORT}"
echo "=========================================="

# 检查容器是否已在运行
echo ""
echo "🔍 检查容器状态..."
if docker ps | grep -q "${CONTAINER_NAME}"; then
    echo "⚠️  容器 ${CONTAINER_NAME} 已在运行"
    echo ""
    echo "🌐 访问地址: http://localhost:${HOST_PORT}"
    echo ""
    echo "📋 查看日志: ./scripts/docker/logs.sh"
    echo "🛑 停止容器: ./scripts/docker/stop.sh"
    exit 0
fi

# 检查容器是否存在但已停止
if docker ps -a | grep -q "${CONTAINER_NAME}"; then
    echo "🔄 容器已存在但已停止，删除旧容器..."
    docker rm "${CONTAINER_NAME}" > /dev/null 2>&1
fi

# 检查本地镜像是否存在
if ! docker images | grep -q "${IMAGE_NAME}.*${VERSION}"; then
    echo "⚠️  本地镜像 ${FULL_IMAGE_NAME} 不存在"
    echo ""
    
    # 检查是否是交互式终端
    if [ -t 0 ]; then
        read -p "是否从 Docker Hub 拉取镜像? (y/n): " answer
        if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
            PULL_IMAGE=true
        else
            PULL_IMAGE=false
        fi
    else
        echo "ℹ️  非交互式终端，自动从 Docker Hub 拉取镜像..."
        PULL_IMAGE=true
    fi
    
    if [ "$PULL_IMAGE" = "true" ]; then
        echo ""
        echo "📥 从 Docker Hub 拉取镜像..."
        echo "   Docker 会自动选择与当前系统匹配的架构 (amd64/arm64)"
        docker pull "${FULL_IMAGE_NAME}"
        
        if [ $? -ne 0 ]; then
            echo "❌ 拉取镜像失败"
            echo ""
            # 检查是否是交互式终端
            if [ -t 0 ]; then
                read -p "是否尝试构建本地镜像? (y/n): " build_answer
                if [ "$build_answer" = "y" ] || [ "$build_answer" = "Y" ]; then
                    BUILD_LOCAL=true
                else
                    BUILD_LOCAL=false
                fi
            else
                echo "ℹ️  非交互式终端，自动尝试构建本地镜像..."
                BUILD_LOCAL=true
            fi
            
            if [ "$BUILD_LOCAL" = "true" ]; then
                "${SCRIPT_DIR}/build.sh"
            else
                exit 1
            fi
        fi
    else
        echo "🔨 尝试构建本地镜像..."
        "${SCRIPT_DIR}/build.sh"
    fi
fi

# 显示镜像架构信息
echo ""
echo "🔍 镜像信息:"
docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}" | grep "${IMAGE_NAME}" | grep "${VERSION}" || true

# 尝试获取镜像架构
IMAGE_INSPECT=$(docker inspect "${FULL_IMAGE_NAME}" 2>/dev/null || echo "")
if [ -n "$IMAGE_INSPECT" ]; then
    ARCH=$(echo "$IMAGE_INSPECT" | grep -o '"Architecture": "[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$ARCH" ]; then
        echo "   架构: ${ARCH}"
    fi
fi

# 启动容器
echo ""
echo "🚀 启动容器..."
docker run -d \
    --name "${CONTAINER_NAME}" \
    -p "${HOST_PORT}:${CONTAINER_PORT}" \
    --restart unless-stopped \
    "${FULL_IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 容器启动成功！"
    echo ""
    echo "🌐 访问地址: http://localhost:${HOST_PORT}"
    echo ""
    echo "📋 常用命令:"
    echo "   查看日志: ./scripts/docker/logs.sh"
    echo "   停止容器: ./scripts/docker/stop.sh"
    echo "   进入容器: docker exec -it ${CONTAINER_NAME} /bin/sh"
    echo ""
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 2
    
    # 检查健康状态
    if curl -s "http://localhost:${HOST_PORT}" > /dev/null 2>&1; then
        echo "✅ 服务健康检查通过！"
    else
        echo "⏳ 服务启动中，请稍后访问..."
    fi
else
    echo ""
    echo "❌ 容器启动失败"
    exit 1
fi
