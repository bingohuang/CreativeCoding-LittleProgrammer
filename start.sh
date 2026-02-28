#!/bin/bash

# 小小程序员逻辑思维训练器 - 启动脚本
# 端口: 2017

echo "=========================================="
echo "🚀 小小程序员逻辑思维训练器"
echo "=========================================="

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到Python3"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
pip3 install -q -r requirements.txt

# 构建前端
echo "🔨 构建前端..."
npm install 2>&1 > /dev/null
npm run build 2>&1

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "✅ 前端构建完成"
echo ""
echo "🌐 启动服务器..."
echo "   地址: http://localhost:2017"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "=========================================="

# 启动服务器
python3 server.py
