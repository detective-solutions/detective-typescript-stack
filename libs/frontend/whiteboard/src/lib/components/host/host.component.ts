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
import { ForceDirectedGraph, Node } from '../../models';
import { Subscription, tap } from 'rxjs';

import { Store } from '@ngrx/store';
import { TableNodeActions } from '../node-components/table/state';
import { WhiteboardFacadeService } from '../../services';
import { v4 as uuidv4 } from 'uuid';

// TODO: Remove these when actual node data is loaded
const randomTitles = [
  'Clue 1',
  'I am a randomly chosen title',
  'Clue 2',
  'Find suspicious content',
  'Clue 3',
  'Suspicious data',
  '',
];

@Component({
  selector: 'whiteboard-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('whiteboardContainer') whiteboardContainerElement!: ElementRef;
  @ViewChild('zoomContainer') zoomContainerElement!: ElementRef;

  currentNodes!: Node[];

  isWhiteboardInitialized$ = this.whiteboardFacade.isWhiteboardInitialized$.pipe(
    tap((graph: ForceDirectedGraph) => {
      this.graph = graph;
      // Bind change detection to each graph tick o improve performance
      this.subscriptions.add(this.graph.ticker.subscribe(() => this.changeDetectorRef.markForCheck()));
      this.graph.initialize(this.currentNodes);
    })
  );
  isConnectedToWebSocketServer$ = this.whiteboardFacade.isConnectedToWebSocketServer$;
  webSocketConnectionFailedEventually$ = this.whiteboardFacade.webSocketConnectionFailedEventually$;

  graph!: ForceDirectedGraph;

  readonly whiteboardHtmlId = 'whiteboard';
  private readonly options = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  protected readonly subscriptions = new Subscription();

  // Reset element selection when clicking blank space on the whiteboard
  @HostListener('pointerdown', ['$event'])
  private resetElementSelection(event: PointerEvent) {
    (event.target as HTMLElement).id === this.whiteboardHtmlId && this.whiteboardFacade.resetSelection();
  }

  constructor(
    private readonly whiteboardFacade: WhiteboardFacadeService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly store: Store
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.whiteboardFacade.initialWhiteboardNodes$.subscribe((nodes: Node[]) => (this.currentNodes = nodes))
    );
  }

  ngAfterViewInit() {
    this.whiteboardFacade.initializeWhiteboard(
      this.whiteboardContainerElement.nativeElement,
      this.zoomContainerElement.nativeElement,
      this.options
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    // Make sure to reset websocket connection & whiteboard data
    this.whiteboardFacade.resetWhiteboard();
  }

  onElementDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onElementDrop(event: DragEvent) {
    const convertedDOMPoint = this.convertDOMToSVGCoordinates(event.clientX, event.clientY);
    this.store.dispatch(
      TableNodeActions.tableNodeAdded({
        tableElementAdded: {
          id: uuidv4(),
          type: 'table',
          title: randomTitles[Math.floor(Math.random() * randomTitles.length)],
          layout: { x: convertedDOMPoint.x, y: convertedDOMPoint.y, width: 900, height: 500 },
        },
      })
    );
  }

  private convertDOMToSVGCoordinates(x: number, y: number): DOMPoint {
    const screenCTM = this.zoomContainerElement.nativeElement.getScreenCTM();
    if (!screenCTM) {
      throw new Error('Could not get screen CTM for the SVG zoom group while transforming DOM to SVG coordinates');
    }
    return new DOMPoint(x, y).matrixTransform(screenCTM.inverse());
  }
}
