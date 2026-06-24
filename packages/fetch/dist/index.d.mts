import { AxiosInstance } from 'axios';

/**
 * 应用层需要提供的处理器，用于解耦
 */
interface IHttpHandlers {
    getToken?: () => string | null;
    clearToken?: () => void;
    showLoading?: () => void;
    hideLoading?: () => void;
    showError?: (message: string) => void;
    redirectToLogin?: () => void;
}
/**
 * `createHttpClient` 函数的配置选项
 */
interface IHttpClientOptions {
    baseUrl: string;
    handlers?: IHttpHandlers;
}
/**
 * 后端返回的基础数据结构
 */
interface IApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}
/**
 * 创建一个配置好的 axios 实例
 * @param options - 配置选项
 * @returns {AxiosInstance}
 */
declare function createHttpClient({ baseUrl, handlers, }: IHttpClientOptions): AxiosInstance;
/**
 * 创建一个结构化的 API 客户端
 * @param httpClient - 配置好的 axios 实例
 * @returns 一个包含所有 API 方法的对象
 * @description
 * 这里我们只定义结构和 mock 实现，具体的 API 应该在应用中根据 swagger 或后端定义来填充。
 * 这是为了演示如何使用，并为后续开发提供一个清晰的模式。
 */
declare function createApi(httpClient: AxiosInstance): {
    auth: {
        /**
         * 用户登录
         * @param data - 登录凭据
         * @returns {Promise<{ token: string }>}
         */
        login: (data: Record<string, any>) => Promise<{
            token: string;
        }>;
        /**
         * 获取当前用户信息
         * @returns {Promise<any>}
         */
        getProfile: () => Promise<any>;
    };
    user: {
        /**
         * 获取用户列表
         * @param params - 查询参数
         */
        getList: (params?: Record<string, any>) => Promise<any[]>;
    };
    test: {
        /**
         * 测试接口
         * @param data - 测试数据
         * @returns {Promise<any>}
         */
        echo: (data: Record<string, any>) => Promise<any>;
    };
};

export { type IApiResponse, type IHttpClientOptions, type IHttpHandlers, createApi, createHttpClient };
