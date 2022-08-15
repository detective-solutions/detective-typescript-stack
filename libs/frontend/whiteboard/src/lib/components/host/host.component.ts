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
import {
  AnyWhiteboardNode,
  ForceDirectedGraph,
  TableWhiteboardNode,
  WhiteboardNodeType,
  WhiteboardOptions,
} from '../../models';
import { ICasefile, IUser, MessageEventType } from '@detective.solutions/shared/data-access';
import {
  Subscription,
  combineLatest,
  delayWhen,
  distinctUntilChanged,
  filter,
  pluck,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { WhiteboardGeneralActions, selectWhiteboardContextState } from '../../state';

import { Store } from '@ngrx/store';
import { WhiteboardFacadeService } from '../../services';
import { v4 as uuidv4 } from 'uuid';

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
    tap((nodes: AnyWhiteboardNode[]) => this.forceGraph.updateNodes(nodes)),
    // Update layouts for nodes moved by graph force
    tap(() => this.whiteboardFacade.updateNodesFromBuffer())
  );
  readonly isWhiteboardInitialized$ = this.whiteboardFacade.isWhiteboardInitialized$;
  readonly isConnectedToWebSocketServer$ = this.whiteboardFacade.isConnectedToWebSocketServer$;
  readonly webSocketConnectionFailedEventually$ = this.whiteboardFacade.webSocketConnectionFailedEventually$;

  readonly forceGraph: ForceDirectedGraph = this.whiteboardFacade.getForceGraph(HostComponent.options);
  readonly nodeType = WhiteboardNodeType;
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

    // Listen to LOAD_WHITEBOARD_DATA websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.LoadWhiteboardData)),
          pluck('body')
        )
        .subscribe((messageData: ICasefile) => {
          this.store.dispatch(
            WhiteboardGeneralActions.WhiteboardDataLoaded({
              casefile: messageData,
            })
          );
        })
    );

    // Listen to WHITEBOARD_NODE_ADDED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardNodeAdded),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId)
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .subscribe(([messageData, _context]) => {
          this.store.dispatch(
            WhiteboardGeneralActions.WhiteboardNodeAdded({
              addedNode: messageData.body,
              addedManually: false,
            })
          );
        })
    );

    // Handle position updates caused by the graph force
    this.subscriptions.add(
      this.forceGraph.nodePositionUpdatedByForce$
        .pipe(distinctUntilChanged())
        .subscribe((node: AnyWhiteboardNode) => this.whiteboardFacade.addToNodeUpdateBuffer(node))
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

    // TODO: Use data from added element instead of hard-coded data
    const tableNode = TableWhiteboardNode.Build({
      id: uuidv4(),
      title: '',
      x: convertedDOMPoint.x,
      y: convertedDOMPoint.y,
      width: 900,
      height: 500,
      locked: false,
      lastUpdatedBy: {} as IUser,
      lastUpdated: Date.now().toString(),
      created: Date.now().toString(),
      entity: {
        id: uuidv4(),
        name: randomTitles[Math.floor(Math.random() * randomTitles.length)],
        description: '',
        lastUpdatedBy: {} as IUser,
        lastUpdated: Date.now().toString(),
        created: Date.now().toString(),
      },
    });
    this.store.dispatch(
      WhiteboardGeneralActions.WhiteboardNodeAdded({
        addedNode: TableWhiteboardNode.Build(tableNode),
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
