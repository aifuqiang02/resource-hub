# vite-vue3-elementplus-tailwindcss-template

一个偏 PC 中后台场景的 Vue 3 底座模板，内置 `Element Plus`、`Tailwind CSS`、登录鉴权、权限路由、`axios` 请求层和完整工程化能力，适合作为运营后台、管理系统和企业内部工具起点。

## 技术栈

- Vue 3
- TypeScript
- Vite 8
- Element Plus
- Tailwind CSS
- Vue Router
- Pinia
- Axios
- Vitest

## 已内置能力

- 后台布局、桌面端组件和 Tailwind 原子化样式
- Mock 登录、权限路由、按钮级权限控制
- `401 -> refresh token -> 原请求重试`
- Lint、Test、Build、Husky、CI

## 快速开始

```sh
pnpm install
pnpm dev
```

Mock 登录账号：

- `admin` / 任意 6 位以上密码
- `editor` / 任意 6 位以上密码

## 常用命令

```sh
pnpm lint
pnpm test:run
pnpm build
```
