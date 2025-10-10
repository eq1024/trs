import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import axios from 'axios'

// --- Type Definitions ---

/**
 * 应用层需要提供的处理器，用于解耦
 */
export interface IHttpHandlers {
  getToken?: () => string | null
  clearToken?: () => void
  showLoading?: () => void
  hideLoading?: () => void
  showError?: (message: string) => void
  redirectToLogin?: () => void
}

/**
 * `createHttpClient` 函数的配置选项
 */
export interface IHttpClientOptions {
  baseUrl: string
  handlers?: IHttpHandlers
}

/**
 * 后端返回的基础数据结构
 */
export interface IApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// --- Fingerprint Utility ---

let fingerprintCache: string | null = null
async function getFingerprint(): Promise<string | null> {
  if (fingerprintCache)
    return fingerprintCache
  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    fingerprintCache = result.visitorId
    return fingerprintCache
  }
  catch (error) {
    console.error('Failed to get browser fingerprint:', error)
    return null
  }
}

// --- Core HttpClient ---

/**
 * 创建一个配置好的 axios 实例
 * @param options - 配置选项
 * @returns {AxiosInstance}
 */
export function createHttpClient({
  baseUrl,
  handlers = {},
}: IHttpClientOptions): AxiosInstance {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 120000, // 120s
  })

  // Request Interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      handlers.showLoading?.()

      // 注入 Token
      const token = handlers.getToken?.()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 注入浏览器指纹
      const fingerprint = await getFingerprint()
      if (fingerprint) {
        config.headers['X-Browser-Fingerprint'] = fingerprint
      }

      // 为 GET 请求添加时间戳，防止缓存
      if (config.method?.toLowerCase() === 'get') {
        config.params = { ...config.params, _t: Date.now() }
      }

      return config
    },
    (error: any) => {
      handlers.hideLoading?.()
      return Promise.reject(error)
    },
  )

  // Response Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse<IApiResponse>) => {
      handlers.hideLoading?.()
      const { data } = response

      // 统一响应格式，但 code 不为 200，视为业务错误
      if (data && typeof data.code === 'number' && data.code !== 200) {
        // Token 失效或无效
        if (data.code === 40002) {
          handlers.showError?.(data.message || 'Authentication expired, please log in again.')
          handlers.clearToken?.()
          handlers.redirectToLogin?.()
        }
        else {
          // 其他业务错误
          handlers.showError?.(data.message || `Error: ${data.code}`)
        }
        // 抛出业务错误，中断 then 链
        return Promise.reject(data)
      }

      // 成功时，直接返回 data 部分，简化业务代码
      return data.data
    },
    (error: any) => {
      handlers.hideLoading?.()

      if (error.response) {
        // HTTP 状态码错误
        const { status } = error.response
        switch (status) {
          case 401:
            handlers.showError?.('Unauthorized, please log in.')
            handlers.clearToken?.()
            handlers.redirectToLogin?.()
            break
          case 403:
            handlers.showError?.('Access denied.')
            break
          case 500:
          case 502:
          case 503:
            handlers.showError?.('Internal server error.')
            break
          default:
            handlers.showError?.(`Request failed with status code ${status}`)
        }
      }
      else if (error.request) {
        // 请求已发出，但没有收到响应
        handlers.showError?.('Network error, no response from server.')
      }
      else {
        // 设置请求时发生了一些事情，触发了错误
        handlers.showError?.(`Request error: ${error.message}`)
      }

      return Promise.reject(error)
    },
  )

  return instance
}

/**
 * 创建一个结构化的 API 客户端
 * @param httpClient - 配置好的 axios 实例
 * @returns 一个包含所有 API 方法的对象
 * @description
 * 这里我们只定义结构和 mock 实现，具体的 API 应该在应用中根据 swagger 或后端定义来填充。
 * 这是为了演示如何使用，并为后续开发提供一个清晰的模式。
 */
export function createApi(httpClient: AxiosInstance) {
  return {
    // 模拟用户认证相关接口
    auth: {
      /**
       * 用户登录
       * @param data - 登录凭据
       * @returns {Promise<{ token: string }>}
       */
      login: (data: Record<string, any>): Promise<{ token: string }> => {
        console.log('Mock login with:', data)
        // return httpClient.post('/auth/login', data);
        return Promise.resolve({ token: 'mock-jwt-token-string' })
      },
      /**
       * 获取当前用户信息
       * @returns {Promise<any>}
       */
      getProfile: (): Promise<any> => {
        console.log('Mock getProfile')
        // return httpClient.get('/auth/profile');
        return Promise.resolve({
          id: 'user-001',
          username: 'trs-admin',
          roles: ['admin'],
          permissions: ['page:dashboard:view', 'btn:user:create', '*'], // 使用 * 进行演示
        })
      },
    },
    // 模拟用户管理相关接口
    user: {
      /**
       * 获取用户列表
       * @param params - 查询参数
       */
      getList: (params?: Record<string, any>): Promise<any[]> => {
        console.log('Mock get user list with params:', params)
        // return httpClient.get('/users', { params });
        return Promise.resolve([
          { id: 'user-001', username: 'trs-admin', email: 'admin@trs.com' },
          { id: 'user-002', username: 'trs-dev', email: 'dev@trs.com' },
        ])
      },
    },
    test: {
      /**
       * 测试接口
       * @param data - 测试数据
       * @returns {Promise<any>}
       */
      echo: (data: Record<string, any>): Promise<any> => {
        console.log('Mock echo with:', data)
        return httpClient.post('/test/echo', data)
      },
    },
  }
}
