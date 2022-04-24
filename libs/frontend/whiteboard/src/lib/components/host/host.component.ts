import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { WhiteboardActions } from '../../state';
import { WhiteboardService } from '../../services';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'whiteboard-host',
  templateUrl: './host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('whiteboardContainer') whiteboardContainerElement!: ElementRef;
  @ViewChild('zoomContainer') zoomContainerElement!: ElementRef;

  readonly whiteboardHtmlId = 'whiteboard';
  readonly nodes$ = this.whiteboardService.nodes$;
  readonly links$ = this.whiteboardService.links$;

  readonly randomTitles = [
    'Clue 1',
    'I am a randomly chosen title',
    'Clue 2',
    'Find suspicious content',
    'Clue 3',
    'Suspicious data',
    '',
  ];

  protected readonly graph = this.whiteboardService.graph;
  protected readonly subscriptions = new Subscription();

  // Reset element selection when clicking blank space on the whiteboard
  @HostListener('pointerdown', ['$event'])
  private resetElementSelection(event: PointerEvent) {
    (event.target as HTMLElement).id === this.whiteboardHtmlId && this.whiteboardService.resetSelection();
  }

  constructor(
    private readonly whiteboardService: WhiteboardService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly store: Store
  ) {}

  ngOnInit() {
    // Bind change detection to each graph tick to improve performance
    this.subscriptions.add(
      this.graph.ticker.subscribe(() => {
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngAfterViewInit() {
    this.whiteboardService.applyZoomBehavior(
      this.whiteboardContainerElement.nativeElement,
      this.zoomContainerElement.nativeElement
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onElementDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onElementDrop(event: DragEvent) {
    this.store.dispatch(
      WhiteboardActions.tableNodeAdded({
        tableElementAdded: {
          id: uuidv4(),
          type: 'table',
          title: this.randomTitles[Math.floor(Math.random() * this.randomTitles.length)],
          layout: { x: event.clientX, y: event.clientY, width: 900, height: 500 },
        },
      })
    );
  }
}
