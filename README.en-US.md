# Qishui Music Analysis Server

[中文](./README.md) | **English**

A Koa-based API service used to proxy the Qishui Music `track/v2` interface, allowing the frontend to retrieve full-version audio information. This project is intended to be used in conjunction with the frontend (Vite + React + Ant Design) located in the repository root to implement the complete flow of "Paste share link → Parse song → Preview / Download".

## Project Introduction

**Qishui Music Analysis & Download Tool** supports identifying Qishui Music share links, parsing song titles, artists, covers, and playback addresses, and providing download and history management. The frontend handles page interaction and resource downloading, while this server is responsible for requesting the Qishui Music interface using device credentials and returning playable full-version audio information.

Typical usage flow:

1. Copy a song or playlist share link in the Qishui Music App.
2. Open the frontend page, paste the link, and click Parse.
3. The frontend calls the `POST /api/track/v2` endpoint of this service to obtain the full audio.
4. Preview or download the music file on the page.

---

## Quick Start

### Method 1: Local Development (Recommended for Debugging)

**1. Start the Server**

```bash
cd server
pnpm install
cp .env.example .env
# Edit .env to fill in DEVICE_ID, COOKIE, X_HELIOS, X_MEDUSA, etc.
pnpm dev
```

The service listens on `http://localhost:6623` by default. You can verify it with the following command:

```bash
curl http://localhost:6623/health
```

**2. Start the Frontend**

Open another terminal in the project root:

```bash
pnpm install
pnpm dev
```

During development, Vite proxies `/api` to `http://localhost:6623` (see `vite.config.ts` in the root directory), so no extra configuration is needed for frontend-backend integration.

### Method 2: One-Click Docker Deployment

Suitable for long-term operation on a server without requiring a Node environment.

```bash
cd server
cp .env.example .env
# Edit .env
docker compose pull
docker compose up -d
```

Verify:

```bash
curl http://localhost:6623/health
```

### Method 3: Run Frontend Only (Using Online API)

If you already have a deployed server, you can directly build the frontend Single Page Application (SPA):

```bash
# Project root
pnpm install
pnpm build
```

The build output is `dist/index.html` (a single-file HTML, easy to distribute). See `src/services/server.ts` for the production API address.

---

## Environment Requirements

| Scenario | Requirement |
| --- | --- |
| Local Development | Node.js 18+, pnpm |
| Docker Deployment | Docker 20.10+, Docker Compose v2+ |

### `.env` Configuration

| Variable | Description |
| --- | --- |
| `PORT` | Port the service listens on, default `6623` |
| `DEVICE_ID` | Device ID |
| `COOKIE` | Request Cookie |
| `X_HELIOS` | Request header `x-helios` |
| `X_MEDUSA` | Request header `x-medusa` |

### Source of Environment Variables

The credentials above are obtained from actual requests made by the **Qishui Music PC version**. They must be captured using a packet sniffing tool and filled into `.env`.

**Recommended Tool: [Reqable](https://reqable.com/zh-CN/)**

Created by the original HttpCanary team, Reqable supports HTTPS sniffing across Windows / macOS / Linux, making it suitable for capturing request headers and cookies from the Qishui Music PC client.

**Capture Steps:**

1. Download and install the corresponding system version from the [Reqable Official Site](https://reqable.com/zh-CN/), follow the prompts to install, and trust the root certificate.
2. Launch Reqable and enable system proxy / capture debugging.
3. Open the **Qishui Music PC client** and play or open any song (to trigger the API request).
4. In Reqable, find the `POST /luna/pc/track_v2` request sent to `api.qishui.com`.
5. Extract the following fields from that request and fill them into `server/.env`:

| `.env` Variable | Capture Location |
| --- | --- |
| `DEVICE_ID` | `device_id` or `fp` in the URL query parameters |
| `COOKIE` | Full content of the `Cookie` request header |
| `X_HELIOS` | `x-helios` request header |
| `X_MEDUSA` | `x-medusa` request header |

Credentials will expire. If the interface returns errors, please recapture them, update `.env`, and restart the service.

---

## API Documentation

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/api/track/v2` | Get full-version audio information |

### POST /api/track/v2

Request body example:

```json
{
  "track_id": "7497192086862071809"
}
```

Success response example:

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

## Docker Build & Publish

Complete the image build and push on a development machine; the server only needs to pull and run.

### 1. Login to Docker Hub

```bash
docker login
```

### 2. Build Image

```bash
docker compose -f docker-compose.build.yml build
```

You can also add a version tag:

```bash
docker tag qiuyu6543/qishui-music-analysis-server:latest qiuyu6543/qishui-music-analysis-server:0.1.0
```

### 3. Push to Docker Hub

```bash
docker push qiuyu6543/qishui-music-analysis-server:latest
docker push qiuyu6543/qishui-music-analysis-server:0.1.0
```

### 4. Update Image on Server

```bash
docker compose pull
docker compose up -d
```

---

## Common Commands

```bash
# Check running status
docker compose ps

# View logs
docker compose logs -f

# Stop service
docker compose down

# Restart (e.g., after updating .env credentials)
docker compose restart
```

---

## Production Frontend Integration

The production frontend must point its API address to this service, for example:

```
http://your-server-ip:6623/api
```

The API base URL can be switched via environment variables or `src/services/server.ts` during frontend build.

---

## Troubleshooting

**Image pull failure `not found`**

Domestic third-party image accelerators usually do not sync personal repositories. It is recommended to remove accelerators and connect directly to Docker Hub:

```bash
sudo nano /etc/docker/daemon.json
```

Set `registry-mirrors` to `[]`, then:

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
docker compose pull
docker compose up -d
```

**Alternative: Offline Image Import**

Dev machine:

```bash
docker save qiuyu6543/qishui-music-analysis-server:latest -o qishui-server.tar
scp qishui-server.tar root@your-server-ip:/app/qishuiMusicAnalysis/server/
```

Server:

```bash
docker load -i qishui-server.tar
docker compose up -d
```

**Container exits immediately after startup**

```bash
docker compose logs
```

Common causes: `.env` is missing or has formatting errors.

**Port occupied**

Modify `PORT` in `.env`, then execute `docker compose down && docker compose up -d`.

**Interface returns 500 due to expired credentials**

Update `.env` and execute `docker compose restart`.

---

## Support the Author

If this project helps you, feel free to donate via the QR codes. Your support is my motivation for continued maintenance 🙏 Since this uses my own Qishui account, the VIP status might expire occasionally; if you are able, a small sponsorship would be greatly appreciated.

<table>
  <tr>
    <td align="center">
      <img src="./assets/微信收款码.jpg" alt="WeChat Pay" width="240" />
      <br />
      <b>WeChat Pay</b>
    </td>
    <td align="center">
      <img src="./assets/支付宝收款码.jpg" alt="Alipay" width="240" />
      <br />
      <b>Alipay</b>
    </td>
  </tr>
</table>

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=520Qiuyu/qishuiMusicAnalysis&type=Date)](https://star-history.com/#520Qiuyu/qishuiMusicAnalysis&Date)
