import { INodeInput, Node } from '../../models';

import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardActions } from '../../state/actions';
import { WindowGlobals } from '@detective.solutions/frontend/shared/ui';

declare let window: WindowGlobals;

@Injectable()
export class DragService {
  isMouseDown = false;
  isDraggingActivated = false;

  readonly isDragging$ = new BehaviorSubject<boolean>(false);

  private nodeLayoutUpdateBuffer: Set<Node> = new Set();
  private dragHoldTimeout!: ReturnType<typeof setTimeout>;

  constructor(private readonly store: Store) {}

  addDelayedDragHandling(event: Event) {
    this.isMouseDown = true;
    this.dragHoldTimeout = setTimeout(() => {
      if (this.isMouseDown && !this.isDraggingActivated) {
        if (this.isDraggingAllowedOnTarget(event.target as HTMLElement)) {
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

  // TODO: Refactor drag service approach
  addToNodeLayoutUpdateBuffer(node: Node) {
    this.nodeLayoutUpdateBuffer.add(node);
  }

  updateNodeLayoutsFromBuffer() {
    const updates: Update<INodeInput>[] = [];
    this.nodeLayoutUpdateBuffer.forEach((node: Node) =>
      updates.push({
        id: node.id,
        changes: {
          layout: {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
          },
        },
      })
    );
    this.store.dispatch(WhiteboardActions.WhiteboardNodeLayoutUpdate({ updates: updates }));
    this.nodeLayoutUpdateBuffer.clear();
  }

  isDraggingAllowedOnTarget(targetElement: HTMLElement): boolean {
    return (
      targetElement.tagName !== 'MAT-ICON' && targetElement.tagName !== 'BUTTON' && targetElement.tagName !== 'INPUT'
    );
  }
}
