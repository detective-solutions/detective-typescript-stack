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
import { ForceDirectedGraph, Node, WhiteboardOptions } from '../../models';
import { Subscription, delayWhen, distinctUntilChanged, filter, tap } from 'rxjs';

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
  private static readonly options: WhiteboardOptions = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  @ViewChild('whiteboardContainer') whiteboardContainerElement!: ElementRef;
  @ViewChild('zoomContainer') zoomContainerElement!: ElementRef;

  whiteboardNodes$ = this.whiteboardFacade.whiteboardNodes$.pipe(
    // Buffer node updates while user is dragging
    delayWhen(() => this.whiteboardFacade.isDragging$.pipe(filter((isDragging: boolean) => !isDragging))),
    // Update underlying graph nodes
    tap((nodes: Node[]) => this.forceGraph.updateNodes(nodes)),
    // Update layouts for nodes moved by graph force
    tap(() => this.whiteboardFacade.updateNodeLayoutsFromBuffer())
  );

  isWhiteboardInitialized$ = this.whiteboardFacade.isWhiteboardInitialized$;
  isConnectedToWebSocketServer$ = this.whiteboardFacade.isConnectedToWebSocketServer$;
  webSocketConnectionFailedEventually$ = this.whiteboardFacade.webSocketConnectionFailedEventually$;

  readonly forceGraph: ForceDirectedGraph = this.whiteboardFacade.getForceGraph(HostComponent.options);
  readonly whiteboardHtmlId = 'whiteboard';

  private readonly subscriptions = new Subscription();

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
    // Bind Angular change detection to each graph tick for render sync
    this.subscriptions.add(this.forceGraph.ticker$.subscribe(() => this.changeDetectorRef.markForCheck()));

    // Handle position updates caused by the graph force
    this.subscriptions.add(
      this.forceGraph.nodePositionUpdatedByForce$
        .pipe(distinctUntilChanged())
        .subscribe((node: Node) => this.whiteboardFacade.addToNodeLayoutUpdateBuffer(node))
    );
  }

  ngAfterViewInit() {
    this.whiteboardFacade.initializeWhiteboard(
      this.whiteboardContainerElement.nativeElement,
      this.zoomContainerElement.nativeElement
    );
  }

  ngOnDestroy() {
    this.forceGraph.simulation.stop();
    this.subscriptions.unsubscribe();
    // Make sure to reset websocket connection & whiteboard data
    this.whiteboardFacade.resetWhiteboard();
  }

  onElementDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onElementDrop(event: DragEvent) {
    const convertedDOMPoint = this.convertDOMToSVGCoordinates(event.clientX, event.clientY);
    // TODO: Use data from added element instead of hard-coded data
    this.store.dispatch(
      TableNodeActions.tableNodeAdded({
        tableElementAdded: {
          id: uuidv4(),
          type: 'table',
          title: randomTitles[Math.floor(Math.random() * randomTitles.length)],
          layout: {
            x: convertedDOMPoint.x,
            y: convertedDOMPoint.y,
            width: 900,
            height: 500,
          },
        },
        addedManually: true,
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
