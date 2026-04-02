# Backend 部署说明

本文档只说明 `resource-hub` 后端在当前服务器上的迭代部署方式。

## 服务器目标

- 部署目录：`/www/wwwroot/resource-hub/backend`
- PM2 应用名：`resource-hub-api`
- 环境变量文件：服务器目录中的 `.env.production`

## 部署入口

在项目根目录执行：

```powershell
pnpm run deploy:server -- --target backend
```

## 后端部署流程

1. 本地执行 `src/api` 下的 `pnpm build`
2. 打包 `dist`、`prisma`、`package.json`、`pnpm-lock.yaml`、`ecosystem.config.cjs`
3. 上传到服务器临时目录 `/www/wwwroot/.resource-hub-deploy/.deploy`
4. 替换正式目录 `/www/wwwroot/resource-hub/backend`，保留 `.env`、`.env.production` 和 `logs`
5. 在服务器执行：
   - `pnpm install --frozen-lockfile --ignore-scripts`
   - `pnpm exec prisma generate`
   - `mkdir -p dist/src/generated/prisma`
   - `cp -f src/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node dist/src/generated/prisma/`
   - `pnpm exec prisma migrate deploy`
   - `npx --yes pm2 delete resource-hub-api || true`
   - `npx --yes pm2 start ecosystem.config.cjs --update-env`

## 服务器准备要求

- Node.js 20+
- pnpm
- PM2
- PostgreSQL

## 生产环境变量

服务器上的 `.env.production` 至少要包含：

- `NODE_ENV=production`
- `PORT=40251`
- `DATABASE_URL=postgresql://<user>:<password>@127.0.0.1:5432/resource-hub?schema=public`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `PAYMENT_NOTIFY_URL=https://resource-hub.nps1.tx07.cn`
- `OPENAPI_SERVER_URL=https://resource-hub.nps1.tx07.cn`
- `OPEN_PLATFORM_BASE_URL=https://open.tx07.cn`
- `OPEN_PLATFORM_APP_ID=...`

## 注意事项

- 正式环境只使用 `pnpm exec prisma migrate deploy`
- 不要在正式环境执行 `pnpm db:migrate`
- 不要混用手工启动进程和 PM2
- 如果改了关键环境变量，优先执行 `pm2 delete + pm2 start`，不要只做 `restart`
- 后端目录中的 `.env`、`.env.production` 和 `logs` 会在部署时保留
