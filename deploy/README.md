# 部署脚本

这套脚本用于 `resource-hub` 的后续迭代部署，不负责首次服务器环境初始化。

## 当前已配置目标

- `pc-web` -> `/www/wwwroot/resource-hub/pc-web`
- `backend` -> `/www/wwwroot/resource-hub/backend`

服务器默认配置：

- `host`: `110.42.111.221`
- `port`: `22`
- `username`: `root`

默认不把 SSH 密码直接写进项目文件，执行时请通过环境变量 `DEPLOY_SSH_PASSWORD` 或 `--password` 传入。

## 安装

```powershell
cd D:\git-projects\ai-company\projects\resource-hub
pnpm install
```

## 用法

远端执行任意命令：

```powershell
node ./deploy/remote-exec.mjs --command "hostname"
```

部署单个目标：

```powershell
pnpm run deploy:server -- --target pc-web
pnpm run deploy:server -- --target backend
```

一次部署两个目标：

```powershell
pnpm run deploy:server -- --target pc-web,backend
```

部署全部当前已配置目标：

```powershell
pnpm run deploy:server -- --target all
```

如果本地已经提前构建好，也可以跳过构建：

```powershell
pnpm run deploy:server -- --target pc-web --skip-build
```

## 说明

- 本地会先执行目标对应的 `buildCommands`
- 然后会先在本地打成单个 `tar` 包，再通过 Node SSH 上传到服务器
- 远端先写入临时目录，再替换正式目录
- `remote-exec.mjs` 用于执行临时远端排查命令
- 前端部署会替换 `/www/wwwroot/resource-hub/pc-web`，用于承载 `https://www.tx07.cn/resource-hub`
- 后端部署会先生成部署包，再上传到 `/www/wwwroot/resource-hub/backend`
- 后端部署时会在服务器执行 `pnpm install --frozen-lockfile --ignore-scripts`
- 后端会在服务器重新执行 `pnpm exec prisma generate`
- 后端会把 Linux 的 Prisma Query Engine 复制到 `dist/src/generated/prisma/`
- 后端迁移使用项目内版本：`pnpm exec prisma migrate deploy`
- 后端重启会先删除旧 PM2 进程，再按当前配置重新启动
- 后端部署时会保留服务器上的 `.env` 和 `logs`
