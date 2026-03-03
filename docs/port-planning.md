# 臻享资源端口规划

## 端口范围

40250-40299（50个端口）

## 端口分配表

| 端口 | 服务 | 协议 | 环境 | 描述 |
|-----|------|------|------|------|
| 40250 | web | HTTP | dev | Web主站 |
| 40251 | api | HTTP | dev | API接口服务 |
| 40252 | search | HTTP | dev | 搜索服务 |
| 40253 | ai | HTTP | dev | AI推荐服务 |
| 40254-40259 | - | - | - | 预留 |
| 40260 | admin | HTTP | dev | 管理后台 |

## 防火墙配置

```bash
sudo ufw allow 40250/tcp  # Web
sudo ufw allow 40251/tcp  # API
```
