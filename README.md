# Monorepo Starter Kit

[![Powered by Turborepo](https://img.shields.io/badge/powered_by-Turborepo-blue?style=for-the-badge&logo=turborepo)](https://turbo.build/)
[![Managed with pnpm](https://img.shields.io/badge/managed_with-pnpm-yellow?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

这是一个基于 **pnpm** 和 **Turborepo** 的高性能 Monorepo 项目入门套件。它为你预设了现代化的前端开发环境，旨在提供最佳的开发体验和可扩展性。

## ✨ 特性

- **🚀 高性能 Monorepo**: 使用 [Turborepo](https://turbo.build/) 实现极速的构建、测试和代码检查。
- **📦 高效包管理**: 使用 [pnpm](https://pnpm.io/) 管理依赖，节省磁盘空间并避免幽灵依赖。
- **🔧 可扩展的应用和包**: 在 `apps` 和 `packages` 目录中轻松添加新的应用或共享库。
- **🌐 环境配置分离**: 通过 `.env` 文件集中管理不同环境（开发、生产）的配置。
- **🎨 共享 UI 和逻辑**: 内置 `@bms/ui` (共享组件) 和 `@bms/utils` (共享工具函数) 等包，促进代码复用。
- **⚡️ 现代前端框架**: 应用默认使用 [Vue 3](https://vuejs.org/) 和 [Vite](https://vitejs.dev/)，提供极致的开发速度。

## 📂 项目结构

```
.
├── apps/
│   ├── APP1/         # 第一个 Vue 应用
│   └── APP2/         # 第二个 Vue 应用
├── packages/
│   ├── config/       # 共享配置 (如 ESLint, Prettier)
│   ├── fetch/        # 共享数据请求模块
│   ├── ui/           # 共享 Vue 组件库
│   └── utils/        # 共享工具函数
├── .env.development  # 开发环境变量
├── .env.production   # 生产环境变量
├── package.json      # 根 package.json
├── pnpm-workspace.yaml
└── turbo.json
```

- **`apps`**: 存放各个独立的应用（例如网站、后台管理系统等）。
- **`packages`**: 存放可被多个 `apps` 共享的代码库（例如公共组件、工具函数、配置等）。

## 🚀 快速开始

**1. 克隆项目**

```bash
git clone <your-repo-url>
cd <your-repo-name>
```

**2. 安装依赖**

在项目根目录执行：

```bash
pnpm install
```

**3. 启动开发服务**

此命令会同时启动所有 `apps` 下的应用：

```bash
pnpm dev
```

然后你就可以在浏览器中访问对应的应用了（通常是 `http://localhost:5173` 和 `http://localhost:5174`）。

## 🛠️ 常用命令

所有命令都建议在项目根目录执行。

- `pnpm dev`: 启动所有应用的开发模式。
- `pnpm build`: 构建所有应用和包。
- `pnpm lint`: 对整个项目进行代码风格检查。
- `pnpm clean`: 清理所有 `node_modules` 和构建产物，用于完全重新安装。