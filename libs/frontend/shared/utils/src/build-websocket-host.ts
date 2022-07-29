import { environment } from '@detective.solutions/frontend/shared/environments';

export function buildWebSocketHost() {
  const webSocketProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  return environment.production
    ? webSocketProtocol + window.location.host
    : webSocketProtocol + environment.webSocketHost;
}
