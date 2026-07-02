# 汽水音乐解析服务端

基于 Koa 的 API 服务，用于代理汽水音乐 `track/v2` 接口，供前端获取完整版音频信息。本项目与仓库根目录的前端（Vite + React + Ant Design）配合使用，实现「粘贴分享链接 → 解析歌曲 → 试听 / 下载」的完整流程。

## 项目简介

**汽水音乐解析下载工具** 支持识别汽水音乐分享链接，解析歌曲名称、歌手、封面与播放地址，并提供下载与历史记录管理。前端负责页面交互与资源下载，本服务负责携带设备凭证请求汽水音乐接口，返回可播放的完整版音频信息。

典型使用流程：

1. 在汽水音乐 App 中复制歌曲或歌单分享链接
2. 打开前端页面，粘贴链接并点击解析
3. 前端调用本服务 `POST /api/track/v2` 获取完整版音频
4. 在页面上试听或下载音乐文件

---

## 快速启动

### 方式一：本地开发（推荐调试）

**1. 启动服务端**

```bash
cd server
pnpm install
cp .env.example .env
# 编辑 .env，填入 DEVICE_ID、COOKIE、X_HELIOS、X_MEDUSA 等凭证
pnpm dev
```

服务默认监听 `http://localhost:6623`，可用以下命令验证：

```bash
curl http://localhost:6623/health
```

**2. 启动前端**

在项目根目录另开终端：

```bash
pnpm install
pnpm dev
```

开发时 Vite 会将 `/api` 代理到 `http://localhost:6623`（见根目录 `vite.config.ts`），前后端联调无需额外配置。

### 方式二：Docker 一键部署

适合在服务器上长期运行，无需安装 Node 环境。

```bash
cd server
cp .env.example .env
# 编辑 .env
docker compose pull
docker compose up -d
```

验证：

```bash
curl http://localhost:6623/health
```

### 方式三：仅运行前端（使用线上 API）

若已有部署好的服务端，可直接构建前端单页应用：

```bash
# 项目根目录
pnpm install
pnpm build
```

构建产物为 `dist/index.html`（单文件 HTML，便于分发）。生产环境 API 地址见 `src/services/server.ts`。

---

## 环境要求

| 场景 | 要求 |
| --- | --- |
| 本地开发 | Node.js 18+、pnpm |
| Docker 部署 | Docker 20.10+、Docker Compose v2+ |

### `.env` 配置说明

| 变量 | 说明 |
| --- | --- |
| `PORT` | 服务监听端口，默认 `6623` |
| `DEVICE_ID` | 设备 ID |
| `COOKIE` | 请求 Cookie |
| `X_HELIOS` | 请求头 `x-helios` |
| `X_MEDUSA` | 请求头 `x-medusa` |

### 环境变量数据来源

上述凭证均来自**汽水音乐电脑版**的真实请求，需通过抓包工具获取后填入 `.env`。

**推荐工具：[Reqable](https://reqable.com/zh-CN/)（小黄鸟）**

Reqable 由原 HttpCanary（小黄鸟）团队打造，支持 Windows / macOS / Linux 全平台 HTTPS 抓包，适合抓取汽水音乐 PC 客户端的请求头与 Cookie。

**抓包步骤：**

1. 下载并安装 [Reqable 官网](https://reqable.com/zh-CN/) 对应系统版本，按提示安装并信任根证书
2. 启动 Reqable，开启系统代理 / 抓包调试
3. 打开**汽水音乐电脑版**，随便播放或打开一首歌曲（触发接口请求即可）
4. 在 Reqable 中找到发往 `api.qishui.com` 的 `POST /luna/pc/track_v2` 请求
5. 从该请求中提取以下字段，填入 `server/.env`：

| `.env` 变量 | 抓包位置 |
| --- | --- |
| `DEVICE_ID` | URL 查询参数中的 `device_id` 或 `fp` |
| `COOKIE` | 请求头 `Cookie` 完整内容 |
| `X_HELIOS` | 请求头 `x-helios` |
| `X_MEDUSA` | 请求头 `x-medusa` |

凭证会过期，接口异常时请重新抓包更新 `.env` 后重启服务。

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

## Docker 构建与发布

在开发机上完成镜像构建与推送，服务器只需拉取运行。

### 1. 登录 Docker Hub

```bash
docker login
```

### 2. 构建镜像

```bash
docker compose -f docker-compose.build.yml build
```

也可额外打版本标签：

```bash
docker tag qiuyu6543/qishui-music-analysis-server:latest qiuyu6543/qishui-music-analysis-server:0.1.0
```

### 3. 推送到 Docker Hub

```bash
docker push qiuyu6543/qishui-music-analysis-server:latest
docker push qiuyu6543/qishui-music-analysis-server:0.1.0
```

### 4. 服务器更新镜像

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

## 生产环境前端对接

前端生产环境需将 API 地址指向本服务，例如：

```
http://你的服务器IP:6623/api
```

可在前端构建时通过环境或 `src/services/server.ts` 切换 API 基址。

---

## 故障排查

**拉取镜像失败 `not found`**

国内第三方镜像加速器通常不会同步个人仓库，建议去掉加速器后直连 Docker Hub：

```bash
sudo nano /etc/docker/daemon.json
```

将 `registry-mirrors` 设为 `[]`，然后：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
docker compose pull
docker compose up -d
```

**备选：离线导入镜像**

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

**容器启动后立即退出**

```bash
docker compose logs
```

常见原因：`.env` 不存在或格式错误。

**端口被占用**

修改 `.env` 中的 `PORT`，然后执行 `docker compose down && docker compose up -d`。

**凭证失效导致接口 500**

更新 `.env` 后执行 `docker compose restart`。

---

## 支持作者

如果这个项目对你有帮助，欢迎扫码捐赠，你的支持是我持续维护的动力 🙏 由于是使用本人的汽水账号，可能会有vip失效的情况，还望有实力的小伙伴可以赞助一下，万分感激。

<table>
  <tr>
    <td align="center">
      <img src="../assets/微信收款码.jpg" alt="微信收款码" width="240" />
      <br />
      <b>微信支付</b>
    </td>
    <td align="center">
      <img src="../assets/支付宝收款码.jpg" alt="支付宝收款码" width="240" />
      <br />
      <b>支付宝</b>
    </td>
  </tr>
</table>

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=520Qiuyu/qishuiMusicAnalysis&type=Date)](https://star-history.com/#520Qiuyu/qishuiMusicAnalysis&Date)
