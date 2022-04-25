import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { DragService, WebsocketService, WhiteboardService } from '../../../services';
import { Subscription, distinctUntilChanged, map } from 'rxjs';

import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { Node } from '../../../models';
import { Store } from '@ngrx/store';

@Component({
  template: '',
  styleUrls: ['./base-node.component.scss'],
})
export class BaseNodeComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() node!: Node;

  readonly selected$ = this.whiteboardService.whiteboardSelection$.pipe(
    map((selectedId) => (selectedId === this.node.id ? selectedId : null))
  );
  readonly isDragging$ = this.dragService.isDragging$.pipe(distinctUntilChanged());

  protected readonly subscriptions = new Subscription();

  @HostListener('pointerdown', ['$event'])
  private onClick(event: PointerEvent) {
    this.whiteboardService.addSelectedElement(this);
    this.dragService.addDelayedDragHandling(event);
  }

  @HostListener('pointerup')
  private onPointerUp() {
    this.dragService.removeDelayedDragHandling();
  }

  constructor(
    public readonly elementRef: ElementRef,
    protected readonly store: Store,
    protected readonly whiteboardService: WhiteboardService,
    protected readonly websocketService: WebsocketService,
    protected readonly keyboardService: KeyboardService,
    protected readonly dragService: DragService
  ) {}

  ngOnInit() {
    this.initBaseNode();
  }

  ngAfterViewInit() {
    // Select element on whiteboard right after creation
    this.whiteboardService.whiteboardSelection$.next(this.node.id);
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

  protected initBaseNode() {
    this.whiteboardService.applyDragBehavior(this);
  }
}
