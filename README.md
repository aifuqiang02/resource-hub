# 臻享资源 (ZhenXiangZiYuan)

优质资源导航与发现平台，解决网上资源太多、难以找到有效资源的问题。
当前资源发布采用 `123 云盘` 分享链接登记模式，平台不直接托管资源文件。

## 项目简介

帮助用户发现和分享优质资源的导航平台。

- **目标用户**：需要寻找学习资源、技术资料的用户
- **核心功能**：资源导航、智能推荐、资源评价、123 云盘资源分发
- **部署状态**：开发中

## 当前结论

- 已按 monorepo 方式集中维护前端、后端、设计稿、规格、文档和消息记录
- 根目录已补 `pnpm-workspace.yaml` 与根 `package.json`，项目级入口统一到 `resource-hub/`
- 配置统一收口到各端环境变量文件中，并按开发、测试、生产环境区分

## 技术栈

| 端 | 技术 | 说明 |
|---|------|------|
| PC前端 | Vue 3 + TypeScript + Vite + Element Plus + Tailwind CSS | PC Web 页面 |
| 后端API | Node.js + Express + Prisma + PostgreSQL | RESTful API 服务 |
| 缓存 | Redis | 会话缓存等 |
| AI | 大语言模型 | 智能推荐 |

## 端口规划（40250-40299）

| 端口 | 服务 | 环境 | 描述 |
|-----|------|------|------|
| 40250 | pc-web | dev | PC前端开发服务 |
| 40251 | api | dev | API接口服务 |

## 项目结构

```
resource-hub/
├── package.json          # 项目根脚本入口
├── pnpm-workspace.yaml   # pnpm workspace 配置
├── src/
│   ├── api/              # Express + Prisma 后端
│   │   ├── prisma/      # 数据库 schema 和迁移
│   │   ├── .env.example
│   │   ├── .env.development.example
│   │   ├── .env.production.example
│   │   ├── src/
│   │   │   ├── config/  # 环境变量、日志配置
│   │   │   ├── lib/     # Prisma 客户端、工具
│   │   │   ├── modules/ # 业务模块
│   │   │   └── routes/  # 路由
│   │   └── tests/       # 测试
│   └── pc-web/          # Vue 3 前端
│       ├── .env.example
│       ├── .env.development
│       ├── .env.production
│       ├── .env.test
│       ├── src/
│       │   ├── views/   # 页面组件
│       │   ├── components/  # 通用组件
│       │   ├── stores/  # Pinia 状态管理
│       │   ├── services/# Axios 请求层
│       │   └── router/  # 路由配置
│       └── public/       # 静态资源
├── designs/             # 设计稿（Stitch HTML）
├── docs/                # 项目文档
├── specs/               # 需求规格
└── messages/            # AI对话记录
```

## 快速开始

### 项目根目录

```bash
pnpm install
pnpm dev:api
pnpm dev:pc-web
```

### 后端

```bash
cd src/api
pnpm install
pnpm dev
```

### 前端

```bash
cd src/pc-web
pnpm install
pnpm dev
```

## 配置管理

### 后端环境变量

- 开发环境优先读取 `src/api/.env.development`，其次回退到 `src/api/.env`
- 生产环境优先读取 `src/api/.env.production`，其次回退到 `src/api/.env`
- 示例文件：`src/api/.env.example`、`src/api/.env.development.example`、`src/api/.env.production.example`

关键配置：

- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `PAYMENT_NOTIFY_URL`
- `OPENAPI_SERVER_URL`
- `OPEN_PLATFORM_BASE_URL`
- `OPEN_PLATFORM_APP_ID`

### 前端环境变量

- 开发环境：`src/pc-web/.env.development`
- 测试环境：`src/pc-web/.env.test`
- 生产环境：`src/pc-web/.env.production`
- 示例文件：`src/pc-web/.env.example`

关键配置：

- `VITE_APP_TITLE`
- `VITE_APP_BASE_PATH`
- `VITE_API_BASE_URL`
- `VITE_REQUEST_TIMEOUT`
- `VITE_ENABLE_MOCK`
- `VITE_OPEN_PLATFORM_BASE_URL`
- `VITE_OPEN_PLATFORM_APP_ID`
- `VITE_QR_CODE_SERVICE_BASE_URL`
- `VITE_DEV_SERVER_PORT`
- `VITE_DEV_PROXY_TARGET`

说明：微信登录、支付平台轮询、二维码服务地址、Vite 开发代理目标，以及前端部署子路径都已改为从环境变量读取，不再直接写死在代码里。

## 设计稿

设计稿使用 Google Stitch 生成，HTML 文件存放在 `designs/pc/` 目录。

## 核心功能

1. **资源导航** - 按类别整理优质资源
2. **智能搜索** - 快速找到所需资源
3. **AI推荐** - 基于用户需求推荐资源
4. **资源评价** - 用户评分和评论
5. **链接分发** - 通过 `123 云盘` 分享链接提供下载入口

## 项目文档

- [部署指南](./docs/deployment.md)
- [部署脚本说明](./deploy/README.md)
- [资源发布方案（123 云盘链接登记制）](./specs/resource-publish-via-123pan.md)
