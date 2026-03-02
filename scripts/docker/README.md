# Docker 部署脚本

本目录包含小小程序员逻辑思维训练器的 Docker 部署脚本。

## 文件说明

| 脚本 | 功能 | 用法 |
|-----|------|------|
| `build-and-push.sh` | 构建并推送多架构镜像 | `./build-and-push.sh` |
| `build.sh` | 构建多架构镜像（仅本地） | `./build.sh` |
| `push.sh` | 推送单架构镜像 | `./push.sh` |
| `start.sh` | 启动 Docker 容器 | `./start.sh` |
| `stop.sh` | 停止 Docker 容器 | `./stop.sh` |
| `logs.sh` | 查看容器日志 | `./logs.sh [选项]` |

## 多架构支持

镜像同时支持以下架构：

| 架构 | 说明 | 适用平台 |
|-----|------|---------|
| `linux/amd64` | x86_64 | Intel/AMD 处理器 |
| `linux/arm64` | ARM64 | Apple Silicon (M1/M2/M3), ARM 服务器 |

Docker 会根据宿主机架构自动选择合适的镜像。

## 快速开始

### 1. 构建并推送多架构镜像（推荐）

```bash
./scripts/docker/build-and-push.sh
```

此命令会：
1. 构建支持 `amd64` 和 `arm64` 的镜像
2. 推送到 Docker Hub

### 2. 从 Docker Hub 拉取并运行

```bash
# 拉取镜像（自动选择当前架构）
docker pull xbingo/little-programmer:1.0.4

# 启动容器
./scripts/docker/start.sh
```

容器启动后，访问 http://localhost:2026

### 3. 查看日志

```bash
# 显示最后 100 行日志
./scripts/docker/logs.sh

# 实时跟踪日志
./scripts/docker/logs.sh -f

# 显示最后 50 行日志
./scripts/docker/logs.sh -n 50
```

### 4. 停止容器

```bash
./scripts/docker/stop.sh
```

## 本地开发

### 仅构建本地镜像

```bash
./scripts/docker/build.sh
```

### 构建单架构并推送

```bash
# 构建本地镜像
./scripts/docker/build.sh

# 推送（仅当前架构）
./scripts/docker/push.sh
```

## 镜像信息

- **镜像名**: `xbingo/little-programmer`
- **版本**: 从 `VERSION` 文件读取
- **容器名**: `little-programmer`
- **端口**: `2026:2026`

## 版本管理

项目版本号存储在项目根目录的 `VERSION` 文件中，格式为 `x.x.x`。

修改 VERSION 文件后，重新执行构建脚本即可生成新版本的镜像。

## 注意事项

1. **多架构构建需要 Docker Desktop 或启用 buildx 插件**
2. **推送镜像前需要先登录 Docker Hub**: `docker login`
3. **首次构建可能需要下载基础镜像**，请确保网络连接正常
