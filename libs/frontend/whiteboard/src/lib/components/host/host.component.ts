import { AbstractNode, ForceDirectedGraph, INode, NodeType, WhiteboardOptions } from '../../models';
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
import { Subscription, delayWhen, distinctUntilChanged, filter, pluck, switchMap, take, tap } from 'rxjs';

import { Casefile } from '@detective.solutions/frontend/shared/data-access';
import { MessageEventType } from '@detective.solutions/shared/data-access';
import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../services';
import { WhiteboardNodeActions } from '../../state';
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

  readonly whiteboardNodes$ = this.whiteboardFacade.whiteboardNodes$.pipe(
    // Buffer node updates while user is dragging
    delayWhen(() => this.whiteboardFacade.isDragging$.pipe(filter((isDragging: boolean) => !isDragging))),
    // Update underlying graph nodes
    tap((nodes: AbstractNode[]) => this.forceGraph.updateNodes(nodes)),
    // Update layouts for nodes moved by graph force
    tap(() => this.whiteboardFacade.updateNodeLayoutsFromBuffer())
  );
  readonly isWhiteboardInitialized$ = this.whiteboardFacade.isWhiteboardInitialized$;
  readonly isConnectedToWebSocketServer$ = this.whiteboardFacade.isConnectedToWebSocketServer$;
  readonly webSocketConnectionFailedEventually$ = this.whiteboardFacade.webSocketConnectionFailedEventually$;

  readonly forceGraph: ForceDirectedGraph = this.whiteboardFacade.getForceGraph(HostComponent.options);
  readonly nodeType = NodeType;
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
    // Listen to LOAD_WHITEBOARD_DATA websocket message event
    this.whiteboardFacade.getWebSocketSubjectAsync$
      .pipe(
        switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.LoadWhiteboardData)),
        pluck('body'),
        take(1)
      )
      .subscribe((messageData: Casefile) => {
        // TODO: Unify casefile/node data handling in DET-915!
        messageData.tableObjects.map((tableObject: INode) => {
          tableObject.id = (tableObject as any).xid;
          tableObject.title = (tableObject as any).name;
          tableObject.type = 'table';
        });
        console.log('MESSAGE DATA:', messageData);
        this.store.dispatch(
          WhiteboardNodeActions.whiteboardDataLoaded({
            nodes: messageData.tableObjects,
          })
        );
      });

    // Bind Angular change detection to each graph tick for render sync
    this.subscriptions.add(this.forceGraph.ticker$.subscribe(() => this.changeDetectorRef.markForCheck()));

    // Handle position updates caused by the graph force
    this.subscriptions.add(
      this.forceGraph.nodePositionUpdatedByForce$
        .pipe(distinctUntilChanged())
        .subscribe((node: AbstractNode) => this.whiteboardFacade.addToNodeLayoutUpdateBuffer(node))
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
      WhiteboardNodeActions.WhiteboardNodeAdded({
        addedNode: {
          id: uuidv4(),
          type: NodeType.TABLE,
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
