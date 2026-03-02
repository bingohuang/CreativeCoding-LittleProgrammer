#!/bin/bash

# 小小程序员逻辑思维训练器 - Docker 容器日志查看脚本

# 配置
CONTAINER_NAME="little-programmer"

# 解析参数
FOLLOW=false
LINES=100

show_usage() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -f, --follow     实时跟踪日志输出"
    echo "  -n, --lines N    显示最后 N 行日志 (默认: 100)"
    echo "  -h, --help       显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0               显示最后 100 行日志"
    echo "  $0 -f            实时跟踪日志"
    echo "  $0 -n 50         显示最后 50 行日志"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
done

echo "=========================================="
echo "🐳 Docker 容器日志"
echo "=========================================="
echo "📛 容器: ${CONTAINER_NAME}"

# 检查容器是否存在
if ! docker ps -a | grep -q "${CONTAINER_NAME}"; then
    echo "❌ 错误：容器 ${CONTAINER_NAME} 不存在"
    exit 1
fi

# 检查容器是否正在运行
if docker ps | grep -q "${CONTAINER_NAME}"; then
    echo "🟢 状态: 运行中"
else
    echo "🔴 状态: 已停止"
fi

echo "=========================================="
echo ""

# 显示日志
if [ "$FOLLOW" = true ]; then
    echo "📋 实时跟踪日志 (按 Ctrl+C 退出)..."
    echo ""
    docker logs -f --tail="${LINES}" "${CONTAINER_NAME}"
else
    echo "📋 显示最后 ${LINES} 行日志:"
    echo ""
    docker logs --tail="${LINES}" "${CONTAINER_NAME}"
fi
