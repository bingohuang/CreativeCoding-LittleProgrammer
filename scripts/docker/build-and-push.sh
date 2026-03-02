#!/bin/bash

# 小小程序员逻辑思维训练器 - Docker 多架构镜像构建并推送脚本
# 镜像名: xbingo/little-programmer
# 支持架构: linux/amd64 (x86_64), linux/arm64 (ARM64)

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

# 支持的架构
PLATFORMS="linux/amd64,linux/arm64"

echo "=========================================="
echo "🐳 Docker 多架构镜像构建并推送"
echo "=========================================="
echo "📦 项目: 小小程序员逻辑思维训练器"
echo "🏷️  版本: ${VERSION}"
echo "🖥️  架构: ${PLATFORMS}"
echo "🖼️  镜像: ${FULL_IMAGE_NAME}"
echo "=========================================="

# 检查 dist 目录是否存在
if [ ! -d "${PROJECT_ROOT}/dist" ]; then
    echo "⚠️  dist 目录不存在，先执行构建..."
    cd "${PROJECT_ROOT}"
    npm install
    npm run build
fi

# 检查 dist/index.html 是否存在
if [ ! -f "${PROJECT_ROOT}/dist/index.html" ]; then
    echo "❌ 错误：dist/index.html 不存在，请确保前端构建成功"
    exit 1
fi

# 检查 docker buildx 是否可用
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ 错误：docker buildx 不可用，请安装 Docker Desktop 或启用 buildx 插件"
    exit 1
fi

# 检查是否已登录 Docker Hub
echo ""
echo "🔑 检查 Docker Hub 登录状态..."
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo "⚠️  未检测到 Docker Hub 登录状态"
    echo ""
    echo "请先登录 Docker Hub:"
    echo "   docker login"
    echo ""
    read -p "是否现在登录? (y/n): " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        docker login
    else
        echo "❌ 取消操作"
        exit 1
    fi
fi

# 检查/创建 buildx builder
BUILDER_NAME="little-programmer-builder"
if ! docker buildx ls | grep -q "${BUILDER_NAME}"; then
    echo ""
    echo "🔧 创建 buildx builder: ${BUILDER_NAME}"
    docker buildx create --name "${BUILDER_NAME}" --driver docker-container --bootstrap
fi

# 使用指定的 builder
docker buildx use "${BUILDER_NAME}"

# 构建并推送多架构镜像
echo ""
echo "🔨 开始构建并推送多架构镜像..."
echo "   平台: ${PLATFORMS}"
echo "   镜像: ${FULL_IMAGE_NAME}"
echo "   镜像: ${LATEST_IMAGE_NAME}"
echo ""

cd "${PROJECT_ROOT}"
docker buildx build \
    --platform "${PLATFORMS}" \
    --tag "${FULL_IMAGE_NAME}" \
    --tag "${LATEST_IMAGE_NAME}" \
    --push \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 多架构镜像构建并推送成功！"
    echo ""
    echo "📋 Docker Hub 地址:"
    echo "   https://hub.docker.com/r/${IMAGE_NAME}"
    echo ""
    echo "🖥️  支持的架构:"
    echo "   - linux/amd64 (x86_64)"
    echo "   - linux/arm64 (ARM64/Apple Silicon)"
    echo ""
    echo "🚀 拉取镜像:"
    echo "   docker pull ${FULL_IMAGE_NAME}"
    echo "   docker pull ${LATEST_IMAGE_NAME}"
    echo ""
    echo "▶️  启动容器:"
    echo "   ./scripts/docker/start.sh"
else
    echo ""
    echo "❌ 镜像构建或推送失败"
    exit 1
fi
