import { BehaviorSubject, Subject } from 'rxjs';

import { ITableCellEvent } from '../interfaces';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TableCellEventService {
  readonly showTableView$ = new BehaviorSubject<boolean>(false);
  readonly tableCellEvents$ = new Subject<ITableCellEvent>();
  readonly resetLoadingStates$ = new Subject<boolean>();
}
