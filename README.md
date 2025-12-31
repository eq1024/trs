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
- **🛡️ 封装的权限控制**: 内置 `@trs/permission` 包，提供 `v-permission` 指令，可轻松实现前端元素的权限控制。
- **📡 统一的数据请求**: 内置 `@trs/fetch` 包，基于 `axios` 提供了统一的请求、响应和错误处理，并集成了浏览器指纹功能。
- **🎨 强类型的共享库**: 核心共享库 `@trs/ui` 和 `@trs/utils` 已完全使用 TypeScript 构建，提供更好的代码提示和类型安全。
- **💅 统一代码风格**: 通过共享的 `@trs/lint` 包提供一致的 ESLint 配置。
- **✅ 自动化代码检查**: 集成 `lint-staged` 和 `simple-git-hooks`，在 `git commit` 时自动对暂存文件进行代码风格检查和修复，从源头保证代码质量。
- **⚡️ 现代前端框架**: 应用默认使用 [Vue 3](https://vuejs.org/) 和 [Vite](https://vitejs.dev/)，提供极致的开发速度。
- **🌍 国际化支持**: 内置 `@trs/i18n` 包，基于 `vue-i18n` 提供完备的国际化解决方案，支持语言切换和多语言文件管理。

##  项目结构

```
.
├── apps/
│   ├── APP1/         # 第一个 Vue 应用
│   └── APP2/         # 第二个 Vue 应用
├── packages/
│   ├── config/       # 共享配置 (JavaScript)
│   ├── fetch/        # 共享数据请求模块 (TypeScript)
│   ├── lint/         # 共享 ESLint 配置 (JavaScript)
│   ├── i18n/         # 共享国际化模块 (TypeScript)
│   ├── permission/   # 共享权限控制模块 (TypeScript)
│   ├── ui/           # 共享 Vue 组件库 (TypeScript)
│   └── utils/        # 共享工具函数 (TypeScript)
├── .env.development  # 开发环境变量
├── .env.production   # 生产环境变量
├── package.json      # 根 package.json
├── pnpm-workspace.yaml
└── turbo.json
```

- **`apps`**: 存放各个独立的应用（例如网站、后台管理系统等）。
- **`packages`**: 存放可被多个 `apps` 共享的代码库（例如公共组件、工具函数、配置等）。

## 💡 核心设计与实践

- 本模板包含了一些旨在提升开发效率和可维护性的核心设计，理解它们有助于你更好地使用和扩展此项目。

- 只做最基础的基建, 其他功能(如:unplugins)都参考共享库的实现方式自由扩展.

## 体验地址

- [APP1 体验地址](https://trs-app-1.vercel.app/)

## 启动成功

<img width="300" height="auto" alt="image" src="https://github.com/user-attachments/assets/0b129f44-d566-415c-a8d9-d25dc9963e0f" />

### 1. 环境变量管理

- **集中管理**: 所有的环境变量（如 `VITE_API_URL`）都定义在项目**根目录**的 `.env.development` 和 `.env.production` 文件中。
- **自动加载**: 每个 `app` 中的 `vite.config.js` 都通过 `envDir: path.resolve(__dirname, '../../')` 配置指向了根目录。这使得 Vite 在启动时能自动加载根目录的 `.env` 文件，实现了环境变量的全局共享，避免了在每个应用中重复配置。

### 2. 任务依赖与缓存 (`turbo.json`)

Turborepo 的核心是 `turbo.json` 中的 `tasks` 配置。

```json
"tasks": {
  "build": {
    "dependsOn": ["^build"],
    "outputs": ["dist/**"]
  },
  "lint": {},
  // ...
}
```

- **`dependsOn: ["^build"]`**: `^` 符号是关键。它告诉 Turborepo，在执行某个包的 `build` 任务之前，必须先完成其所有**内部依赖项**（`dependencies` 和 `devDependencies`）的 `build` 任务。例如，`app1` 依赖 `@trs/ui`，那么在构建 `app1` 之前，`turbo` 会确保 `@trs/ui` 已经被成功构建。
- **`outputs`**: 这个字段告诉 `turbo` 任务的产物存放在哪里。`turbo` 会缓存这些产物。如果下次执行任务时，相关文件和依赖没有发生变化，`turbo` 会直接从缓存中恢复产物，从而实现秒级构建。

### 3. 工作空间与内部依赖

- **`pnpm-workspace.yaml`**: 此文件定义了 pnpm 工作空间的范围，告诉 pnpm 在 `apps` 和 `packages` 目录下寻找子项目。
- **`"workspace:*"` 协议**: 在 `package.json` 中，你会看到类似 `"@trs/ui": "workspace:*"` 的依赖。这是一种 pnpm 的内部协议，它会确保 `app1` 总是引用工作空间内最新版本的 `@trs/ui`，而无需发布到 npm。这使得跨包联调和代码复用变得极其简单。

### 4. 权限控制 (`@trs/permission`)

为了在前端实现精细化的元素级别权限控制，项目内置了 `@trs/permission` 包。它提供了一个核心的 Vue 指令：`v-permission`。

**核心功能：**

-   **指令式控制**: 只需在需要控制的 DOM 元素上添加 `v-permission` 指令，即可根据用户权限动态地显示或隐藏该元素。
-   **与状态管理集成**: 指令与 Pinia 的 `auth` store 自动集成，实时获取当前用户的权限列表。
-   **支持通配符**: 支持 `*` 通配符，拥有该权限的用户将无视所有限制。

**使用方法：**

1.  **在 `main.js` 中安装指令**:
    确保你的应用入口文件（如 `apps/APP1/src/main.js`）已经安装了该指令。这一步通常已经为你配置好了。
    ```javascript
    import { createApp } from 'vue';
    import { createPinia } from 'pinia';
    import { setupPermissionDirective } from '@trs/permission';
    import { useAuthStore } from './stores/auth';
    
    const app = createApp(App);
    app.use(createPinia());

    // 将 auth store 的 getter 函数传递给指令
    setupPermissionDirective(app, {
      getAuthStore: () => useAuthStore(),
    });

    app.mount('#app');
    ```

2.  **在组件中使用指令**:
    在你的 Vue 组件中，直接在需要控制的元素上使用 `v-permission`，并传入所需的权限字符串。
    ```html
    <template>
      <!-- 这个按钮只有在用户拥有 'btn:user:create' 权限时才会显示 -->
      <button v-permission="'btn:user:create'">
        Create User
      </button>

      <!-- 这个区域只有在用户拥有 'page:dashboard:view' 权限时才会显示 -->
      <div v-permission="'page:dashboard:view'">
        Dashboard Content...
      </div>
    </template>
    ```

### 5. 国际化 (`@trs/i18n`)

项目内置了 `@trs/i18n` 包，旨在提供统一的国际化管理。

**核心功能：**

-   **统一配置**: 封装了 `vue-i18n` 的初始化过程，提供统一的 `setupI18n` 函数。
-   **语言包管理**: 在 `packages/i18n/locales/` 目录下集中管理所有语言文件（如 `zh-CN.json`, `en-US.json`）。
-   **易于使用**: 提供了 `useI18n` 钩子，方便在组件中使用。

**使用方法：**

1.  **在 `main.js` 中安装**:
    ```javascript
    import { setupI18n } from '@trs/i18n';
    
    const app = createApp(App);
    app.use(setupI18n());
    ```

2.  **在组件中使用**:
    ```javascript
    <script setup>
    import { useI18n } from '@trs/i18n';
    
    // 获取 t 函数和 locale 响应式变量
    const { t, locale } = useI18n();
    
    // 切换语言
    const toggleLang = () => {
      locale.value = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN';
    };
    </script>
    
    <template>
      <!-- 使用翻译 -->
      <h1>{{ t('common.welcome') }}</h1>
      <button @click="toggleLang">Switch Language</button>
    </template>
    ```

3.  **添加翻译**:
    只需修改 `packages/i18n/locales/` 下的 JSON 文件即可。得益于 Monorepo 的结构，修改后所有引用了该包的应用都会自动热更新。

### 6. API 客户端设计模式

为了实现最大程度的解耦和可复用性，项目采用了一种基于工厂函数和依赖注入的 API 客户端设计模式。

**核心理念**:

*   **分离职责**:
    *   **应用层 (`apps/*`)**: 负责创建和配置 `httpClient` 实例，因为它知道具体的 `baseURL`、`token` 管理方式和 UI 反馈（如 `showError`）。
    *   **`@trs/fetch` 包**: 提供纯粹的、与具体项目业务无关的 API 函数定义。它不包含任何 `axios` 实例。
    *   **`@trs/ui` 包**: UI 组件接收一个已经创建好的 `api` 客户端作为 `prop`，并直接调用其方法，无需关心请求是如何被发送的。

**两个核心工厂函数**:

1.  **`createHttpClient(options)`**:
    *   **输入**: `baseUrl` 和一个包含 `getToken`, `showError` 等应用层具体实现的 `handlers` 对象。
    *   **输出**: 一个配置了完整拦截器（Token 注入、全局 Loading、统一错误处理等）的 `axios` 实例。

2.  **`createApi(httpClient)`**:
    *   **输入**: 一个由 `createHttpClient` 创建的 `axios` 实例。
    *   **输出**: 一个完整的、类型安全的 API 客户端。该客户端聚合了所有在 `packages/fetch/api/` 目录下定义的 API 模块。

**工作流程示例**:

1.  **定义 API (`packages/fetch/api/resource.js`)**:
    API 模块导出一个接收 `httpClient` 的工厂函数。
    ```javascript
    // packages/fetch/api/resource.js
    export default function createResourceApi(httpClient) {
      return {
        getResourceList(page_code, params) {
          return httpClient({ url: `/resources/${page_code}`, ... });
        },
      };
    }
    ```

2.  **创建并注入 (`apps/admin/src/main.js` 或组件内)**:
    在应用层，创建 `httpClient` 和 `api` 客户端。
    ```javascript
    // apps/admin/src/main.js (或任何初始化的地方)
    import { createHttpClient, createApi } from '@trs/fetch';
    import { getToken } from './stores/auth'; // 应用层的具体实现

    const httpClient = createHttpClient({
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      handlers: { getToken }
    });

    const api = createApi(httpClient);

    // 然后可以将 `api` 注入到整个应用中
    // app.provide('api', api);
    ```

3.  **在 UI 组件中使用 (`packages/ui/src/ListPage.vue`)**:
    UI 组件通过 `props` 接收 `api` 客户端。
    ```vue
    <!-- packages/ui/src/ListPage.vue -->
    <script setup>
    const props = defineProps({
      api: { type: Object, required: true }
    });

    async function fetchData() {
      // 直接调用，无需关心 httpClient 的实现细节
      const response = await props.api.getResourceList(...);
    }
    </script>
    ```

这种模式确保了共享包 (`fetch`, `ui`) 的纯粹性和通用性，使得它们可以被任何项目复用，而与项目相关的配置和实现则完全保留在应用层。

**核心功能：**

-   **统一实例创建**: 通过 `createHttpClient` 函数创建一个携带通用拦截器的 `axios` 实例。
-   **请求拦截器**:
    -   自动为请求头注入 `Authorization` (Bearer Token)。
    -   自动为 `GET` 请求添加时间戳以防止缓存。
    -   自动注入浏览器指纹 (`X-Browser-Fingerprint`)，可用于安全风控。
-   **响应拦截器**:
    -   自动处理后端返回的业务错误码（如 `code !== 200`）。
    -   自动处理 `401` (Token 失效)、`403` (无权限)、`500` (服务器错误) 等 HTTP 状态码。
    -   成功时自动提取响应体中的 `data` 部分，简化业务代码。
-   **逻辑解耦**: 通过 `handlers` 参数将具体的实现（如如何获取 Token、如何显示 Loading）与封装本身解耦，使得该包可以被任何框架（Vue, React）或无框架的 JS/TS 项目使用。

**使用方法：**

在你的应用中（例如 `apps/APP1/src/api.ts`），你可以这样使用它来构建你的 API 服务：

```typescript
import { createHttpClient, createApi } from "@trs/fetch";
import { useAuthStore } from "@/stores/auth";

// 1. 定义处理器，将 store 的 actions 与 fetch 包解耦
const handlers = {
  getToken: () => {
    const authStore = useAuthStore();
    return authStore.token;
  },
  clearToken: () => {
    const authStore = useAuthStore();
    authStore.clearToken();
  },
  // ... 其他处理器，如 showLoading, showError 等
};

// 2. 创建 http 客户端实例
const httpClient = createHttpClient({
  baseUrl: import.meta.env.VITE_API_URL, // 从环境变量读取 API 地址
  handlers,
});

// 3. 使用 createApi 创建结构化的 API 服务
const api = createApi(httpClient);

// 4. 在业务代码中调用
// api.auth.login({ username: 'admin', password: 'password' });
// api.user.getList();

export default api;
```

### 一个重要的陷阱：`dependsOn` 的缺失

这是一个非常容易被忽略但至关重要的配置。理解它能帮你避免在增量部署时遇到困惑。

**问题场景：**
假设你只修改了 `app1` 的代码，然后运行增量部署命令：
```bash
pnpm deploy:prod --filter="...[HEAD~1]"
```
你期望的结果是**只有 `app1`** 被构建和部署。

但是，如果你的 `turbo.json` 中 `deploy:prod` 任务是这样配置的（缺少 `dependsOn`）：
```json
// turbo.json (错误配置)
"deploy:prod": {
  "cache": false
}
```
你会发现，`app1`、`app2` 以及**所有**定义了 `deploy:prod` 脚本的应用都会被执行。

**原因剖析：**
`--filter` 确实正确地告诉了 `turbo` 变更的“起点”在 `app1`。但由于 `deploy:prod` 任务在 `turbo` 的“任务地图”上是一个孤立的点，`turbo` 不知道这个任务是否依赖于其他包（如 `@trs/ui`）的构建产物。

出于安全考虑，`turbo` 会采取最保守的策略：它会认为所有定义了 `deploy:prod` 脚本的包都可能是相关的，因此在所有这些包中都执行该任务，以防止因缺少潜在的、未声明的依赖而导致部署失败。

**最终的正确配置：**

经过反复调试，我们发现除了 `dependsOn`，还有一个更关键的因素：`"cache": false`。

`"cache": false` 的优先级非常高，它会强制 `turbo` 在所有匹配的包中无条件执行该任务，这使得 `--filter` 的筛选能力失效。

因此，最终的、能让增量部署完美工作的配置是：
```json
// turbo.json (最终正确配置)
"deploy:prod": {
  "dependsOn": ["build:prod"]
}
```
**不要**添加 `"cache": false`。

这样，`turbo` 才能完全利用它的依赖图和缓存系统：当它发现 `app2` 的 `build:prod` 任务命中缓存（`CACHE HIT`）时，它会顺理成章地将依赖于此的 `app2` 的 `deploy:prod` 任务也标记为缓存命中，从而**真正地跳过**该任务的执行。

##  快速开始

> **⚠️ 重要原则：始终在根目录执行命令**
>
> 在这个 Monorepo 项目中，所有的 `pnpm` 和 `turbo` 命令（如安装依赖、启动服务、构建、部署等）都应该在**项目根目录**下执行。这是确保 pnpm 工作空间和 Turborepo 任务调度正常工作的关键。请不要 `cd` 到子目录（如 `apps/app1`）中去执行这些命令。

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
- `pnpm build`: 检查**所有**应用和包，并利用缓存，只重新构建那些发生变化的部分。
- `pnpm lint`: 对整个项目进行代码风格检查并自动修复。

> **`build` 和 `deploy` 的行为区别**
>
> - **`pnpm build` (不带 filter)**: `turbo` 会检查**所有**包。对于未变更的 `app2`，其 `build` 任务会命中缓存 (`CACHE HIT`)，`turbo` 会跳过构建，这个行为是符合直觉的。
> - **`pnpm deploy:prod` (不带 filter)**: `turbo` 同样会检查**所有**包。但 `deploy` 是一个有“副作用”的动作（比如调用外部 API）。`turbo` 的缓存系统主要是为了可复现的构建（`build`），而不是为了有副作用的操作。因此，即使 `app2` 的 `build` 命中了缓存，`turbo` 仍然可能会执行 `app2` 的 `deploy` 脚本，因为它无法缓存“部署”这个动作本身。
>
> **结论**：对于 `build` 这种可缓存的任务，可以不带 `--filter`。但对于 `deploy` 这种包含副作用、需要精确控制执行范围的任务链，**必须使用 `--filter`** 来从源头上告诉 `turbo`：“今天只考虑这几个包，其他的完全不用看”，这样才能实现精确的增量部署。

### 为特定应用/包安装依赖

在 Monorepo 中，你不应该 `cd`到子项目目录去安装依赖。正确的做法是**始终在根目录**，使用 `pnpm` 的 `--filter` 标志来指定目标。

**语法：** `pnpm add <package-name> --filter <app-or-package-name>`

**示例：**
- **为 `app1` 添加一个新的生产依赖 `axios`**:
  ```bash
  pnpm add axios --filter app1
  ```
- **为 `@trs/ui` 包添加一个新的开发依赖 `less`**:
  ```bash
  pnpm add less -D --filter @trs/ui
  ```
`pnpm` 会自动找到对应的 `package.json` 并更新它。

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
    "deploy:dev": "bash ../../scripts/deploy.sh APP_NAME dev",
    "deploy:prod": "bash ../../scripts/deploy.sh APP_NAME prod",
    "lint": "eslint ."
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


## 高级用法：增量执行

Turborepo 最强大的功能之一就是能够只在“受影响”的工作空间上执行任务。这通常通过 `--filter` 标志和 Git 历史记录来实现。

### 场景一：增量构建与部署

**目标**：当我们只修改了 `app1` 时，我们希望只构建和部署 `app1`，而完全跳过 `app2`。

**最终的正确工作流**：

1.  **确保 `turbo.json` 配置正确**：
    *   任务之间必须有明确的 `dependsOn` 依赖关系。
    *   **不要**为需要增量执行的任务（如 `deploy`）设置 `"cache": false`。
    ```json
    // turbo.json (正确配置)
    "deploy:prod": {
      "dependsOn": ["build:prod"]
    }
    ```

2.  **确保 Git 工作区干净**：
    在执行增量命令前，请确保没有未提交的、可能影响所有包的全局文件变更（例如对根 `package.json` 或 `pnpm-lock.yaml` 的修改）。一个“脏”的 `package.json` 会让 `turbo` 认为所有包都受到了影响。

3.  **在命令行中使用过滤器**：
    *   **部署特性分支的全部变更 (最推荐)**:
        在日常开发中，我们通常在特性分支（feature branch）上进行多次提交。当需要部署整个特性分支的变更时，最佳实践是将其与主干分支（如 `main`）进行比较。
        ```bash
        # 确保你的 main 分支是远程最新的
        git fetch origin main
        
        # 部署当前分支相较于 main 分支的所有变更
        pnpm deploy:prod --filter="...[origin/main]"
        ```
        这个命令能准确地包含你在特性分支上的所有提交，无论是一个还是多个。

### 场景二：CI/CD 中的自动化统一增量部署

在拥有多个目标环境（如 `dev` 环境对应 `dev` 分支，`prod` 环境对应 `main` 分支）的项目中，我们希望有一个统一的命令逻辑来处理增量部署。

这可以通过结合 CI/CD 平台的环境变量来实现。`git` 命令本身无法自动推断目标分支，但 CI/CD 平台可以告诉我们。

**工作流：**

1.  在 CI/CD 平台（如 GitHub Actions）中，配置一个工作流，让它在代码推送到 `main` 和 `dev` 分支时触发。
2.  在工作流的执行脚本中，使用平台提供的内置变量（如 `github.ref_name`）来动态构建 `filter` 参数。

**GitHub Actions 示例 (`.github/workflows/deploy.yml`)**
```yaml
# .github/workflows/deploy.yml
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
      # ... 省略 checkout, setup pnpm, install 等步骤 ...

      - name: Deploy changed apps
        run: |
          # ${{ github.ref_name }} 会被 GitHub Actions 自动替换为
          # 触发流水线的的分支名，即 'main' 或 'dev'。
          # 这样就实现了用一个命令，自动与正确的目标分支进行比较。
          pnpm deploy:prod --filter="...[origin/${{ github.ref_name }}]"
```

通过这种方式，您无需在本地或 CI/CD 中维护多个不同的部署命令，实现了真正的自动化和统一化。

遵循以上步骤，`turbo` 就能够精确地识别出只有 `app1` 发生了变化，并智能地跳过所有与 `app2` 相关的任务。

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
