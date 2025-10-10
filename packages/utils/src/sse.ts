import { appConfig } from '@trs/config'

let SSE_URL: string = appConfig('VITE_SSE_URL') || appConfig('NEXT_PUBLIC_SSE_URL') || 'http://localhost:3000/api/sse'
SSE_URL += '?userID=3'

interface SseConnection {
  eventSource: EventSource | null
  listeners: Map<string, { handlers: Set<(event: MessageEvent) => void>, masterHandler: (event: MessageEvent) => void }>
}

let sseConnection: SseConnection | null = null

function getGlobalConnection(): SseConnection {
  if (sseConnection) {
    return sseConnection
  }

  if (typeof window === 'undefined' || !window.EventSource) {
    console.error('EventSource is not supported in this environment.')
    sseConnection = { eventSource: null, listeners: new Map() } // Store a virtual connection
    return sseConnection
  }

  console.log(`Initializing global SSE connection to: ${SSE_URL}`)
  const eventSource = new EventSource(SSE_URL)
  const listeners = new Map()
  sseConnection = { eventSource, listeners }

  eventSource.onmessage = (event: MessageEvent) => {
    console.log(`Received default message:`, event.data)
  }

  eventSource.onerror = (error: Event) => {
    console.error(`Global EventSource failed:`, error)
    eventSource.close()
    sseConnection = null
  }

  return sseConnection
}

/**
 * 订阅一个 Server-Sent Event。
 * @param {string} eventName - 要监听的事件名称
 * @param {(data: any) => void} onMessage - 收到消息时的回调函数
 * @returns {() => void} - 一个用于取消订阅的函数
 */
export function subscribeToSSE(eventName: string, onMessage: (data: any) => void): () => void {
  if (typeof onMessage !== 'function') {
    console.error('onMessage callback must be a function.')
    return () => {}
  }

  const { eventSource, listeners } = getGlobalConnection()

  if (!eventSource) {
    return () => {}
  }

  const handler = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      onMessage(data)
    }
    catch (error) {
      onMessage(error || event.data)
    }
  }

  if (!listeners.has(eventName)) {
    const handlers = new Set<(event: MessageEvent) => void>()
    const masterHandler = (event: MessageEvent) => {
      handlers.forEach(h => h(event))
    }
    eventSource.addEventListener(eventName, masterHandler)
    listeners.set(eventName, { handlers, masterHandler })
  }

  const listenerInfo = listeners.get(eventName)!
  listenerInfo.handlers.add(handler)

  const unsubscribe = () => {
    if (listeners.has(eventName)) {
      const currentListenerInfo = listeners.get(eventName)!
      currentListenerInfo.handlers.delete(handler)
      console.warn(`Unsubscribed a handler from event "${eventName}".`)

      if (currentListenerInfo.handlers.size === 0) {
        eventSource.removeEventListener(eventName, currentListenerInfo.masterHandler)
        listeners.delete(eventName)
        console.warn(`All handlers for event "${eventName}" have been removed. Event listener detached.`)
      }
    }
  }

  return unsubscribe
}

/**
 * 手动关闭全局的 SSE 连接。
 */
export function closeSSEConnection(): void {
  if (sseConnection && sseConnection.eventSource) {
    sseConnection.eventSource.close()
    sseConnection.listeners.clear()
    sseConnection = null
    console.warn(`Global SSE connection to ${SSE_URL} closed.`)
  }
}
