import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { DragService, WhiteboardService } from '../../../services';
import { distinctUntilChanged, map } from 'rxjs';

import { Node } from '../../../model';
import { WindowGlobals } from '@detective.solutions/frontend/shared/ui';

declare let window: WindowGlobals;

@Component({
  template: '',
  styleUrls: ['./base-whiteboard.component.scss'],
})
export class WhiteboardBaseComponent implements OnInit, AfterViewInit {
  private dragHoldTimeout!: ReturnType<typeof setTimeout>;

  @Input() node!: Node;

  readonly id = String(Math.floor(Math.random() * 10000));
  readonly haloHandleRadius = 6;
  readonly haloOffset = 4;
  readonly haloColor = '#fc1767';

  selected$ = this.whiteboardService.whiteboardSelection$.pipe(
    map((selectedId) => (selectedId === this.id ? selectedId : null))
  );

  isDragging$ = this.dragService.isDragging$.pipe(distinctUntilChanged());

  @HostListener('pointerdown', ['$event'])
  private onClick(event: PointerEvent) {
    this.whiteboardService.addSelectedElement(this);
    window.mouseIsDown = true;
    this.dragHoldTimeout = setTimeout(() => {
      if (window.mouseIsDown && !window.isDraggingActivated) {
        // Prevent drag for input elements
        if ((event.target as HTMLElement).tagName !== 'INPUT') {
          this.dragService.activateDragging();
        }
      }
    }, 250);
  }

  @HostListener('pointerup')
  private onPointerUp() {
    if (this.dragHoldTimeout) {
      clearTimeout(this.dragHoldTimeout);
    }
    this.dragService.deactivateDragging();
    window.mouseIsDown = false;
  }

  constructor(
    public readonly elementRef: ElementRef,
    protected readonly whiteboardService: WhiteboardService,
    private readonly dragService: DragService
  ) {}

  ngOnInit() {
    this.whiteboardService.registerWhiteboardComponent(this);
    this.setupEventHandler();
  }

  ngAfterViewInit() {
    this.whiteboardService.whiteboardSelection$.next(this.id);
  }

  private setupEventHandler() {
    this.whiteboardService.setupWhiteboardComponentEventHandler(this);
  }
}
