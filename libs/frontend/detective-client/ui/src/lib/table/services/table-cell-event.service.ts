import { ITableCellEvent, TableCellEventType } from '../models';
import { Subject, filter } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableCellEventService {
  readonly tableCellEvents$ = new Subject<ITableCellEvent>();
  readonly resetLoadingStates$ = new Subject<boolean>();

  readonly iconButtonClicks$ = this.tableCellEvents$.pipe(
    filter((tableEvent: ITableCellEvent) => tableEvent.type === TableCellEventType.ICON_BUTTON_CLICK)
  );
}
