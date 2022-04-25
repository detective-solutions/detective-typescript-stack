import { Injectable, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { WebsocketMessage } from '../models';
import { webSocket } from 'rxjs/webSocket';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WebsocketService implements OnDestroy {
  // TODO: Set URL in environment files
  readonly websocketSubject$: Subject<WebsocketMessage<any>> = webSocket('ws://localhost:7777');

  constructor() {
    this.websocketSubject$.subscribe({
      error: (err) => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete'), // Called when connection is closed (for whatever reason).
    });
  }

  publishMessage(message: WebsocketMessage<any>) {
    this.websocketSubject$.next(message);
  }

  ngOnDestroy() {
    this.websocketSubject$.unsubscribe();
  }
}
