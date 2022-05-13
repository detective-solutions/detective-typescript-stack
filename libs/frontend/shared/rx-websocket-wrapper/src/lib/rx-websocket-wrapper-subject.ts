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

import { RxWebsocketWrapperConfig } from './models/rx-websocket-wrapper-config.interface';
import { WebSocketConnectionStatus } from './models';
import { WebSocketMessage } from './models/websocket-message.type';
import { WebSocketMessageServer } from './models/websocket-message-server.type';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class RxWebsocketWrapperSubject<T> extends Subject<T> {
  private readonly _wsSubjectConfig!: WebSocketSubjectConfig<T>;
  private _socket!: WebSocketSubject<any> | null;
  private _socketSubscription!: Subscription;

  private _reconnectionObservable!: Observable<number> | null;
  private _reconnectionSubscription!: Subscription;
  private _reconnectionInterval = 2000;
  private _reconnectionAttempts = 15;

  // Internal subject for the current connection status
  private _connectionStatus$ = new Subject<boolean>();
  // Internal subject to indicate that all reconnection attempts failed
  private _connectionFailedEventually$ = new BehaviorSubject<boolean>(false);

  constructor(config: RxWebsocketWrapperConfig) {
    super();

    this._wsSubjectConfig = Object.assign({}, { url: config.url });

    // set reconnect interval
    if (config.reconnectInterval) {
      this._reconnectionInterval = config.reconnectInterval;
    }

    // set reconnect attempts
    if (config.reconnectAttempts) {
      this._reconnectionAttempts = config.reconnectAttempts;
    }

    // add protocol in config
    if (config.protocol) {
      Object.assign(this._wsSubjectConfig, { protocol: config.protocol });
    }

    // add WebSocketCtor in config
    if (config.WebSocketCtor) {
      Object.assign(this._wsSubjectConfig, {
        WebSocketCtor: config.WebSocketCtor,
      });
    }

    // add default data in config
    Object.assign(this._wsSubjectConfig, {
      deserializer: this._deserializer,
      serializer: this._serializer,
      openObserver: {
        next: () => {
          this._connectionStatus$.next(true);
        },
      },
      closeObserver: {
        next: () => {
          this._cleanSocket();
          this._connectionStatus$.next(false);
        },
      },
    });

    this._connect();

    // Connection status subscription
    this.connectionStatus$.subscribe({
      next: (isConnected: WebSocketConnectionStatus) => {
        if (!this._reconnectionObservable && isConnected === WebSocketConnectionStatus.NOT_CONNECTED) {
          this._reconnect();
        }
      },
    });
  }

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

  send(data: any) {
    if (!this._socket) {
      throw new Error('Cannot send message, because internal socket is null!');
    }
    this._socket.next(data);
  }

  emit(event: string, data: any) {
    this.send({ event, data });
  }

  /**
   * Function to handle text response for given event from server
   *
   * @example <caption>UTF Text Message from server</caption>
   *
   * const message = {
   *  type: 'utf8',
   *  utf8Data: {
   *      event: 'data',
   *      data: 'Data from the server'
   *  }
   * }
   *
   * @example <caption>Simple Text Message from server</caption>
   *
   * const message = {
   *  event: 'data',
   *  data: 'Data from the server'
   * }
   *
   * @param event represents value inside {utf8Data.event} or {event} from server response
   *
   *  @value complete | <any>
   *  @example <caption>Event type</caption>
   *
   *  if (event === 'complete') => handle Observable's complete
   *  else handle Observable's success
   *
   * @param cb is the function executed if event matches the response from the server
   */
  on(event: string | 'close', cb: (data?: any) => void) {
    this._message$<WebSocketMessageServer>(event).subscribe({
      next: (message: WebSocketMessageServer) => cb(message.data),
      /* istanbul ignore next */
      error: () => null,
      complete: () => {
        /* istanbul ignore else */
        if (event === 'close') {
          cb();
        }
      },
    });
  }

  /**
   * Same as `on` method but with Observable response
   *
   * @param event represents value inside {utf8Data.event} or {event} from server response
   *
   * @return {Observable<any>}
   */
  on$(event: string): Observable<any> {
    return this._message$<WebSocketMessageServer>(event).pipe(map((_) => _.data));
  }

  // Handle socket close event from server
  onClose$(): Observable<void> {
    return new Observable((observer) => {
      this.subscribe({
        /* istanbul ignore next */
        next: () => null,
        /* istanbul ignore next */
        error: () => null,
        complete: () => {
          observer.next();
          observer.complete();
        },
      });
    });
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

  private _cleanSocket() {
    /* istanbul ignore else */
    if (this._socketSubscription) {
      this._socketSubscription.unsubscribe();
    }
    this._socket = null;
  }

  /**
   * Function to clean reconnection data
   *
   * @private
   */
  private _cleanReconnection() {
    /* istanbul ignore else */
    if (this._reconnectionSubscription) {
      this._reconnectionSubscription.unsubscribe();
    }
    this._reconnectionObservable = null;
  }

  /**
   * Function to create socket and subscribe to it
   *
   * @private
   */
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
          // TODO: Clarify if completed status can be used for connection status
          console.log('COMPLETE STATUS');
          this._connectionStatus$.complete();
        }
      },
    });
  }

  private _deserializer(e: MessageEvent): T {
    try {
      return JSON.parse(e.data);
    } catch (err) {
      return e.data;
    }
  }

  private _serializer(data: any): WebSocketMessage {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
}
