# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 pnpm + Turborepo 的 Monorepo 前端项目，使用 Vue 3 + Vite + TypeScript + Pinia 技术栈。

## 常用命令

所有命令均在**项目根目录**执行：

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 同时启动所有应用的开发模式 |
| `pnpm dev:app1` / `pnpm dev:app2` | 启动单个应用 |
| `pnpm build:dev` | 开发环境构建所有应用 |
| `pnpm build:prod` | 生产环境构建所有应用 |
| `pnpm lint` | 全项目代码检查并自动修复 |
| `pnpm lint -- --fix` | 同上（等效） |
| `pnpm sgh` | 初始化 Git Hooks（首次 clone 后执行一次） |
| `pnpm add <pkg> --filter <target>` | 为指定子项目添加依赖（⚠️ 不要 cd 到子目录） |

**增量构建/部署**：`pnpm deploy:prod --filter="...[origin/main]"`（详见 README 过滤器章节）

## 架构要点

### 混合构建模式（Dev/Prod 差异）

这是最关键的设计——开发与生产使用不同的模块解析路径：

- **开发模式**（`isDev = true`）：每个 app 的 `vite.config.js` 通过 `resolve.alias` 将 `@trs/ui`、`@trs/utils`、`@trs/fetch`、`@trs/i18n` 直接指向**源码入口**（如 `packages/ui/index.ts`）。Vite dev server 直接处理源码，实现跨包即时热更新。
- **生产构建**：不设置别名，Vite 按标准的 `package.json` `exports` 字段解析到预构建的 `dist/` 产物。Turborepo 通过 `dependsOn: ["^build"]` 确保依赖包先构建。

⚠️ **风险**：包的构建脚本 bug 在 dev 模式下不可见，只会在 `build:prod` 时才暴露。合并前务必执行全量生产构建验证。

### 包清单与职责

| 包 | 构建工具 | 职责 |
|---|---|---|
| `@trs/config` | 无（纯 JS） | 环境变量读取器，兼容 `import.meta.env` 和 `process.env` |
| `@trs/lint` | 无（纯 JS） | 共享 ESLint flat config，封装 `@antfu/eslint-config`。消费方需自行安装 `eslint` 并调用 `export default lint({ rules: {...} })` |
| `@trs/fetch` | 无构建 | HTTP 客户端工厂。导出 `createHttpClient(options)` 和 `createApi(httpClient)`。通过工厂函数 + 依赖注入保持框架无关 |
| `@trs/permission` | 无构建 | 权限控制：`hasPermission()` + `setupPermissionDirective(app, { getAuthStore })` 安装 `v-permission` 指令 |
| `@trs/i18n` | tsup → ESM/CJS | 国际化封装，基于 `vue-i18n`。语言文件在 `locales/` 目录 |
| `@trs/ui` | Vite lib mode → ESM/CJS | 共享 Vue 组件库，`vue` 作为 `peerDependencies` 被 external |
| `@trs/utils` | tsup → ESM/CJS | 工具函数，含全局单例 SSE 连接管理（`subscribeToSSE`/`closeSSEConnection`） |

### 关键设计模式

1. **工厂函数 + 依赖注入**（fetch 包）：`createHttpClient` 接收 `handlers` 对象（`getToken`、`clearToken`、`showError` 等），由应用层提供具体实现。axios 拦截器统一处理 Token 注入、浏览器指纹、时间戳防缓存、响应 `data` 自动提取、HTTP 状态码映射（401/403/500）。

2. **`getAuthStore` 回调**（permission 包）：指令通过 `setupPermissionDirective(app, { getAuthStore: () => useAuthStore() })` 获取 Pinia store，实现指令与具体 store 实现的解耦。

3. **三层 API 消费链**：App 层创建 httpClient → `@trs/fetch` 定义 API 方法 → `@trs/ui` 组件通过 props 接收 api 对象调用。共享包不持有任何 axios 实例。

### 环境变量

根目录的 `.env.development` / `.env.production` 被所有 app 共享。每个 app 的 `vite.config.js` 通过 `envDir: path.resolve(__dirname, '../../')` 指向根目录。新增 app 必须同样配置。

### Turborepo 关键配置

- `dependsOn: ["^build"]`：`^` 表示先构建该包的**所有内部依赖**，再构建自身
- **deploy 任务不要设置 `"cache": false`**，否则 `--filter` 增量部署会失效（详见 README 陷阱章节）
- `pnpm-workspace.yaml` 包含 `apps/*` 和 `packages/*`，新增目录需加入此文件

### 新增 App 清单

在 `apps/` 下新增子项目时必须：
1. `vite.config.js` 设置 `envDir` 指向根目录
2. `package.json` 添加 `build:dev`、`build:prod`、`deploy:dev`、`deploy:prod`、`lint`、`dev` 脚本
3. `dependencies` 使用 `"workspace:*"` 协议引用共享包
4. 在根目录执行 `pnpm install` 建链

## KiloCode 规则

来自 `.kilocode/rules/all.md`：
- 所有问答和文档使用中文
- 处理问题时同步补充 i18n 翻译字段
