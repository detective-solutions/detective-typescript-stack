import { RxWebsocketWrapperConfig } from './models/rx-websocket-wrapper-config.interface';
import { RxWebsocketWrapperSubject } from './rx-websocket-wrapper-subject';

export function initRxWebsocketWrapper<T>(config: RxWebsocketWrapperConfig): RxWebsocketWrapperSubject<T> {
  return new RxWebsocketWrapperSubject<T>(config);
}
