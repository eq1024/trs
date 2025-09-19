# Monorepo 构建流程 Q&A

本文档总结了在配置 Turborepo 项目构建流程时遇到的一系列问题和最佳实践。

## Q1: 为什么 `packages` 目录下的包需要 `build` 脚本？

**A:** 因为 `packages` 中的代码（如 TypeScript `.ts` 文件、Vue `.vue` 文件）通常不是标准的 JavaScript，不能被浏览器或 Node.js 直接运行。`build` 脚本负责将这些源码**编译**成标准的、可在任何地方运行的 JavaScript（如 CJS 和 ESM 格式）。

这样做的好处是：
1.  **解耦**：让 `packages` 成为独立的、可发布的标准库，不依赖于任何特定的消费方（app）。
2.  **性能**：允许 Turborepo 缓存 `packages` 的构建产物 (`dist` 目录)。当多个 app 依赖同一个 package 时，它只需被构建一次，大大提升整体构建速度。
3.  **兼容性**：确保产物是标准格式，可以在不同环境（浏览器、Node.js、测试环境）下使用。

---

## Q2: 为什么在修复配置前，`pnpm build` 也能成功？

**A:** 这是因为消费方 `app` 的 Vite 构建环境起了作用。在打包 `app` 时，Vite 发现它依赖的 `package` 是源码（如 `.vue` 文件），于是就用自己（`app`）的 Vite 配置（如 Vue 插件）“顺手”把这个源码给编译了。

这种方式虽然“碰巧”能工作，但有严重缺陷：
*   **性能极差**：每个 `app` 都会重复编译所有依赖的 `package` 源码，无法利用 Turborepo 缓存。
*   **架构脆弱**：`package` 的可构建性完全依赖于 `app` 的技术栈，失去了独立性和可移植性。

---

## Q3: `tsup` 是什么？为什么要用它？

**A:** `tsup` 是一个基于 esbuild 的、零配置的打包工具，非常适合打包 JS/TS 库。

我们用它的核心原因：
*   **简单快速**：无需复杂配置即可完成打包。
*   **双格式输出**：一条命令就能同时生成 CJS 和 ESM 两种格式的产物。
*   **自动生成类型**：能从 TypeScript 或 JSDoc 注释中自动生成 `.d.ts` 类型声明文件，提供完美的类型提示和检查。

---

## Q4: 为什么要打包出 CJS (`.cjs.js`) 和 ESM (`.mjs`) 两种格式？

**A:** 为了最大化兼容性，适应 JavaScript 生态中并存的新旧两种模块系统。

*   **ESM (`import`/`export`)**: 现代标准，被所有现代浏览器和构建工具（Vite）原生支持，能实现 `Tree Shaking` 优化。
*   **CJS (`require`/`module.exports`)**: Node.js 的传统标准，用于兼容旧的 Node.js 环境、测试框架（如 Jest）或服务端脚本。

在 `package.json` 的 `exports` 字段中同时指定这两种格式的入口，可以让同一个包无缝地被不同环境的消费者使用。

---

## Q5: Vite 能处理 CJS 格式的依赖吗？

**A:** 是的，Vite 非常智能。
*   在**开发环境**，它会通过 `esbuild` 实时地将 CJS 依赖转换为 ESM 再发送给浏览器。
*   在**生产环境**，它会通过内置的 `@rollup/plugin-commonjs` 插件将 CJS 依赖转换为 ESM 再进行打包。

尽管 Vite 能处理 CJS，但为它优先提供 ESM 格式能让其预构建和 Tree Shaking 等优化工作得更高效。提供双格式是面向未来的、更健壮的架构选择。

---

## Q6: 为什么有时 `turbo run build` 不会构建某个 package？

**A:** 因为 Turborepo 非常智能，它会**精确地按需构建**。

Turborepo 通过分析 `package.json` 中的 `dependencies` 和 `devDependencies` 来构建一个任务依赖图。当执行一个任务（如 `pnpm build:dev`）时，它只会构建**该任务实际依赖链**上的包。

在我们的例子中，一开始 `@trs/fetch` 没有被构建，是因为 `app1` 和 `app2` 的 `package.json` 中没有声明对它的依赖。当我们把 `@trs/fetch` 添加到 `app1` 的依赖后，Turborepo 就在构建 `app1` 之前自动地先构建了 `@trs/fetch`。

**结论：** Turborepo 的构建行为严格遵循 `package.json` 中声明的依赖关系，而不是源码中的 `import` 语句。

---

## Q7: 为什么 TypeScript 包（如 `@trs/fetch`）在构建时会报 `Cannot find module 'xxx'`？

**A:** 这通常发生在 `build` 脚本（如 `tsup`）调用 TypeScript 编译器（`tsc`）时，`tsc` 找不到依赖项的类型定义。

**原因：** `tsc` 需要一个 `tsconfig.json` 文件来指导它的编译和模块解析行为。如果没有这个文件，它可能不知道如何正确地在 `node_modules` 中查找依赖（如 `axios`）及其附带的类型声明。

**解决方案：** 在需要编译 TypeScript 的 `package` 根目录下创建一个 `tsconfig.json` 文件，并至少配置 `"moduleResolution": "Node"`（或 `NodeNext`），以告诉 `tsc` 采用 Node.js 的模块解析策略。

---

## Q8: 最终方案：如何兼得开发体验和生产健壮性？ (混合模式)

**A:** 我们最终采用了一种高阶的“混合模式”，以求达到两全其美的效果。

*   **开发模式 (`pnpm dev`)**: 我们修改了 `app` 的 `vite.config.js`，利用 `resolve.alias` 配置，在**开发时**强制 Vite 将对 `@trs/xxx` 的请求解析到其**源码**目录（如 `packages/xxx/src`）。这使得 `app` 的 Vite 开发服务器能够直接处理 `package` 的源码，提供了最无缝、最快速的热更新（HMR）体验。

*   **生产模式 (`pnpm build:prod`)**: 在**生产打包时**，我们**不使用**上述的路径别名。Vite 会回退到标准行为，即遵循 `package` 的 `package.json` 中的 `exports` 字段，去消费 `dist` 目录中**预先构建好**的标准产物。这保证了生产构建的健壮性、确定性，并能利用 Turborepo 的缓存。

**风险提示**: 这种模式的唯一代价是牺牲了“开发/生产环境的完全一致性”。一个存在于 `package` 构建脚本中的 bug，在 `dev` 模式下不会被发现，只会在执行 `build` 时才暴露出来。这需要团队有一定的纪律性，在正式合并代码前执行一次完整的 `build` 来确保一切正常。
