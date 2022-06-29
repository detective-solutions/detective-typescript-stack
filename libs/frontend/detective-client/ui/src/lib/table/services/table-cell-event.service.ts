import { ITableCellEvent, TableCellEventType } from '../models';
import { Subject, filter } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableCellEventService {
  readonly tableCellEvents$ = new Subject<ITableCellEvent>();
  readonly iconButtonClicks$ = this.tableCellEvents$.pipe(
    filter((tableEvent: ITableCellEvent) => tableEvent.type === TableCellEventType.ICON_BUTTON_CLICK)
  );
  readonly accessRequests$ = this.tableCellEvents$.pipe(
    filter((event: ITableCellEvent) => !!event.id && event.type === TableCellEventType.REQUEST_ACCESS)
  );
  readonly favorized$ = this.tableCellEvents$.pipe(
    filter((event: ITableCellEvent) => event.type === TableCellEventType.FAVORIZE && event.value !== undefined)
  );
  readonly resetLoadingStates$ = new Subject<boolean>();
}
