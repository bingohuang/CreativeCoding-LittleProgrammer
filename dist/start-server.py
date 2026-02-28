#!/usr/bin/env python3
"""
小小程序员逻辑思维训练器 - 本地服务器启动脚本
双击运行或在终端执行: python start-server.py
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 2026

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)
    
    def log_message(self, format, *args):
        # 简化日志输出
        print(f"[服务器] {self.address_string()} - {format % args}")

def find_available_port(start_port):
    """查找可用端口"""
    for port in range(start_port, start_port + 100):
        try:
            with socketserver.TCPServer(("", port), None) as s:
                return port
        except OSError:
            continue
    return start_port

if __name__ == "__main__":
    port = find_available_port(PORT)
    
    print("=" * 50)
    print("🎮 小小程序员逻辑思维训练器")
    print("=" * 50)
    print(f"\n启动本地服务器中...")
    print(f"端口: {port}")
    print(f"\n请访问: http://localhost:{port}")
    print(f"       http://127.0.0.1:{port}")
    print("\n按 Ctrl+C 停止服务器")
    print("=" * 50)
    
    with socketserver.TCPServer(("", port), Handler) as httpd:
        # 自动打开浏览器
        webbrowser.open(f"http://localhost:{port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n服务器已停止")
