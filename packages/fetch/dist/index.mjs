// src/index.ts
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import axios from "axios";
var fingerprintCache = null;
async function getFingerprint() {
  if (fingerprintCache)
    return fingerprintCache;
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    fingerprintCache = result.visitorId;
    return fingerprintCache;
  } catch (error) {
    console.error("Failed to get browser fingerprint:", error);
    return null;
  }
}
function createHttpClient({
  baseUrl,
  handlers = {}
}) {
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 12e4
    // 120s
  });
  instance.interceptors.request.use(
    async (config) => {
      handlers.showLoading?.();
      const token = handlers.getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const fingerprint = await getFingerprint();
      if (fingerprint) {
        config.headers["X-Browser-Fingerprint"] = fingerprint;
      }
      if (config.method?.toLowerCase() === "get") {
        config.params = { ...config.params, _t: Date.now() };
      }
      return config;
    },
    (error) => {
      handlers.hideLoading?.();
      return Promise.reject(error);
    }
  );
  instance.interceptors.response.use(
    (response) => {
      handlers.hideLoading?.();
      const { data } = response;
      if (data && typeof data.code === "number" && data.code !== 200) {
        if (data.code === 40002) {
          handlers.showError?.(data.message || "Authentication expired, please log in again.");
          handlers.clearToken?.();
          handlers.redirectToLogin?.();
        } else {
          handlers.showError?.(data.message || `Error: ${data.code}`);
        }
        return Promise.reject(data);
      }
      return data.data;
    },
    (error) => {
      handlers.hideLoading?.();
      if (error.response) {
        const { status } = error.response;
        switch (status) {
          case 401:
            handlers.showError?.("Unauthorized, please log in.");
            handlers.clearToken?.();
            handlers.redirectToLogin?.();
            break;
          case 403:
            handlers.showError?.("Access denied.");
            break;
          case 500:
          case 502:
          case 503:
            handlers.showError?.("Internal server error.");
            break;
          default:
            handlers.showError?.(`Request failed with status code ${status}`);
        }
      } else if (error.request) {
        handlers.showError?.("Network error, no response from server.");
      } else {
        handlers.showError?.(`Request error: ${error.message}`);
      }
      return Promise.reject(error);
    }
  );
  return instance;
}
function createApi(httpClient) {
  return {
    // 模拟用户认证相关接口
    auth: {
      /**
       * 用户登录
       * @param data - 登录凭据
       * @returns {Promise<{ token: string }>}
       */
      login: (data) => {
        console.log("Mock login with:", data);
        return Promise.resolve({ token: "mock-jwt-token-string" });
      },
      /**
       * 获取当前用户信息
       * @returns {Promise<any>}
       */
      getProfile: () => {
        console.log("Mock getProfile");
        return Promise.resolve({
          id: "user-001",
          username: "trs-admin",
          roles: ["admin"],
          permissions: ["page:dashboard:view", "btn:user:create", "*"]
          // 使用 * 进行演示
        });
      }
    },
    // 模拟用户管理相关接口
    user: {
      /**
       * 获取用户列表
       * @param params - 查询参数
       */
      getList: (params) => {
        console.log("Mock get user list with params:", params);
        return Promise.resolve([
          { id: "user-001", username: "trs-admin", email: "admin@trs.com" },
          { id: "user-002", username: "trs-dev", email: "dev@trs.com" }
        ]);
      }
    },
    test: {
      /**
       * 测试接口
       * @param data - 测试数据
       * @returns {Promise<any>}
       */
      echo: (data) => {
        console.log("Mock echo with:", data);
        return httpClient.post("/test/echo", data);
      }
    }
  };
}
export {
  createApi,
  createHttpClient
};
