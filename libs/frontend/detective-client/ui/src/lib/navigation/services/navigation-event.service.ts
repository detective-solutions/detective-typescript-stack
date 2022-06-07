import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavigationEventService {
  readonly showTableView$ = new BehaviorSubject<boolean>(false);
}
