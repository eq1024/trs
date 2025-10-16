/**
 * 订阅一个 Server-Sent Event。
 * @param {string} eventName - 要监听的事件名称
 * @param {(data: any) => void} onMessage - 收到消息时的回调函数
 * @returns {() => void} - 一个用于取消订阅的函数
 */
declare function subscribeToSSE(eventName: string, onMessage: (data: any) => void): () => void;
/**
 * 手动关闭全局的 SSE 连接。
 */
declare function closeSSEConnection(): void;

export { closeSSEConnection, subscribeToSSE };
