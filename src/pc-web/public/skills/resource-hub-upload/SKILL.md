---
name: resource-hub-upload
description: 臻享资源平台的 AI 协同上传技能。当用户需要通过 AI 帮助整理和上传资源到臻享资源平台时使用，包括资源信息提取、自动填充和上传流程。
---

# 臻享资源 AI 协同上传

## Goal

帮助用户快速完成资源发布：通过 AI 分析用户提供的网盘链接和截图，自动提取资源信息（标题、分类、标签、说明），生成符合规范的 JSON 回填数据。

## 适用场景

- 用户有一个 123 云盘分享链接，想快速发布资源
- 用户提供了截图，想让 AI 从中提取资源信息
- 用户希望 AI 辅助整理资源元数据

## AI 执行流程

AI 只需关注业务逻辑（提取资源信息），接口调用由脚本封装：

1. 读取用户提供的分享链接和截图信息
2. 提取资源标题、分类、标签，生成 Markdown 说明
3. 调用脚本执行上传/创建操作

## 资源信息提取流程

### 输入信息

用户需要提供：
1. **资源分享链接**：123 云盘的分享链接（必填）
2. **截图地址**：网盘内容截图的 URL 或对象键（可选，但建议提供）
3. **当前表单数据**：标题、分类、标签、详细说明的当前填写状态

### 输出格式

AI 提取后应返回严格 JSON：

```json
{
  "title": "资源标题",
  "category": "开发工具",
  "tags": ["标签1", "标签2"],
  "contentMd": "整理后的 Markdown 详细说明"
}
```

### 字段约束

| 字段 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| title | string | 是 | 资源名称，不超过 100 字符 |
| category | string | 是 | 资源分类，可选值：开发工具、辅助插件、系统优化 |
| tags | string[] | 否 | 标签数组，最多 10 个 |
| contentMd | string | 是 | Markdown 格式的详细说明 |

### 推断规则

- 如果截图和链接信息不足以确认某字段，保守推断
- 在 `contentMd` 末尾补一段"待人工确认"说明
- 分类只使用预设值，不要创造新分类

## 接口能力（脚本封装）

以下接口能力已由 `scripts/resource-upload.js` 封装，AI 只需调用脚本：

| 命令 | 说明 |
|-----|------|
| `upload-image <filePath>` | 上传截图，返回 objectKey |
| `create <title> <category>` | 创建资源 |
| `list [status]` | 获取用户资源列表 |
| `update <resourceId>` | 更新资源 |
| `delete <resourceId>` | 删除资源 |

详细接口字段见附录。

## 业务上下文

- 当前系统：臻享资源
- 发布方式：用户提交 123 云盘分享链接
- 平台不托管资源文件，只记录元数据
- 截图用于展示网盘中的资源内容
- 发布资源固定消耗积分：5 积分
- 资源发布后状态为 `PENDING`，需审核后变为 `APPROVED`

## 成功标准

- 返回合法 JSON
- `title`、`category`、`contentMd` 不为空
- `tags` 为字符串数组
- `category` 必须是预设分类之一

## 执行要求

1. 提取资源信息，输出 JSON
2. 用户确认后，调用脚本完成上传/创建

**不要自己组装 HTTP 请求，让脚本处理接口调用。**

## 脚本使用

> 注意：脚本已内置 userKey（下载时已自动替换为你的真实 UUID），调用命令时不需要传入。

```bash
# 创建资源（推荐用 JSON 文件传参）
node scripts/resource-upload.js create "标题" "分类" ./payload.json

# payload.json 示例：
# {
#   "shareLink": "https://www.123pan.com/...",
#   "contentMd": "插件详细说明，支持多行\n换行也没问题",
#   "tags": ["工具", "开发"],
#   "screenshotObjectKey": "上传截图后获得的对象键"
# }

# 上传截图
node scripts/resource-upload.js upload-image ./screenshot.png

# 获取资源列表
node scripts/resource-upload.js list PENDING

# 更新资源
node scripts/resource-upload.js update <resourceId> ./update.json

# 删除资源
node scripts/resource-upload.js delete <resourceId>
```

## 附录：接口字段

### create 请求字段

| 字段 | 说明 |
|-----|------|
| title | 资源名称 |
| category | 分类：开发工具、辅助插件、系统优化 |
| shareLink | 123 云盘分享链接 |
| contentMd | Markdown 详细说明 |
| tags | 标签数组 |
| screenshotObjectKey | 截图对象键（上传截图后获得） |
| screenshotUrl | 截图 URL（可选） |

### upload-image 响应字段

| 字段 | 说明 |
|-----|------|
| objectKey | 对象键，创建资源时使用 |
| url | 截图 URL |
