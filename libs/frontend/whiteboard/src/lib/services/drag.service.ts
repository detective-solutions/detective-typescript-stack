import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WindowGlobals } from '@detective.solutions/frontend/shared/ui';

declare let window: WindowGlobals;

@Injectable()
export class DragService {
  private dragHoldTimeout!: ReturnType<typeof setTimeout>;

  isMouseDown = false;
  isDraggingActivated = false;
  isDragging$ = new Subject<boolean>();

  addDelayedDragHandling(event: Event) {
    this.isMouseDown = true;
    this.dragHoldTimeout = setTimeout(() => {
      if (this.isMouseDown && !this.isDraggingActivated) {
        // Prevent drag for input elements
        if ((event.target as HTMLElement).tagName !== 'INPUT') {
          this.activateDragging();
        }
      }
    }, 250);
  }

  removeDelayedDragHandling() {
    if (this.dragHoldTimeout) {
      clearTimeout(this.dragHoldTimeout);
    }
    this.deactivateDragging();
    this.isMouseDown = false;
  }

  activateDragging() {
    this.isDragging$.next(true);
    this.isDraggingActivated = true;
    window.isDraggingActivated = true; // Make the flag available for d3 drag functions
    document.body.style.cursor = 'grabbing';
  }

  deactivateDragging() {
    this.isDragging$.next(false);
    this.isDraggingActivated = false;
    window.isDraggingActivated = false;
    document.body.style.cursor = 'default';
  }
}
