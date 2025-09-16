# Turborepo Starter Kit

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
- **💅 统一代码风格**: 通过共享的 `@trs/lint` 包提供一致的 ESLint 配置，确保整个项目的代码质量。
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
│   ├── lint/         # 共享 ESLint 配置
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

**3. 初始化 Git Hooks**

为了确保代码提交时自动执行代码风格检查，你需要初始化 `simple-git-hooks`。这只需要在第一次设置项目时执行一次。

```bash
pnpm sgh
```

**4. 启动开发服务**

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

### 新增项目

当你在 `apps` 目录下添加一个新的子项目时（例如 `APP3`），请遵循以下步骤以确保其正确集成到 Turborepo 工作流中：

**1. 配置 `vite.config.js`**

为了让新的子项目能够正确加载根目录下的 `.env` 文件，你需要在其 `vite.config.js` 中进行如下配置：

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  // 关键配置：将 envDir 指向根目录
  envDir: path.resolve(__dirname, '../../'),
});
```

**2. 配置 `package.json`**

在新项目的 `package.json` 中，你需要设置以下关键字段：

- **`scripts`**: 添加构建、部署和代码检查脚本。`APP_NAME` 需要替换为你的应用名（例如 `APP3`）。
- **`dependencies`**: 添加对共享包（如 `@trs/ui`）的引用。
- **`devDependencies`**: 添加 `eslint` 以支持代码检查。

```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build:dev": "vite build --mode development",
    "build:prod": "vite build",
    "preview": "vite preview",
    "deploy:dev": "pnpm build:dev && bash ../../scripts/deploy.sh APP_NAME dev",
    "deploy:prod": "pnpm build:prod && bash ../../scripts/deploy.sh APP_NAME prod",
    "lint": "eslint"
  },
  "dependencies": {
    "vue": "^3.5.18",
    "@trs/ui": "workspace:*",
    "@trs/config": "workspace:*",
    "@trs/utils": "workspace:*",
    "@trs/lint": "workspace:*"
  },
  "devDependencies": {
    "eslint": "latest",
    "vite": "latest",
    "@vitejs/plugin-vue": "latest"
  }
}
```

**3. 按需添加依赖**

根据你的项目需求，可能需要添加其他共享包作为依赖，例如：

- `@trs/fetch`: 如果需要使用共享的数据请求模块。

只需在 `dependencies` 中添加 `"@trs/fetch": "workspace:*"` 即可。

完成以上步骤后，记得在根目录重新执行 `pnpm install`，以确保所有依赖关系都已正确链接。



eslint 放弃全局单一eslint.config.mjs
而是封装为一个依赖包 规定通用的eslint配置 不同项目可以根据需要微调,如添加新rule或者覆盖原某条rule

使用注意:需要项目自身安装`eslint`依赖以及配置lint脚本,并且版本推荐和`@trs/lint`依赖版本一致

```json
pnpm i -D eslint

"scripts": {
  "lint": "eslint"
}
```


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

在本地开发中，我们希望在 `git commit` 时仅对本次提交中暂存（staged）的文件进行代码检查。这个过程由 `simple-git-hooks` 和 `lint-staged` 协同完成。

**前提条件**：为了使该功能正常工作，请确保根目录的 `package.json` 中已安装 `lint-staged` 和 `simple-git-hooks` 作为开发依赖。如果缺失，请执行 `pnpm add -D -w lint-staged simple-git-hooks` 进行安装。

**工作原理**：

1.  **`simple-git-hooks` 触发**: 当您执行 `git commit` 时，`simple-git-hooks` 会根据配置（`"pre-commit": "pnpm staged"`）执行 `pnpm staged` 命令。
2.  **`lint-staged` 捕获文件**: `lint-staged` 启动后，会获取所有暂存区内的文件。
3.  **`lint-staged` 调用 `turbo`**: 它将匹配到的**具体文件名**作为参数，传递给 `turbo` 命令。
4.  **`turbo` 分发任务**: `turbo` 接收到命令后，会智能地分析每个文件属于哪个工作空间。
5.  **`eslint` 精准执行**: `turbo` 会在对应的工作空间内执行 `lint` 脚本（例如 `"lint": "eslint"`），并将文件和从顶层传来的 `--fix` 参数一并交给 `eslint`。


**重要配置：`lint-staged`、`turbo` 与 `eslint` 的协同**

为了让 `lint-staged` 在提交时正确地对暂存文件进行检查，需要确保根目录和子项目的 `package.json` 配置正确协同。

1.  **子项目配置 (`apps/APP1/package.json`)**
    子项目的 `lint` 脚本应该非常纯粹，只保留 `eslint` 命令本身，以便接收来自 `lint-staged` 传递的文件列表。
    ```json
    "scripts": {
      "lint": "eslint"
    }
    ```

2.  **根项目配置 (`package.json`)**
    根目录的 `lint-staged` 配置负责调用 `turbo`，并使用 `--` 分隔符将 `lint-staged` 捕获的文件列表作为参数传递下去。
    ```json
    "lint-staged": {
      "*.{js,jsx,ts,tsx,vue}": "turbo run lint --"
    }
    ```

同时，为了实现自动修复，根目录的 `lint` 脚本应配置为：
```json
"scripts": {
  "lint": "turbo run lint -- --fix"
}
```
这里的第一个 `--` 是 `turbo` 用来将 `--fix` 参数传递给子项目的 `lint` 脚本。

**结论**：
- 对于 `deploy` 这类由开发者或 CI 主动发起的任务，我们使用 `--filter` 来**告知 `turbo` 变更的范围**（例如 `...[HEAD~1]`）。
- 对于 `lint` 这类由 `lint-staged` 触发的任务，我们依赖 `lint-staged` **收集文件列表**，并通过 `turbo run lint --` 的方式，将这些文件作为**参数**传递给对应工作空间内的 `eslint` 进程。
