FROM node:22-alpine

LABEL org.opencontainers.image.title="qishui-music-analysis-server"
LABEL org.opencontainers.image.description="汽水音乐解析服务端"

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

EXPOSE 6623

CMD ["pnpm", "start"]
