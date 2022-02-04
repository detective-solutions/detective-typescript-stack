import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class EventService {
  readonly showTableView$ = new BehaviorSubject<boolean>(false);
}
