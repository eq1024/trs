// src/sse.ts
import { appConfig } from "@trs/config";
var SSE_URL = appConfig("VITE_SSE_URL") || appConfig("NEXT_PUBLIC_SSE_URL") || "http://localhost:3000/api/sse";
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
export {
  closeSSEConnection,
  subscribeToSSE
};
//# sourceMappingURL=index.mjs.map