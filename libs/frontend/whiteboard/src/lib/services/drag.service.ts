import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WindowGlobals } from '@detective.solutions/frontend/shared/ui';

declare let window: WindowGlobals;

@Injectable()
export class DragService {
  isDragging$ = new Subject<boolean>();

  activateDragging() {
    this.isDragging$.next(true);
    window.isDraggingActivated = true;
    document.body.style.cursor = 'grabbing';
  }

  deactivateDragging() {
    this.isDragging$.next(false);
    window.isDraggingActivated = false;
    document.body.style.cursor = 'default';
  }
}
