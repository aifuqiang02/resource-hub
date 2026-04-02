# 资源中心部署指南

本文档只覆盖 `resource-hub` 项目的迭代部署，不包含服务器首次初始化。

## 当前部署目标

- `pc-web`：部署到 `/www/wwwroot/resource-hub/pc-web`，由 `https://www.tx07.cn/resource-hub` 访问
- `backend`：部署到 `/www/wwwroot/resource-hub/backend`，由 `https://api.tx07.cn/resource-hub/api/v1` 转发访问

## 服务器信息

- 主机：`110.42.111.221`
- SSH 端口：`22`
- SSH 用户：`root`

说明：SSH 密码默认不写入仓库，请通过环境变量 `DEPLOY_SSH_PASSWORD` 或命令参数 `--password` 传入。

## 部署入口

```powershell
cd D:\git-projects\ai-company\projects\resource-hub
pnpm install
pnpm run deploy:server -- --target pc-web
pnpm run deploy:server -- --target backend
pnpm run deploy:server -- --target pc-web,backend
```

如果只是排查服务器：

```powershell
pnpm run remote:exec -- --command "hostname"
```

## 部署过程

### `pc-web`

1. 本地执行 `pnpm build`
2. 将 `src/pc-web/dist` 打成单个 `tar` 包
3. 上传到服务器临时目录
4. 替换 `/www/wwwroot/resource-hub/pc-web`

### `backend`

1. 本地执行 `pnpm build`
2. 打包这些内容：`dist`、`prisma`、`package.json`、`pnpm-lock.yaml`、`ecosystem.config.cjs`
3. 上传到服务器临时目录
4. 替换 `/www/wwwroot/resource-hub/backend`，保留 `.env`、`.env.production` 和 `logs`
5. 在服务器执行：
   - `pnpm install --frozen-lockfile --ignore-scripts`
   - `pnpm exec prisma generate`
   - 复制 Linux Prisma Query Engine 到 `dist/src/generated/prisma/`
   - `pnpm exec prisma migrate deploy`
   - `pm2 delete resource-hub-api || true`
   - `pm2 start ecosystem.config.cjs --update-env`

## 远端目录约定

- 前端正式目录：`/www/wwwroot/resource-hub/pc-web`
- 后端正式目录：`/www/wwwroot/resource-hub/backend`
- 临时部署目录：`/www/wwwroot/.resource-hub-deploy/.deploy`

## 线上环境变量约定

- 当前线上后端优先使用 `/www/wwwroot/resource-hub/backend/.env.production`
- 如果 `.env.production` 不存在，后端才会回退到 `.env`
- 当前线上数据库地址已调整为 `127.0.0.1`

## 相关文件

- [部署脚本说明](../deploy/README.md)
- [项目入口 README](../README.md)
- [后端部署说明](../src/api/DEPLOY.md)
