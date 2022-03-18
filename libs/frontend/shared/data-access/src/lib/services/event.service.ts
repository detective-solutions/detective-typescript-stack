import { BehaviorSubject, Subject } from 'rxjs';

import { ICasefileEvent } from '../interfaces';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EventService {
  readonly showTableView$ = new BehaviorSubject<boolean>(false);
  readonly tableCellEvents$ = new Subject<ICasefileEvent>();
  readonly resetLoadingStates$ = new Subject<boolean>();
}
