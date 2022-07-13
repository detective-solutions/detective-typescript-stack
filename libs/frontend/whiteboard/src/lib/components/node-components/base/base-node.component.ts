import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription, map } from 'rxjs';

import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { Node } from '../../../models';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../../services';

@Component({
  template: '',
  styleUrls: ['./base-node.component.scss'],
})
export class BaseNodeComponent implements AfterViewInit, OnDestroy {
  @Input() node!: Node;

  readonly isDragging$ = this.whiteboardFacade.isDragging$;
  readonly selected$ = this.whiteboardFacade.whiteboardSelection$.pipe(
    map((selectedId) => (selectedId === this.node.id ? selectedId : null))
  );

  protected readonly nodeUpdates$ = new BehaviorSubject<Node>(this.node);
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

  protected updateExistingNodeObject(updatedNode: Node) {
    Object.keys(updatedNode).forEach((key: string) => {
      (this.node as any)[key] = (updatedNode as any)[key];
    });
  }
}
