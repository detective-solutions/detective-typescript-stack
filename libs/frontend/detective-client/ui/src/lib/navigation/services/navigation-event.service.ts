import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationEventService {
  readonly showTableView$ = new Subject<boolean>();
  readonly searchInput$ = new Subject<string>();
}
