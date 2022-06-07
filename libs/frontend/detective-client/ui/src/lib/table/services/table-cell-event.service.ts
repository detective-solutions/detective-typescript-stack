import { ITableCellEvent } from '../interfaces';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TableCellEventService {
  readonly tableCellEvents$ = new Subject<ITableCellEvent>();
  readonly resetLoadingStates$ = new Subject<boolean>();
}
