# turborepo-starter

<img width="1416" height="965" alt="PixPin_2026-06-24_16-56-22" src="https://github.com/user-attachments/assets/15c53781-6b1f-4e21-bbc3-7423f67b2ae2" />


Vue 3 + Vite + TypeScript Monorepo 启动模板，基于 pnpm + Turborepo。

[![Powered by Turborepo](https://img.shields.io/badge/powered_by-Turborepo-blue?style=flat&logo=turborepo)](https://turbo.build/)
[![Managed with pnpm](https://img.shields.io/badge/managed_with-pnpm-yellow?style=flat&logo=pnpm)](https://pnpm.io/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3.5 (Composition API + `<script setup>`) |
| 构建 | Vite 8 (apps) / tsup 8 (packages) |
| 包管理 | pnpm 11 + workspace |
| 任务编排 | Turborepo |
| 状态管理 | Pinia 3 |
| HTTP 客户端 | Axios (封装于 `@trs/fetch`) |
| 国际化 | vue-i18n 11 |
| 代码规范 | ESLint 10 + @antfu/eslint-config |
| 类型检查 | TypeScript 6.0 |

## 项目结构

```
trs/
├── apps/
│   ├── APP1/              # 主应用 — 完整功能演示（i18n / 权限 / API / SSE）
│   └── APP2/              # 基础脚手架 — 极简 Vue 入口
├── packages/
│   ├── config/            # 环境变量读取
│   ├── fetch/             # Axios 封装 + 拦截器 + API 工厂
│   ├── i18n/              # vue-i18n 初始化 + 语言包
│   ├── lint/              # 共享 ESLint 配置工厂
│   ├── permission/        # v-permission 指令 + 权限检查
│   ├── ui/                # 共享 Vue 组件库
│   └── utils/             # SSE 连接 + 工具函数
├── scripts/
│   └── deploy.sh          # SCP 部署脚本
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── turbo.json             # Turborepo 任务配置
├── pnpm-workspace.yaml    # 工作空间定义
└── package.json           # 根配置
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 初始化 git hooks（首次）
pnpm sgh

# 启动所有应用
pnpm dev

# 仅启动 app1
pnpm dev:app1
```

APP1: `http://localhost:5173` | APP2: `http://localhost:5174`

## 常用命令

在根目录执行：

```bash
pnpm dev              # 启动所有应用
pnpm dev:app1         # 仅启动 app1
pnpm build:dev        # 开发模式构建
pnpm build:prod       # 生产模式构建
pnpm lint             # 全量 lint
pnpm deploy:prod      # 生产部署（建议配合 --filter 增量执行）
```

## 核心特性

### 权限控制

通过 `v-permission` 指令实现按钮级权限控制：

```html
<button v-permission="'btn:user:create'">创建用户</button>
```

权限列表由 Pinia auth store 管理，指令自动响应。

### 国际化

```typescript
import { useI18n } from '@trs/i18n'
const { t, locale } = useI18n()
locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
```

语言包集中管理在 `packages/i18n/locales/`，所有应用自动共享。

### API 客户端

工厂函数 + 依赖注入模式：

```typescript
import { createHttpClient, createApi } from '@trs/fetch'

const httpClient = createHttpClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  handlers: { getToken, clearToken, showError },
})
const api = createApi(httpClient)
```

拦截器自动处理 Token 注入、浏览器指纹、401 重定向、统一错误提示。

### SSE 实时推送

```typescript
import { subscribeToSSE } from '@trs/utils'

const unsubscribe = subscribeToSSE('order:updated', (data) => {
  // 处理推送数据
})
```

全局单例连接，多组件共享，支持按事件类型订阅/取消。

## 新增应用

```bash
pnpm create-app
```

交互式输入应用名称，自动生成完整脚手架：`vite.config.js`、`eslint.config.mjs`、`package.json`、Pinia auth store、i18n 初始化、API 客户端等。是否需要独立环境变量文件也可以在脚本中选择。

生成后启动：

```bash
pnpm dev --filter=<应用名>
```

## 新增共享包

1. 在 `packages/` 下创建目录
2. TS 包使用 `tsup` 构建，Vue 组件包使用 `vite` 库模式
3. 宿主环境依赖（如 `vue`）设为 `peerDependencies`，而包内部的底层网络或国际化工具依赖（如 `axios`、`vue-i18n`）声明在 `dependencies` 中以便消费端开箱即用，内部 `@trs/*` 包用 `dependencies`
4. 在 `turbo.json` 中视需要添加对应 task

## 更多

构建细节、增量部署、lint-staged 配置、CI/CD 示例等参见 [Q&A.md](./Q&A.md)。
