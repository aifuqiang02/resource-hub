# AGENTS.md

## 项目定位

`resource-hub` 是一个资源导航与分发平台。

- 前端负责资源展示、搜索、登录、用户中心、资源发布
- 后端负责认证、资源、上传、通知、积分与充值等 API
- 当前资源分发采用 `123 云盘` 分享链接登记模式，平台不直接托管资源文件

## 项目结构

```text
resource-hub/
├── deploy/        # 项目级部署脚本
├── docs/          # 项目文档
├── designs/       # 设计稿
├── messages/      # AI 对话记录
├── specs/         # 需求规格
├── src/
│   ├── api/       # Express + Prisma 后端
│   └── pc-web/    # Vue 3 PC 前端
├── package.json
└── pnpm-workspace.yaml
```

## 进入项目后优先看

1. `README.md`
2. `docs/deployment.md`
3. `deploy/README.md`
4. `src/api/DEPLOY.md`

如果是后端细节，再看：

- `src/api/AGENTS.md`

## 开发命令

### 项目根目录

```bash
pnpm install
pnpm dev:api
pnpm dev:pc-web
```

### 前端

```bash
cd src/pc-web
pnpm install
pnpm dev
pnpm test:run
pnpm build
```

### 后端

```bash
cd src/api
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm db:migrate
```

## 配置约定

### 前端

- 开发环境：`src/pc-web/.env.development`
- 测试环境：`src/pc-web/.env.test`
- 生产环境：`src/pc-web/.env.production`
- 示例文件：`src/pc-web/.env.example`

关键点：

- 生产前端子路径是 `VITE_APP_BASE_PATH=/resource-hub/`
- 生产 API 地址是 `https://api.tx07.cn/resource-hub/api/v1`

### 后端

- 开发环境优先读取 `src/api/.env.development`
- 生产环境优先读取 `src/api/.env.production`
- 如果对应文件不存在，再回退到 `src/api/.env`

线上当前约定：

- 使用 `/www/wwwroot/resource-hub/backend/.env.production`
- 数据库地址使用 `127.0.0.1`

生产环境至少关注这些变量：

- `PORT=40251`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `PAYMENT_NOTIFY_URL`
- `OPENAPI_SERVER_URL`
- `OPEN_PLATFORM_BASE_URL`
- `OPEN_PLATFORM_APP_ID`

## 当前部署约定

### 访问入口

- 页面：`https://www.tx07.cn/resource-hub`
- API：`https://api.tx07.cn/resource-hub/api/v1`

### 服务器目录

- 前端：`/www/wwwroot/resource-hub/pc-web`
- 后端：`/www/wwwroot/resource-hub/backend`
- 临时部署目录：`/www/wwwroot/.resource-hub-deploy/.deploy`

### 发布命令

```bash
pnpm run deploy:server -- --target pc-web
pnpm run deploy:server -- --target backend
pnpm run deploy:server -- --target pc-web,backend
```

远端排查：

```bash
pnpm run remote:exec -- --command "hostname"
```

同步 `tx07.conf`：

```bash
pnpm run sync:nginx:tx07
```

## 工作规则

- 优先复用项目根 `deploy/` 下的脚本，不要临时手敲整套发布流程
- 不要把生产 SSH 密码直接写入仓库文件
- 如果改了前端子路径、域名、接口前缀，要同时检查：
  - `src/pc-web/.env.production`
  - `deploy/deploy.config.mjs`
  - `/www/server/panel/vhost/nginx/tx07.conf`
- 如果改了后端关键环境变量或 PM2 配置，优先使用 `pm2 delete + pm2 start`，不要只做 `restart`
- 如果修改了服务器上的数据库连接，优先改 `.env.production`，不要只改 `.env`

## 文档分工

- `AGENTS.md`：AI 接手入口规则
- `README.md`：项目快速说明与启动入口
- `docs/deployment.md`：项目级部署说明
- `deploy/README.md`：部署脚本用法
- `src/api/DEPLOY.md`：后端部署细节
