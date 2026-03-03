# 臻享资源部署指南

## 环境要求

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Elasticsearch 8+
- Redis 7+

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd zhen-xiang-zi-yuan
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/zhenxiang
REDIS_URL=redis://localhost:6379
ES_URL=http://localhost:9200
PORT=40250
API_PORT=40251
SEARCH_PORT=40252
AI_PORT=40253
```

### 4. 启动服务

```bash
npm run dev
```

## 验证部署

- Web服务：http://localhost:40250
- API服务：http://localhost:40251/health
