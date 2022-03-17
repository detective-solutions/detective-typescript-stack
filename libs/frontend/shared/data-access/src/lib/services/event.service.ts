import { BehaviorSubject, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EventService {
  readonly showTableView$ = new BehaviorSubject<boolean>(false);
  readonly resetLoadingStates$ = new Subject<boolean>();
}
