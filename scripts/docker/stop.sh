#!/bin/bash

# 小小程序员逻辑思维训练器 - Docker 容器停止脚本

set -e

# 配置
CONTAINER_NAME="little-programmer"

echo "=========================================="
echo "🐳 Docker 容器停止"
echo "=========================================="
echo "📛 容器: ${CONTAINER_NAME}"
echo "=========================================="

# 检查容器是否存在
echo ""
echo "🔍 检查容器状态..."

if ! docker ps -a | grep -q "${CONTAINER_NAME}"; then
    echo "⚠️  容器 ${CONTAINER_NAME} 不存在"
    exit 0
fi

# 检查容器是否正在运行
if docker ps | grep -q "${CONTAINER_NAME}"; then
    echo "🛑 停止运行中的容器..."
    docker stop "${CONTAINER_NAME}"
    echo "✅ 容器已停止"
else
    echo "ℹ️  容器已经处于停止状态"
fi

# 询问是否删除容器
echo ""
read -p "是否删除容器? (y/n): " answer
if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "🗑️  删除容器..."
    docker rm "${CONTAINER_NAME}"
    echo "✅ 容器已删除"
else
    echo "ℹ️  保留容器（可使用 ./start.sh 重新启动）"
fi

echo ""
echo "📋 完成！"
