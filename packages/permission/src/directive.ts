import type { App, DirectiveBinding } from 'vue'
import type { PermissionString } from './index'
import process from 'node:process'
import { hasPermission } from './index'

// 定义一个 Pinia Store 的基础接口，以便在指令中进行类型约束
// 具体的 store 实现由应用层提供
interface AuthStore {
  permissions: PermissionString[]
}

/**
 * 检查权限并处理 DOM 元素
 * @param el - 指令绑定的 DOM 元素
 * @param binding - 指令的绑定对象
 * @param getAuthStore - 一个返回认证 store 实例的函数
 */
function checkPermission(el: HTMLElement, binding: DirectiveBinding<PermissionString>, getAuthStore: () => AuthStore) {
  // 确保 el 是一个有效的 HTMLElement
  if (!(el instanceof HTMLElement)) {
    return
  }

  const { value: requiredPermission } = binding
  const authStore = getAuthStore()
  const userPermissions = authStore.permissions || []

  if (requiredPermission && requiredPermission.length > 0) {
    const hasRequiredPermission = hasPermission(userPermissions, requiredPermission)

    // 保存原始的 display 样式
    if (!el.hasAttribute('data-original-display')) {
      el.setAttribute('data-original-display', el.style.display || '')
    }

    if (hasRequiredPermission) {
      // 恢复原始的 display 样式
      el.style.display = el.getAttribute('data-original-display') || ''
    }
    else {
      // 隐藏元素而不是移除它
      el.style.display = 'none'
    }
  }
  else {
    // 在开发模式下给出更明确的错误提示
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[v-permission] requires a value! Like v-permission="'page:user:create'"`)
    }
  }
}

/**
 * 安装 Vue 权限指令
 * @param app - Vue 应用实例
 * @param options - 配置选项
 * @param options.getAuthStore - 一个返回 Pinia auth store 实例的函数。
 *                               这是为了将指令与具体的应用状态管理解耦。
 */
export default function setupPermissionDirective(app: App, options: { getAuthStore: () => AuthStore }) {
  if (!options || typeof options.getAuthStore !== 'function') {
    throw new Error('[setupPermissionDirective] options.getAuthStore is required.')
  }

  app.directive('permission', {
    mounted(el: HTMLElement, binding: DirectiveBinding<PermissionString>) {
      checkPermission(el, binding, options.getAuthStore)
    },
    updated(el: HTMLElement, binding: DirectiveBinding<PermissionString>) {
      checkPermission(el, binding, options.getAuthStore)
    },
  })
}
