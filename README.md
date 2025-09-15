# Monorepo 项目说明

基于 pnpm 和 Turborepo 的 Monorepo 结构，旨在支持多应用、多共享库的开发模式。

## 核心技术栈

*   **包管理器**: [pnpm](https://pnpm.io/) - 利用其高效的依赖管理和对 Monorepo 的原生支持。
*   **构建工具**: [Turborepo](https://turbo.build/) - 用于优化和加速 Monorepo 中的构建、测试和开发流程。

## 项目结构

```
.
├── apps/
│   └── web/         # 现有的 Vue3 应用
├── packages/
│   ├── ui/          # (未来) 共享组件库
│   └── utils/       # (未来) 共享工具函数
├── package.json     # 根 package.json，定义工作区和顶层脚本
├── pnpm-workspace.yaml # pnpm 工作区配置文件
└── turbo.json       # Turborepo 任务流配置文件
```

*   `apps`: 存放各个独立的应用（例如网站、后台管理系统等）。
*   `packages`: 存放可被多个 `apps` 共享的代码库（例如公共组件、工具函数、配置等）。

---

## 常用命令

*   `pnpm install`: 在根目录执行，安装所有工作区的依赖。
*   `pnpm dev`: 启动所有应用的开发模式。
*   `pnpm build`: 构建所有应用和包。

---

## 持续部署 (CI/CD) 方案

在 Monorepo 架构中，CI/CD 的核心是**按需部署**，即只部署发生变更或受变更影响的应用。以下是两种推荐的实现方案。

### 方案一：利用 Turborepo 执行部署（推荐）

这是最优雅、最贴合项目技术栈的方案。它将“识别变更”的复杂逻辑完全交给 Turborepo 处理。

**核心思想：**

在每个可部署的应用（如 `apps/web`）的 `package.json` 中定义一个 `deploy` 脚本，该脚本包含构建和部署的完整命令。然后，在 CI/CD 流程中，使用一个 `turbo` 命令来自动触发所有受影响应用的 `deploy` 脚本。

**步骤：**

1.  **定义 `deploy` 脚本：**
    在 `apps/web/package.json` 中：
    ```json
    "scripts": {
      "deploy": "pnpm build && vercel deploy --prod"
    }
    ```

2.  **在 CI/CD 中执行命令：**
    当代码合并到主分支后，CI/CD 服务器只需执行以下命令：
    ```bash
    # Turborepo 会自动计算出自 origin/main 以来的所有变更，
    # 并执行受影响应用中的 "deploy" 脚本。
    turbo run deploy --filter="...[origin/main]"
    ```

**优势：**
*   **极其简洁**：CI/CD 脚本非常简单，只需一行核心命令。
*   **精确可靠**：完美利用 Turborepo 的依赖关系图，确保所有受影响的应用（包括间接依赖）都被部署。
*   **自动化**：无需手动编写复杂的变更检测脚本。

### 方案二：使用 `git diff` 结合脚本解析

这是一种更通用的方法，不强依赖于 Turborepo 的部署任务，但需要手动编写脚本来解析变更。

**核心思想：**

1.  使用 `git diff` 命令获取与主分支相比发生变化的文件列表。
2.  编写脚本分析这些文件路径，以确定哪些应用 (`apps/*`) 或共享包 (`packages/*`) 被修改。
3.  如果共享包被修改，需要进一步分析哪些应用依赖于该共享包。
4.  根据分析结果，生成需要部署的应用列表，并依次执行它们的部署命令。

**示例脚本逻辑：**

```bash
# 1. 获取变更文件
CHANGED_FILES=$(git diff --name-only origin/main HEAD)

# 2. (伪代码) 分析文件，找出需要部署的应用
AFFECTED_APPS=()
for file in $CHANGED_FILES; do
  # 如果是 apps/web 下的文件，则将 web 添加到列表
  # 如果是 packages/ui 下的文件，则将所有依赖 ui 的应用（如 web）添加到列表
  ...
done

# 3. 循环部署
for app in $AFFECTED_APPS; do
  echo "Deploying $app..."
  # 执行具体部署命令，如 cd apps/$app && pnpm deploy
done
```

**优势：**
*   **灵活性高**：不依赖任何特定的构建工具。

**劣势：**
*   **维护成本高**：需要手动维护应用与共享包之间的依赖关系，容易出错。
*   **脚本复杂**：变更检测逻辑需要自己实现，较为繁琐。

**结论：** 强烈推荐使用 **方案一**，因为它能最大限度地发挥 Monorepo 和 Turborepo 工具链的优势，实现真正高效、可靠的自动化部署。



1. 环境配置文件抽离统一管理 示例 实现一个env 管理所有项目/库的配置参数