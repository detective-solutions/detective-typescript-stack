import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { DragService, WhiteboardService } from '../../../services';
import { distinctUntilChanged, map } from 'rxjs';

import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { Node } from '../../../models';
import { Store } from '@ngrx/store';

@Component({
  template: '',
  styleUrls: ['./base-node.component.scss'],
})
export class BaseNodeComponent implements OnInit, AfterViewInit {
  @Input() node!: Node;

  selected$ = this.whiteboardService.whiteboardSelection$.pipe(
    map((selectedId) => (selectedId === this.node.id ? selectedId : null))
  );

  isDragging$ = this.dragService.isDragging$.pipe(distinctUntilChanged());

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
    protected readonly keyboardService: KeyboardService,
    protected readonly dragService: DragService
  ) {}

  ngOnInit() {
    this.whiteboardService.applyDragBehavior(this);
  }

  ngAfterViewInit() {
    // Select element on whiteboard right after creation
    this.whiteboardService.whiteboardSelection$.next(this.node.id);
  }

  preventZoom(event: WheelEvent) {
    // Utility function to only allow zoom while space key is pressed
    if (!this.keyboardService.isSpaceKeyPressed) {
      event.stopPropagation();
    }
  }
}
