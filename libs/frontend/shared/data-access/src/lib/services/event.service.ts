import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class EventService {
  showTableView$ = new BehaviorSubject<boolean>(true);
}
