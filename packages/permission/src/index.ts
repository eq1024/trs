/**
 * @file 权限控制核心逻辑
 * @description 提供了权限检查函数和相关的类型定义。
 */

/**
 * 权限标识
 * @example 'page:user:list', 'btn:user:create'
 */
export type PermissionString = string

/**
 * 检查用户是否拥有指定权限
 * @param {PermissionString[]} userPermissions - 用户拥有的所有权限标识
 * @param {PermissionString} requiredPermission - 需要检查的权限标识
 * @returns {boolean} 是否拥有权限
 */
export function hasPermission(userPermissions: PermissionString[], requiredPermission: PermissionString): boolean {
  if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
    return false
  }
  // 拥有通配符 '*' 权限则代表拥有所有权限
  if (userPermissions.includes('*')) {
    return true
  }
  return userPermissions.includes(requiredPermission)
}

// 导出指令安装函数，将在 directive.ts 中定义
export { default as setupPermissionDirective } from './directive'

// --- Type Definitions ---

/**
 * 权限类型
 * - `page`: 页面访问权限
 * - `btn`: 按钮操作权限
 * - `api`: API接口调用权限
 */
export type PermissionType = 'page' | 'btn' | 'api'

/**
 * 权限对象接口
 */
export interface IPermission {
  /** 权限唯一标识 (e.g., 'page:user:list') */
  id: PermissionString
  /** 权限描述 */
  description: string
  /** 权限类型 */
  type: PermissionType
}

/**
 * 角色对象接口
 */
export interface IRole {
  /** 角色唯一标识 */
  id: string
  /** 角色名称 */
  name: string
  /** 角色拥有的权限标识数组 */
  permissions: PermissionString[]
}

/**
 * 用户对象接口
 */
export interface IUser {
  /** 用户唯一标识 */
  id: string
  /** 用户名 */
  username: string
  /** 用户拥有的角色标识数组 */
  roles: string[]
  /** 用户直接拥有的权限列表 (可选，通常权限通过角色赋予) */
  permissions?: PermissionString[]
}
