import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  distinctUntilChanged,
  filter,
  interval,
  map,
  takeWhile,
  tap,
} from 'rxjs';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';

import { EventBasedWebSocketMessage } from './models/event-based-websocket-message.type';
import { RxWebsocketWrapperConfig } from './models/rx-websocket-wrapper-config.interface';
import { WebSocketConnectionStatus } from './models';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class RxWebSocketWrapperSubject<T> extends Subject<T> {
  // Internal subject for the current connection status
  private _connectionStatus$ = new Subject<boolean>();
  // Internal subject to indicate that all reconnection attempts failed
  private _connectionFailedEventually$ = new BehaviorSubject<boolean>(false);

  private _socket!: WebSocketSubject<any> | null;
  private _socketSubscription!: Subscription;

  private _reconnectionObservable!: Observable<number> | null;
  private _reconnectionSubscription!: Subscription;
  private _reconnectionInterval = 2000;
  private _reconnectionAttempts = 15;

  private readonly _wsSubjectConfig: WebSocketSubjectConfig<T> = {
    url: '',
    deserializer: this._deserializer,
    serializer: this._serializer,
    openObserver: {
      next: () => this._connectionStatus$.next(true),
    },
    closeObserver: {
      next: () => {
        this._cleanSocket();
        this._connectionStatus$.next(false);
      },
    },
  };

  set config(configInput: RxWebsocketWrapperConfig) {
    Object.assign(this._wsSubjectConfig, configInput);
  }

  get connectionStatus$(): Observable<WebSocketConnectionStatus> {
    return combineLatest([this._connectionStatus$, this._connectionFailedEventually$]).pipe(
      map(([connectionStatus, connectionFailedEventually]) => {
        if (connectionFailedEventually) {
          return WebSocketConnectionStatus.FAILED;
        }
        if (connectionStatus) {
          return WebSocketConnectionStatus.CONNECTED;
        } else {
          return WebSocketConnectionStatus.NOT_CONNECTED;
        }
      }),
      distinctUntilChanged()
    );
  }

  get connectionFailedEventually$(): Observable<boolean> {
    return this._connectionFailedEventually$.pipe(distinctUntilChanged());
  }

  constructor(config: RxWebsocketWrapperConfig) {
    super();

    if (!config.url) {
      throw new Error('Could not initialize WebSocket connection due to missing URL in WebSocket configuration');
    }

    this._wsSubjectConfig = Object.assign(this._wsSubjectConfig, config);
    this._connect();

    this.connectionStatus$.subscribe({
      next: (isConnected: WebSocketConnectionStatus) => {
        if (!this._reconnectionObservable && isConnected === WebSocketConnectionStatus.NOT_CONNECTED) {
          this._reconnect();
        }
      },
    });
  }

  emit(message: EventBasedWebSocketMessage) {
    if (!this._socket) {
      throw new Error('Cannot send message, because internal WebSocket is not available!');
    }
    this._socket.next(message);
  }

  on(event: string | 'close', callBack: (data?: any) => void) {
    this._message$<EventBasedWebSocketMessage>(event).subscribe({
      next: (message: EventBasedWebSocketMessage) => callBack(message.data),
      /* istanbul ignore next */
      error: () => null,
      complete: () => {
        /* istanbul ignore else */
        if (event === 'close') {
          callBack();
        }
      },
    });
  }

  // Same as `on` method but returns an observable
  on$(event: string): Observable<any> {
    return this._message$<EventBasedWebSocketMessage>(event).pipe(map((_) => _.data));
  }

  resetConnection() {
    this.complete();
    this._cleanSocket();
    this._cleanReconnection();
  }

  // Returns formatted and filtered message from server for given event
  private _message$<WebSocketMessageServer>(event: string | 'close'): Observable<WebSocketMessageServer> {
    return this.pipe(
      map((message: any): any =>
        message.type && message.type === 'utf8' && message.utf8Data ? message.utf8Data : message
      ),
      filter(
        (message: any): boolean => message.event && message.event !== 'close' && message.event === event && message.data
      )
    );
  }

  private _connect() {
    this._socket = new WebSocketSubject(this._wsSubjectConfig);
    this._socketSubscription = this._socket.subscribe({
      next: (m: any) => {
        this.next(m);
      },
      error: () => {
        /* istanbul ignore if */
        if (!this._socket) {
          this._cleanReconnection();
          this._reconnect();
        }
      },
    });
  }

  private _cleanSocket() {
    /* istanbul ignore else */
    if (this._socketSubscription) {
      this._socketSubscription.unsubscribe();
    }
    this._socket = null;
  }

  private _reconnect() {
    this._reconnectionObservable = interval(this._reconnectionInterval).pipe(
      tap((currentReconnectAttempt: number) => {
        // If all attempts where unsuccessful
        if (currentReconnectAttempt === this._reconnectionAttempts && !this._socket) {
          this._connectionFailedEventually$.next(true);
        }
      }),
      takeWhile((_v, index) => index < this._reconnectionAttempts && !this._socket)
    );

    this._reconnectionSubscription = this._reconnectionObservable.subscribe({
      next: () => this._connect(),
      /* istanbul ignore next */
      error: () => null,
      complete: () => {
        this._cleanReconnection();
        if (!this._socket) {
          this.complete();
          this._connectionStatus$.complete();
        }
      },
    });
  }

  private _cleanReconnection() {
    /* istanbul ignore else */
    if (this._reconnectionSubscription) {
      this._reconnectionSubscription.unsubscribe();
    }
    this._reconnectionObservable = null;
  }

  private _deserializer(e: MessageEvent): T {
    try {
      return JSON.parse(e.data);
    } catch (err) {
      return e.data;
    }
  }

  private _serializer(data: any): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
}
