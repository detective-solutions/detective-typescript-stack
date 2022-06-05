import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { WindowGlobals } from '@detective.solutions/frontend/shared/ui';

declare let window: WindowGlobals;

@Injectable()
export class DragService {
  private static readonly defaultDraggingDelay = 250;
  private dragHoldTimeout!: ReturnType<typeof setTimeout>;

  isMouseDown = false;
  isDraggingActivated = false;
  readonly isDragging$ = new BehaviorSubject<boolean>(false);

  addDelayedDragHandling(event: Event) {
    this.isMouseDown = true;
    this.dragHoldTimeout = setTimeout(() => {
      if (this.isMouseDown && !this.isDraggingActivated) {
        if (this.isDraggingAllowedOnTarget(event.target as HTMLElement)) {
          this.activateDragging();
        }
      }
    }, DragService.defaultDraggingDelay);
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

  isDraggingAllowedOnTarget(targetElement: HTMLElement): boolean {
    return (
      targetElement.tagName !== 'MAT-ICON' && targetElement.tagName !== 'BUTTON' && targetElement.tagName !== 'INPUT'
    );
  }
}
