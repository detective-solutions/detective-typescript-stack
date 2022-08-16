import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, filter, map, pluck } from 'rxjs';

import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../../services';
import { WhiteboardNodeActions } from '../../../state';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  template: '',
  styleUrls: ['./base-node.component.scss'],
})
export class BaseNodeComponent implements AfterViewInit, OnDestroy {
  @Input() node!: AnyWhiteboardNode;

  readonly isDragging$ = this.whiteboardFacade.isDragging$;
  readonly selected$ = this.whiteboardFacade.whiteboardSelection$.pipe(
    map((selectedId) => (selectedId === this.node.id ? selectedId : null))
  );

  protected readonly nodeUpdates$ = new BehaviorSubject<AnyWhiteboardNode>(this.node);
  protected readonly nodeTemporaryData$ = this.nodeUpdates$.pipe(
    filter((node: AnyWhiteboardNode) => !!node?.temporary),
    pluck('temporary'),
    filter(Boolean)
  );
  protected readonly subscriptions = new Subscription();

  @HostListener('pointerdown', ['$event'])
  private onPointerDown(event: PointerEvent) {
    this.whiteboardFacade.addSelectedElement(this);
    this.whiteboardFacade.addDelayedDragHandling(event);
  }

  @HostListener('pointerup')
  private onPointerUp() {
    this.whiteboardFacade.removeDelayedDragHandling();
  }

  constructor(
    public readonly elementRef: ElementRef,
    protected readonly store: Store,
    protected readonly whiteboardFacade: WhiteboardFacadeService,
    protected readonly keyboardService: KeyboardService
  ) {}

  ngAfterViewInit() {
    this.whiteboardFacade.applyDragBehaviorToComponent(this);
    this.customAfterViewInit();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  preventZoom(event: WheelEvent) {
    // Utility function to only allow zoom while space key is pressed
    if (!this.keyboardService.isSpaceKeyPressed) {
      event.stopPropagation();
    }
  }

  toggleLock() {
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodeUpdate({
        update: {
          id: this.node.id,
          changes: { locked: !this.node.locked },
        },
      })
    );
  }

  // Can be used by child classes to add custom logic to the ngAfterViewInit hook
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected customAfterViewInit() {}

  protected updateExistingNodeObject(updatedNode: AnyWhiteboardNode) {
    Object.keys(updatedNode).forEach((key: string) => {
      (this.node as Record<string, any>)[key] = (updatedNode as Record<string, any>)[key];
    });
  }
}
