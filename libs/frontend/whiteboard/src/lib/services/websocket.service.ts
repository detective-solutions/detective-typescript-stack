import { Injectable, OnDestroy } from '@angular/core';

import { ColDef } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

@Injectable()
export class WebsocketService implements OnDestroy {
  incomingWebsocketMessages$ = new Subject<{ id: string; colDefs: ColDef[]; rowData: object[] }>();
  websocketSubject = webSocket('ws://localhost:8081/api/v1/ws/123');

  constructor() {
    this.websocketSubject.subscribe((res) => console.log(res));
  }

  publishMessage(elementId: string) {
    this.incomingWebsocketMessages$.next({
      id: elementId,
      colDefs: [
        { field: 'make', sortable: true, filter: true, suppressMovable: true },
        { field: 'model' },
        { field: 'price' },
        { field: 'make' },
        { field: 'model' },
        { field: 'price' },
      ],
      rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 },
      ],
    });
  }

  ngOnDestroy() {
    this.websocketSubject.unsubscribe();
  }
}
