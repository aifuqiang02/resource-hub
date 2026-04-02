# 臻享资源 (ZhenXiangZiYuan)

优质资源导航与发现平台，解决网上资源太多、难以找到有效资源的问题。
当前资源发布采用 `123 云盘` 分享链接登记模式，平台不直接托管资源文件。

## 项目简介

帮助用户发现和分享优质资源的导航平台。

- **目标用户**：需要寻找学习资源、技术资料的用户
- **核心功能**：资源导航、智能推荐、资源评价、123 云盘资源分发
- **部署状态**：开发中

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
├── src/
│   ├── api/              # Express + Prisma 后端
│   │   ├── prisma/      # 数据库 schema 和迁移
│   │   ├── src/
│   │   │   ├── config/  # 环境变量、日志配置
│   │   │   ├── lib/     # Prisma 客户端、工具
│   │   │   ├── modules/ # 业务模块
│   │   │   └── routes/  # 路由
│   │   └── tests/       # 测试
│   └── pc-web/          # Vue 3 前端
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
- [资源发布方案（123 云盘链接登记制）](./specs/resource-publish-via-123pan.md)
