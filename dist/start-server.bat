@echo off
chcp 65001 >nul
echo ============================================
echo 🎮 小小程序员逻辑思维训练器
echo ============================================
echo.
echo 正在启动本地服务器...
echo.

python start-server.py

if errorlevel 1 (
    echo.
    echo 错误: 无法启动服务器，请确保已安装 Python
    echo 下载地址: https://www.python.org/downloads/
    pause
)
