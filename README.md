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
- **🎨 共享 UI 和逻辑**: 内置 `@trs/ui` (共享组件) 和 `@trs/utils` (共享工具函数) 等包，促进代码复用。
- **⚡️ 现代前端框架**: 应用默认使用 [Vue 3](https://vuejs.org/) 和 [Vite](https://vitejs.dev/)，提供极致的开发速度。

## 📂 项目结构

```
.
├── apps/
│   ├── APP1/         # 第一个 Vue 应用
│   └── APP2/         # 第二个 Vue 应用
├── packages/
│   ├── config/       # 共享配置
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
- `pnpm lint`: 对整个项目进行代码风格检查并自动修复。



eslint 放弃全局单一eslint.config.mjs
而是封装为一个依赖包 规定通用的eslint配置 不同项目可以根据需要微调,如添加新rule或者覆盖原某条rule

使用注意:需要项目自身安装`eslint`依赖以及配置lint脚本,并且版本推荐和`@trs/lint`依赖版本一致

```json
"scripts": {
  "lint": "eslint"
}
```

第一次下载项目

```bash
pnpm sgh 
```
来初始化git-hooks

## 高级用法：增量任务执行

Turborepo 的核心优势之一是能够只在受变更影响的项目上执行任务，从而极大提升效率。这种“增量执行”的机制在不同场景下有不同的实现方式。

### 场景一：CI/CD 中的增量部署 (例如 `deploy`)

在 CI/CD 环境中，我们通常希望只部署那些自上次成功部署以来发生变化的应用。直接运行 `turbo run deploy` 会尝试在所有项目中执行，这并非我们所想。

正确的做法是使用 `turbo` 的 `--filter` 标志，并结合 Git 的提交历史来确定范围。

**工作原理**：我们通过 `--filter` 明确告诉 `turbo` 需要比较的 Git 记录范围。`turbo` 会分析这个范围内的文件变更，找出所有受影响的工作空间（包括直接修改和间接依赖），然后只在这些工作空间上执行指定的任务（如 `deploy`）。

**常用命令**：

在 CI/CD 流程中，通常在代码合并到主分支后触发，此时 `HEAD` 指向最新的 commit。

- **与上一个 commit 比较（推荐）**:
  ```bash
  # 这会部署本次合并所引入的变更
  turbo run deploy --filter="...[HEAD~1]"
  ```
- **使用 CI/CD 平台的环境变量（更精确）**:
  大多数平台会提供变更前后的 commit SHA，这是最健壮的方式。
  ```bash
  # GitHub Actions 示例
  turbo run deploy --filter="...[$CI_COMMIT_BEFORE_SHA]"
  ```

### 场景二：本地提交时的增量检查 (例如 `lint`)

在本地开发中，我们希望在 `git commit` 时仅对本次提交中暂存（staged）的文件进行代码检查。这个过程由 `lint-staged` 和 `turbo` 协同完成。

**工作原理**：这里的关键在于 `lint-staged` 扮演了“中间人”的角色。

1.  **`lint-staged` 捕获文件**: 当您执行 `git commit` 时，`lint-staged` 会获取所有暂存区内的文件。
2.  **`lint-staged` 调用 `turbo`**: 它将匹配到的**具体文件名**作为参数，传递给 `turbo` 命令。
3.  **`turbo` 分发任务**: `turbo` 接收到命令后，会智能地分析每个文件属于哪个工作空间。
4.  **`eslint` 精准执行**: `turbo` 会在对应的工作空间内执行 `lint` 脚本（例如 `"lint": "eslint"`），并将文件和从顶层传来的 `--fix` 参数一并交给 `eslint`。

**重要配置：`lint-staged` 与 `turbo` 的参数传递**

为了让上述流程正确工作，`lint-staged` 的配置至关重要。一个常见的错误是 `turbo` 将 `lint-staged` 传来的文件名误认为是任务名而不是参数。

正确的配置是在根目录 `package.json` 中这样做：
```json
"lint-staged": {
  "*.{js,jsx,ts,tsx,vue}": [
    "turbo run lint --"
  ]
}
```
**命令末尾的 `--` 是一个分隔符，它告诉 `turbo`：“到此为止，`run` 的任务是 `lint`，之后由 `lint-staged` 提供的所有内容（即文件名列表）都应作为参数传递给 `lint` 任务，而不是被解析为新的任务名。”**

同时，为了实现自动修复，根目录的 `lint` 脚本应配置为：
```json
"scripts": {
  "lint": "turbo run lint -- --fix"
}
```
这里的第一个 `--` 是 `turbo` 用来将 `--fix` 参数传递给子项目的 `lint` 脚本。

**结论**：
- 对于 `deploy` 这类由开发者或 CI 主动发起的任务，我们需要使用 `--filter` 来**告知 `turbo` 变更的范围**。
- 对于 `lint` 这类由 `lint-staged` 触发的任务，是 `lint-staged` 工具**将具体的文件清单交给了 `turbo`**，我们则需要通过 `--` 分隔符确保这些清单被正确地当作参数处理。