#!/bin/bash

# 小小程序员逻辑思维训练器 - Docker 镜像推送脚本
# 推送镜像到 Docker Hub
# ⚠️ 注意：对于多架构镜像，请使用 build-and-push.sh 脚本

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

# 镜像信息
IMAGE_NAME="xbingo/little-programmer"
FULL_IMAGE_NAME="${IMAGE_NAME}:${VERSION}"
LATEST_IMAGE_NAME="${IMAGE_NAME}:latest"

echo "=========================================="
echo "🐳 Docker 镜像推送"
echo "=========================================="
echo "📦 项目: 小小程序员逻辑思维训练器"
echo "🏷️  版本: ${VERSION}"
echo "🖼️  镜像: ${FULL_IMAGE_NAME}"
echo "=========================================="

# 提示用户使用 build-and-push.sh 构建多架构镜像
echo ""
echo "💡 提示：要构建并推送多架构镜像 (amd64 + arm64)，请使用:"
echo "   ./scripts/docker/build-and-push.sh"
echo ""
# 检查是否是交互式终端
if [ -t 0 ]; then
    read -p "是否继续推送当前本地镜像? (y/n): " continue_push
    if [ "$continue_push" != "y" ] && [ "$continue_push" != "Y" ]; then
        echo "❌ 取消推送"
        exit 0
    fi
else
    echo "ℹ️  非交互式终端，继续推送当前本地镜像..."
fi

# 检查镜像是否存在
echo ""
echo "🔍 检查本地镜像..."
if ! docker images | grep -q "${IMAGE_NAME}"; then
    echo "❌ 错误：本地镜像 ${IMAGE_NAME} 不存在"
    echo "请先执行构建脚本: ./scripts/docker/build.sh"
    exit 1
fi

# 检查是否已登录 Docker Hub
echo ""
echo "🔑 检查 Docker Hub 登录状态..."
# 使用 docker info 检查是否配置了凭证存储
if ! docker info 2>/dev/null | grep -E "(Username|Registry|docker.io)" > /dev/null; then
    # 尝试获取当前用户来验证登录状态
    DOCKER_USER=$(docker info 2>/dev/null | grep -i "username" | awk '{print $2}')
    if [ -z "$DOCKER_USER" ]; then
        echo "⚠️  未检测到 Docker Hub 登录状态"
        echo ""
        echo "请先登录 Docker Hub:"
        echo "   docker login"
        echo ""
        # 检查是否是交互式终端
        if [ -t 0 ]; then
            read -p "是否现在登录? (y/n): " answer
            if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
                docker login
            else
                echo "❌ 取消推送"
                exit 1
            fi
        else
            echo "❌ 非交互式终端，请手动执行: docker login"
            exit 1
        fi
    fi
fi
echo "✅ 已登录 Docker Hub"

# 推送镜像
echo ""
echo "📤 推送镜像到 Docker Hub..."
echo "   推送: ${FULL_IMAGE_NAME}"
docker push "${FULL_IMAGE_NAME}"

echo ""
echo "   推送: ${LATEST_IMAGE_NAME}"
docker push "${LATEST_IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 镜像推送成功！"
    echo ""
    echo "📋 Docker Hub 地址:"
    echo "   https://hub.docker.com/r/${IMAGE_NAME}"
    echo ""
    echo "⚠️  注意：当前推送的是单架构镜像"
    echo "   要推送多架构镜像 (amd64 + arm64)，请使用:"
    echo "   ./scripts/docker/build-and-push.sh"
else
    echo ""
    echo "❌ 镜像推送失败"
    exit 1
fi
