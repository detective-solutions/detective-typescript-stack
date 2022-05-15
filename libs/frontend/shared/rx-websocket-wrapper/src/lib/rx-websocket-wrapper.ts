import { RxWebSocketWrapperSubject } from './rx-websocket-wrapper-subject';
import { RxWebsocketWrapperConfig } from './models/rx-websocket-wrapper-config.interface';

export function initRxWebSocketWrapper<T>(config: RxWebsocketWrapperConfig): RxWebSocketWrapperSubject<T> {
  return new RxWebSocketWrapperSubject<T>(config);
}
