"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  createApi: () => createApi,
  createHttpClient: () => createHttpClient
});
module.exports = __toCommonJS(index_exports);
var import_fingerprintjs = __toESM(require("@fingerprintjs/fingerprintjs"));
var import_axios = __toESM(require("axios"));
var fingerprintCache = null;
async function getFingerprint() {
  if (fingerprintCache)
    return fingerprintCache;
  try {
    const fp = await import_fingerprintjs.default.load();
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
  const instance = import_axios.default.create({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createApi,
  createHttpClient
});
