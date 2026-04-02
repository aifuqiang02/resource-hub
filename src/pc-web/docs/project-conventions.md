# Project Conventions

## 目标

这份约定用于降低团队在新页面、新模块和新人接入时的沟通成本。

## 页面开发

- 页面文件放在 `src/views/<module>/index.vue`
- 页面默认通过 layout 承载统一头部和内容边距
- 每个页面优先维护清晰的数据流：`route -> store/service -> view`

## Store 设计

- Store 名称使用业务语义，例如 `useUserStore`
- Store 中不要直接写 UI 表现逻辑
- 需要缓存到本地的值统一走常量 key
- 鉴权相关状态统一放在 `auth` store，不要分散在多个页面里维护

## Service 设计

- 基础 HTTP 客户端只负责通用网络行为
- 业务接口模块只描述 URL、参数和返回类型
- Service 层抛出的错误优先转成统一文案，再由页面决定展示方式
- token 注入、401 处理、超时处理优先放在请求拦截器或响应拦截器

## 权限设计

- 路由权限优先通过 `meta.requiresAuth` 和 `meta.roles` 描述
- 页面内按钮级权限优先使用 `v-permission`
- 复杂场景可在组件中复用 `authStore.hasAnyRole`
- 无权限访问统一跳转到 `/forbidden`

## 测试建议

- 工具函数优先补单元测试
- 基础组件优先补渲染与交互测试
- 与路由、状态管理强相关的页面至少保留一条冒烟测试

## 提交规范

- `feat`: 新功能
- `fix`: 缺陷修复
- `refactor`: 重构
- `test`: 测试补充
- `docs`: 文档调整
- `chore`: 工程或依赖维护
