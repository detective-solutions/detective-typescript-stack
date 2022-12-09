import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { WindowGlobals } from '@detective.solutions/frontend/shared/ui';
import { nodeDragTimeout } from '../../utils';

declare let window: WindowGlobals;

@Injectable()
export class DragService {
  private dragHoldTimeout!: ReturnType<typeof setTimeout>;

  isMouseDown = false;
  isResizing = false;
  isDraggingActivated = false;
  readonly isDragging$ = new BehaviorSubject<boolean>(false);

  addDelayedDragHandling(event: Event) {
    this.isMouseDown = true;
    this.dragHoldTimeout = setTimeout(() => {
      if (this.isMouseDown && !this.isResizing && !this.isDraggingActivated) {
        if (this.isDraggingAllowedOnTarget(event.target as HTMLElement)) {
          this.activateDragging();
        }
      }
    }, nodeDragTimeout);
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
    const isNoForbiddenIcon = (elem: HTMLElement) => elem.tagName !== 'MAT-ICON' || elem.innerText === 'drag_indicator';
    const isNoButton = (elem: HTMLElement) => elem.tagName !== 'BUTTON';
    const isNoInput = (elem: HTMLElement) => elem.tagName !== 'INPUT';

    return isNoForbiddenIcon(targetElement) && isNoButton(targetElement) && isNoInput(targetElement);
  }
}
