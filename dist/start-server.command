#!/bin/bash
# 小小程序员逻辑思维训练器 - macOS/Linux 启动脚本

cd "$(dirname "$0")"

echo "============================================"
echo "🎮 小小程序员逻辑思维训练器"
echo "============================================"
echo ""

if command -v python3 &> /dev/null; then
    python3 start-server.py
elif command -v python &> /dev/null; then
    python start-server.py
else
    echo "错误: 未找到 Python，请先安装 Python"
    echo "下载地址: https://www.python.org/downloads/"
    read -p "按回车键退出..."
fi
