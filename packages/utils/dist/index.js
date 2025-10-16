"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  closeSSEConnection: () => closeSSEConnection,
  subscribeToSSE: () => subscribeToSSE
});
module.exports = __toCommonJS(index_exports);

// src/sse.ts
var import_config = require("@trs/config");
var SSE_URL = (0, import_config.appConfig)("VITE_SSE_URL") || (0, import_config.appConfig)("NEXT_PUBLIC_SSE_URL") || "http://localhost:3000/api/sse";
SSE_URL += "?userID=3";
var sseConnection = null;
function getGlobalConnection() {
  if (sseConnection) {
    return sseConnection;
  }
  if (typeof window === "undefined" || !window.EventSource) {
    console.error("EventSource is not supported in this environment.");
    sseConnection = { eventSource: null, listeners: /* @__PURE__ */ new Map() };
    return sseConnection;
  }
  console.log(`Initializing global SSE connection to: ${SSE_URL}`);
  const eventSource = new EventSource(SSE_URL);
  const listeners = /* @__PURE__ */ new Map();
  sseConnection = { eventSource, listeners };
  eventSource.onmessage = (event) => {
    console.log(`Received default message:`, event.data);
  };
  eventSource.onerror = (error) => {
    console.error(`Global EventSource failed:`, error);
    eventSource.close();
    sseConnection = null;
  };
  return sseConnection;
}
function subscribeToSSE(eventName, onMessage) {
  if (typeof onMessage !== "function") {
    console.error("onMessage callback must be a function.");
    return () => {
    };
  }
  const { eventSource, listeners } = getGlobalConnection();
  if (!eventSource) {
    return () => {
    };
  }
  const handler = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      onMessage(error || event.data);
    }
  };
  if (!listeners.has(eventName)) {
    const handlers = /* @__PURE__ */ new Set();
    const masterHandler = (event) => {
      handlers.forEach((h) => h(event));
    };
    eventSource.addEventListener(eventName, masterHandler);
    listeners.set(eventName, { handlers, masterHandler });
  }
  const listenerInfo = listeners.get(eventName);
  listenerInfo.handlers.add(handler);
  const unsubscribe = () => {
    if (listeners.has(eventName)) {
      const currentListenerInfo = listeners.get(eventName);
      currentListenerInfo.handlers.delete(handler);
      console.warn(`Unsubscribed a handler from event "${eventName}".`);
      if (currentListenerInfo.handlers.size === 0) {
        eventSource.removeEventListener(eventName, currentListenerInfo.masterHandler);
        listeners.delete(eventName);
        console.warn(`All handlers for event "${eventName}" have been removed. Event listener detached.`);
      }
    }
  };
  return unsubscribe;
}
function closeSSEConnection() {
  if (sseConnection && sseConnection.eventSource) {
    sseConnection.eventSource.close();
    sseConnection.listeners.clear();
    sseConnection = null;
    console.warn(`Global SSE connection to ${SSE_URL} closed.`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  closeSSEConnection,
  subscribeToSSE
});
//# sourceMappingURL=index.js.map