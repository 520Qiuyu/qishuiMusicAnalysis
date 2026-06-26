# 汽水音乐解析服务端

基于 Koa 的本地/服务端 API，用于代理汽水音乐 `track/v2` 接口，供前端获取完整版音频信息。

## 环境要求

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

---

## 一、本地构建并推送到 Docker Hub

在开发机上完成镜像构建与推送，服务器只需拉取运行。

### 1. 登录 Docker Hub

```bash
docker login
```

### 2. 构建镜像

```bash
docker compose -f docker-compose.build.yml build
```

也可额外打版本标签（推荐同时推送 `latest` 和版本号）：

```bash
docker compose -f docker-compose.build.yml build
docker tag qiuyu6543/qishui-music-analysis-server:latest qiuyu6543/qishui-music-analysis-server:0.1.0
```

### 3. 推送到 Docker Hub

```bash
docker push qiuyu6543/qishui-music-analysis-server:latest
# 若打了版本标签，一并推送
docker push qiuyu6543/qishui-music-analysis-server:0.1.0
```

代码更新后重复 **构建 → 推送** 即可。

---

## 二、服务器一键部署（拉取镜像）

服务器上只需 `docker-compose.yml` 和 `.env`，**不需要**源码和 Dockerfile。

### 1. 上传部署文件

将以下文件放到服务器同一目录（如 `/opt/qishui-server/`）：

```
docker-compose.yml
.env
```

### 2. 配置 `.env`

```bash
cp .env.example .env
```

编辑 `.env`：

| 变量 | 说明 |
| --- | --- |
| `PORT` | 服务监听端口，默认 `6623` |
| `DEVICE_ID` | 设备 ID |
| `COOKIE` | 请求 Cookie |
| `X_HELIOS` | 请求头 `x-helios` |
| `X_MEDUSA` | 请求头 `x-medusa` |

### 3. 拉取并启动

```bash
docker compose pull
docker compose up -d
```

### 4. 验证服务

```bash
curl http://localhost:6623/health
```

预期返回：

```json
{ "ok": true }
```

### 5. 更新镜像

开发机推送新版本后，在服务器执行：

```bash
docker compose pull
docker compose up -d
```

---

## 常用命令

```bash
# 查看运行状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启（如仅更新了 .env 凭证）
docker compose restart
```

---

## API 说明

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/health` | 健康检查 |
| `POST` | `/api/track/v2` | 获取完整版音频信息 |

### POST /api/track/v2

请求体示例：

```json
{
  "track_id": "7497192086862071809"
}
```

成功响应示例：

```json
{
  "ok": true,
  "data": {
    "url": "...",
    "playAuth": "...",
    "playAuthID": "...",
    "title": "...",
    "artist": "..."
  }
}
```

---

## 本地开发（非 Docker）

```bash
pnpm install
cp .env.example .env
# 编辑 .env
pnpm dev
```

开发时前端 Vite 会将 `/api` 代理到 `http://localhost:6623`（见项目根目录 `vite.config.ts`）。

---

## 生产环境前端对接

前端生产环境需将 API 地址指向本服务，例如：

```
http://你的服务器IP:6623/api
```

可在前端构建时通过 `npm run build` 自动切换为 `/qishuiParse`（见 `src/services/server.ts`）。

---

## 故障排查

**拉取镜像失败 `not found`（如 `docker.1ms.run`、`docker.ketches.cn`）**

国内第三方 **镜像加速器通常只缓存热门公共镜像**，不会同步个人仓库（如 `qiuyu6543/qishui-music-analysis-server`），因此会报 `not found` 或 `502`。

**推荐做法：去掉加速器，直连 Docker Hub 拉取**

```bash
cat /etc/docker/daemon.json
sudo nano /etc/docker/daemon.json
```

删除 `registry-mirrors` 整段（或设为 `[]`），保留其他配置即可，例如：

```json
{
  "registry-mirrors": []
}
```

然后：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
docker login          # 可选，公开镜像不登录也能拉
docker compose pull
docker compose up -d
```

**备选：开发机导出镜像，服务器离线导入**（加速器/网络都不稳定时）

开发机：

```bash
docker save qiuyu6543/qishui-music-analysis-server:latest -o qishui-server.tar
scp qishui-server.tar root@你的服务器IP:/app/qishuiMusicAnalysis/server/
```

服务器：

```bash
docker load -i qishui-server.tar
docker compose up -d
```

**拉取镜像失败 `pull access denied`**

- 确认 Docker Hub 仓库 `qiuyu6543/qishui-music-analysis-server` 存在且已推送
- 私有仓库需先执行 `docker login`

**容器启动后立即退出**

```bash
docker compose logs
```

常见原因：`.env` 不存在或格式错误。

**端口被占用**

修改 `.env` 中的 `PORT`，然后执行：

```bash
docker compose down
docker compose up -d
```

**凭证失效导致接口 500**

汽水音乐的 `COOKIE`、`X_HELIOS`、`X_MEDUSA` 会过期，需重新抓包更新 `.env` 后重启：

```bash
docker compose restart
```

**健康检查失败**

确认 `PORT` 与端口映射一致，并查看日志：

```bash
docker compose logs -f qishui-server
```
