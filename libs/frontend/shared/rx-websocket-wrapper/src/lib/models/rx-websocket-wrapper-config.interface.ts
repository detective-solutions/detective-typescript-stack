export interface RxWebsocketWrapperConfig {
  url: string;
  protocol?: string | Array<string>;
  // A WebSocket constructor to use. This is useful for mocking a WebSocket for testing purposes
  WebSocketCtor?: { new (url: string, protocol?: string | Array<string>): WebSocket };
  reconnectInterval?: number;
  reconnectAttempts?: number;
}
