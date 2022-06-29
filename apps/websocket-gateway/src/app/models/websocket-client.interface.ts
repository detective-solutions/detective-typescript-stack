import WebSocket from 'ws';
import { WebSocketClientContext } from './websocket-client-context.type';

export interface IWebSocketClient extends WebSocket {
  _socket: { context: WebSocketClientContext };
}
