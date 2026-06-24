# Monorepo 构建流程 Q&A

> 本文档总结了配置 Turborepo 项目构建流程时遇到的一系列问题和最佳实践，按主题分为五大类。

## 目录

- [一、基础概念](#一基础概念)
  - [Q1: 为什么 `packages` 需要 `build` 脚本？](#q1-为什么-packages-需要-build-脚本)
  - [Q2: `tsup` 是什么？为什么要用它？](#q2-tsup-是什么为什么要用它)
  - [Q3: 为什么要打包 CJS 和 ESM 两种格式？](#q3-为什么要打包-cjs-和-esm-两种格式)
  - [Q4: Vite 能处理 CJS 格式的依赖吗？](#q4-vite-能处理-cjs-格式的依赖吗)
  - [Q5: 为什么所有命令都要在根目录执行？](#q5-为什么所有命令都要在根目录执行)
  - [Q6: 工作空间与 `workspace:*` 协议](#q6-工作空间与-workspace-协议)
- [二、构建机制](#二构建机制)
  - [Q7: 为什么修复前 `pnpm build` 也能成功？](#q7-为什么修复前-pnpm-build-也能成功)
  - [Q8: `turbo run build` 为何不构建某个包？](#q8-turbo-run-build-为何不构建某个包)
  - [Q9: TypeScript 包构建时报 `Cannot find module`？](#q9-typescript-包构建时报-cannot-find-module)
- [三、混合构建模式](#三混合构建模式)
  - [Q10: 如何兼得开发体验和生产健壮性？](#q10-如何兼得开发体验和生产健壮性)
- [四、部署与 CI/CD](#四部署与-cicd)
  - [Q11: `turbo.json` 中 `deploy` 任务的 `dependsOn` 陷阱](#q11-turbojson-中-deploy-任务的-dependson-陷阱)
  - [Q12: 增量构建与部署完整工作流](#q12-增量构建与部署完整工作流)
  - [Q13: CI/CD 中的统一增量部署](#q13-cicd-中的统一增量部署)
- [五、工程实践](#五工程实践)
  - [Q14: lint-staged 的正确配置](#q14-lint-staged-的正确配置)
  - [Q15: 环境变量的集中管理](#q15-环境变量的集中管理)

---

## 一、基础概念

### Q1: 为什么 `packages` 需要 `build` 脚本？

`packages` 中的代码（TypeScript `.ts`、Vue `.vue` 等）不是标准 JavaScript，无法被浏览器或 Node.js 直接运行。`build` 脚本负责将源码**编译**成标准的 CJS / ESM 产物。

**核心收益：**

| 收益 | 说明 |
|---|---|
| **解耦** | `packages` 成为独立、可发布的标准库，不依赖特定消费方 |
| **性能** | Turborepo 可缓存 `dist` 产物——多 app 依赖同一 package 时只构建一次 |
| **兼容性** | 标准格式产物可在浏览器、Node.js、测试环境等任意场景使用 |

### Q2: `tsup` 是什么？为什么要用它？

`tsup` 是基于 esbuild 的零配置 JS/TS 库打包工具。

**选型理由：**

- **简单快速**：无需复杂配置即可完成打包
- **双格式输出**：一条命令同时生成 CJS 和 ESM 产物
- **自动生成类型**：从 TS 源码或 JSDoc 自动生成 `.d.ts` 类型声明文件

### Q3: 为什么要打包 CJS 和 ESM 两种格式？

为了最大化兼容 JavaScript 生态中新旧并存的两种模块系统。

| 格式 | 语法 | 适用场景 |
|---|---|---|
| **ESM** | `import` / `export` | 现代浏览器、Vite、支持 Tree Shaking |
| **CJS** | `require` / `module.exports` | 旧 Node.js 环境、Jest 等测试框架、服务端脚本 |

在 `package.json` 的 `exports` 字段中同时指定两种入口，同一包可无缝被不同环境的消费者使用。

### Q4: Vite 能处理 CJS 格式的依赖吗？

**能。** Vite 会智能转换：

- **开发环境**：通过 esbuild 实时将 CJS 转为 ESM 再发送给浏览器
- **生产环境**：通过 `@rollup/plugin-commonjs` 将 CJS 转为 ESM 再打包

> ⚠️ 尽管 Vite 能处理 CJS，但优先提供 ESM 格式能让预构建和 Tree Shaking 更高效。双格式是面向未来的健壮选择。

### Q5: 为什么所有命令都要在根目录执行？

所有 `pnpm` 和 `turbo` 命令（安装、启动、构建、部署）必须在**项目根目录**执行——这是 pnpm 工作空间和 Turborepo 任务调度正常工作的前提。

```bash
# ✅ 正确：在根目录执行
pnpm add axios --filter app1
pnpm add less -D --filter @trs/ui

# ❌ 错误：cd 到子目录
cd apps/app1 && pnpm add axios
```

### Q6: 工作空间与 `workspace:*` 协议

`pnpm-workspace.yaml` 定义了工作空间范围：

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

`"workspace:*"` 是 pnpm 内部协议。当 `app1` 的 `package.json` 中写 `"@trs/ui": "workspace:*"` 时，pnpm 确保它始终引用工作空间内最新版本，无需发布到 npm。Turborepo 通过分析 `package.json` 中的 `dependencies` 来构建任务依赖图（而非源码中的 `import` 语句）。

---

## 二、构建机制

### Q7: 为什么修复前 `pnpm build` 也能成功？

消费方 `app` 的 Vite 构建环境"顺手"编译了依赖的源码。

- 打包 `app` 时，Vite 发现其依赖的 `package` 是源码（如 `.vue`），便用自身的 Vite 配置（Vue 插件等）代为编译
- 这种方式"碰巧"能工作，但有**严重缺陷**：

| 问题 | 影响 |
|---|---|
| **性能极差** | 每个 `app` 重复编译所有依赖的 `package` 源码，无法利用 Turborepo 缓存 |
| **架构脆弱** | `package` 的可构建性完全依赖 `app` 的技术栈，丧失独立性和可移植性 |

### Q8: `turbo run build` 为何不构建某个包？

Turborepo **精确按需构建**。它通过分析 `package.json` 中的依赖关系构建任务依赖图，只构建**实际依赖链**上的包。

> 📌 Turborepo 的构建行为严格遵循 `package.json` 中声明的依赖关系，而非源码中的 `import` 语句。

**示例：** 如果 `app1` 未在 `package.json` 中声明对 `@trs/fetch` 的依赖，即使源码中有 `import`，Turborepo 也不会构建它。添加依赖声明后，构建 `app1` 时会自动先构建 `@trs/fetch`。

### Q9: TypeScript 包构建时报 `Cannot find module`？

`tsup` 调用 TypeScript 编译器（`tsc`）时找不到依赖的类型定义，因为缺少 `tsconfig.json` 指导模块解析行为。

**解决方案：** 在需要编译 TS 的 `package` 根目录创建 `tsconfig.json`，至少配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "Node"
  }
}
```

---

## 三、混合构建模式

### Q10: 如何兼得开发体验和生产健壮性？

我们采用"混合模式"——开发与生产使用**不同的模块解析路径**：

| 模式 | 机制 | 效果 |
|---|---|---|
| **开发** (`pnpm dev`) | `vite.config.js` 通过 `resolve.alias` 将 `@trs/xxx` 指向**源码目录** | Vite dev server 直接处理源码，实现跨包即时 HMR |
| **生产** (`pnpm build:prod`) | 不使用别名，按 `package.json` 的 `exports` 字段解析到 `dist/` **预构建产物** | 健壮、确定性强，充分利用 Turborepo 缓存 |

```
开发:  app import '@trs/ui' → alias → packages/ui/src/index.ts  (源码直读)
生产:  app import '@trs/ui' → exports → packages/ui/dist/index.mjs (预构建产物)
```

> ⚠️ **风险提示**：此模式的代价是开发/生产环境不一致。`package` 构建脚本的 bug 在 `dev` 模式下不可见，只在 `build` 时才暴露。合并代码前务必执行一次全量生产构建验证。

---

## 四、部署与 CI/CD

### Q11: `turbo.json` 中 `deploy` 任务的 `dependsOn` 陷阱

**问题场景：** 只修改了 `app1`，运行 `pnpm deploy:prod --filter="...[HEAD~1]"`，期望只构建部署 `app1`。

```json
// ❌ 错误配置——所有 app 都会被执行
"deploy:prod": {
  "cache": false
}
```

`deploy:prod` 在任务图上是孤立节点，`turbo` 无法判断依赖关系，采取最保守策略——在所有定义了该脚本的包中执行。`"cache": false"` 的高优先级会进一步让 `--filter` 完全失效。

```json
// ✅ 正确配置
"deploy:prod": {
  "dependsOn": ["build:prod"]
}
```

**要点：** 不要设置 `"cache": false"`。`turbo` 利用依赖图和缓存：当 `app2` 的 `build:prod` 命中缓存时，其 `deploy:prod` 也会自动跳过。

### Q12: 增量构建与部署完整工作流

**前置条件：**
1. `turbo.json` 中任务有明确 `dependsOn`，不为需增量执行的任务设 `"cache": false"`
2. Git 工作区干净——脏的根 `package.json` 会让 `turbo` 认为所有包受影响

**常用命令：**

```bash
# 部署当前分支相较于 main 的所有变更
git fetch origin main
pnpm deploy:prod --filter="...[origin/main]"

# 部署最近一次提交的变更
pnpm build --filter="...[HEAD~1]"

# 只构建 app1 及其依赖
pnpm build --filter=app1
```

**`build` vs `deploy` 行为差异：**

| 任务 | 不带 `--filter` | 带 `--filter` |
|---|---|---|
| `build`（可缓存） | 检查所有包，未变更的命中缓存跳过 ✅ | 精确控制范围 |
| `deploy`（有副作用） | 即使 build 命中缓存，仍可能执行 deploy ⚠️ | **必须使用** |

### Q13: CI/CD 中的统一增量部署

通过 CI/CD 环境变量实现一条命令覆盖多环境部署。

**GitHub Actions 示例：**

```yaml
name: Deploy to Environments

on:
  push:
    branches:
      - main
      - dev

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      # ... setup ...

      - name: Deploy changed apps
        run: |
          pnpm deploy:prod --filter="...[origin/${{ github.ref_name }}]"
```

`${{ github.ref_name }}` 在 push 到 `main` / `dev` 时自动替换对应分支名。

---

## 五、工程实践

### Q14: lint-staged 的正确配置

在 Monorepo 中，**不应**通过 `turbo run lint` 触发 lint-staged：

- `turbo` 会在所有包中执行，而非仅变更的包
- 每个包的 lint 脚本写死 `eslint .`，扫描全包而非暂存文件

**正确做法：** 让 lint-staged 直接调用 eslint：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,vue,json}": "eslint --fix --no-warn-ignored"
  }
}
```

ESLint 9 会根据文件路径自动向上查找最近的 `eslint.config.*`，各包规则差异不会丢失。`--no-warn-ignored` 静默跳过非处理文件。

### Q15: 环境变量的集中管理

所有环境变量定义在**项目根目录**的 `.env.development` 和 `.env.production` 中。每个 app 的 `vite.config.js` 通过 `envDir` 指向根目录：

```javascript
export default defineConfig({
  envDir: path.resolve(__dirname, '../../'),
});
```

Vite 启动时自动加载根目录 `.env` 文件，实现全局共享，避免在每个应用中重复配置。
