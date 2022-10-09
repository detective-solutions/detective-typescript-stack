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
  ICachableCasefileForWhiteboard,
  IMessage,
  IUserForWhiteboard,
  IWhiteboardNodeBlockUpdate,
  IWhiteboardNodePositionUpdate,
  MessageEventType,
  WhiteboardNodeType,
  WhiteboardOptions,
} from '@detective.solutions/shared/data-access';
import { EmbeddingWhiteboardNode, ForceDirectedGraph, TableWhiteboardNode } from '../../models';
import { Subscription, combineLatest, delayWhen, filter, map, pluck, switchMap, take, tap } from 'rxjs';
import {
  WhiteboardGeneralActions,
  WhiteboardMetadataActions,
  WhiteboardNodeActions,
  selectWhiteboardContextState,
  selectWhiteboardNodesBlockedByUserId,
} from '../../state';

import { IWhiteboardContextState } from '../../state/interfaces';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardFacadeService } from '../../services';
import { formatDate } from '@detective.solutions/shared/utils';
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
    tap((nodes: AnyWhiteboardNode[]) => this.forceGraph.updateNodes(nodes))
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

    // Handle position updates caused by the graph force
    this.subscriptions.add(
      this.forceGraph.nodePositionUpdatedByForce$.subscribe((node: AnyWhiteboardNode) =>
        this.whiteboardFacade.addToNodeUpdateBuffer(node)
      )
    );

    this.initializeCollaborationSubscriptions();
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
    // TODO: Add interface for drag data transfer object
    const dragDataTransfer = JSON.parse(event.dataTransfer?.getData('text/plain') ?? '');
    if (!dragDataTransfer) {
      console.error('Could not extract drag data for adding whiteboard node');
    }

    const now = formatDate(new Date());
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

    this.store
      .select(selectWhiteboardContextState)
      .pipe(take(1))
      .subscribe((context: IWhiteboardContextState) => {
        if (dragDataTransfer.type === WhiteboardNodeType.TABLE) {
          // TODO: Remove when data from dragged element is used
          const tableNode = TableWhiteboardNode.Build({
            id: uuidv4(),
            title: randomTitles[Math.floor(Math.random() * randomTitles.length)],
            x: convertedDOMPoint.x,
            y: convertedDOMPoint.y,
            width: 900,
            height: 500,
            locked: false,
            lastUpdatedBy: context.userId,
            lastUpdated: now,
            created: now,
            entity: {
              id: '9ebc4874-7135-11ec-8798-287fcf6e789d',
            },
          });

          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeAdded({
              addedNode: tableNode,
              addedManually: true,
            })
          );
        }

        if (dragDataTransfer.type === WhiteboardNodeType.EMBEDDING) {
          // TODO: Remove when data from dragged element is used
          const href = 'google.com';
          const embeddingNode = EmbeddingWhiteboardNode.Build({
            id: uuidv4(),
            title: href,
            href: href,
            x: convertedDOMPoint.x,
            y: convertedDOMPoint.y,
            width: 900,
            height: 500,
            locked: false,
            author: '78b4daab-dfe4-4bad-855f-ac575cc59730',
            editors: [{ id: '78b4daab-dfe4-4bad-855f-ac575cc59730' }],
            lastUpdatedBy: context.userId,
            lastUpdated: now,
            created: now,
          });

          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeAdded({
              addedNode: embeddingNode,
              addedManually: true,
            })
          );
        }
      });
  }

  private initializeCollaborationSubscriptions() {
    // Listen to LOAD_WHITEBOARD_DATA websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.LoadWhiteboardData)),
          pluck('body')
        )
        .subscribe((messageData: ICachableCasefileForWhiteboard) => {
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
            WhiteboardNodeActions.WhiteboardNodeAdded({
              addedNode: messageData.body as AnyWhiteboardNode,
              addedManually: false,
            })
          );
        })
    );

    // Listen to WHITEBOARD_NODE_DELETED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardNodeDeleted),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId)
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .subscribe(([messageData, _context]) => {
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeDeletedRemotely({
              deletedNodeId: messageData.context.nodeId,
            })
          );
        })
    );

    // Listen to WHITEBOARD_NODE_BLOCKED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardNodeBlocked),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<IWhiteboardNodeBlockUpdate>) => {
          // Convert incoming message to ngRx Update type
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeBlockedRemotely({
              update: {
                id: messageData.context.nodeId,
                changes: messageData.body,
              } as Update<IWhiteboardNodeBlockUpdate>,
            })
          );
        })
    );

    // Listen to WHITEBOARD_NODE_MOVED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardNodeMoved),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<IWhiteboardNodePositionUpdate[]>) => {
          // Convert incoming message to ngRx Update type
          const updates = messageData.body.map((positionUpdate: IWhiteboardNodePositionUpdate) => {
            return { id: positionUpdate.id, changes: { x: positionUpdate.x, y: positionUpdate.y } };
          });
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodesPositionUpdatedRemotely({
              updates: updates as Update<AnyWhiteboardNode>[],
            })
          );
        })
    );

    // Listen to WHITEBOARD_USER_JOINED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardUserJoined),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<IUserForWhiteboard>) => {
          this.store.dispatch(WhiteboardMetadataActions.WhiteboardUserJoined({ user: messageData.body }));
        })
    );

    // Listen to WHITEBOARD_USER_LEFT websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.WhiteboardUserLeft)))
        .subscribe((messageData: IMessage<IUserForWhiteboard>) => {
          this.store.dispatch(WhiteboardMetadataActions.WhiteboardUserLeft({ userId: messageData.context.userId }));

          // Unblock all nodes that are still blocked by the user that left
          this.store
            .select(selectWhiteboardNodesBlockedByUserId(messageData.context.userId))
            .pipe(take(1))
            .subscribe((blockedNodeIds: string[]) => {
              this.store.dispatch(
                WhiteboardNodeActions.WhiteboardUnblockAllNodesOnUserLeft({
                  updates: blockedNodeIds.map((nodeId: string) => {
                    return { id: nodeId, changes: { temporary: { blockedBy: null } } };
                  }) as Update<IWhiteboardNodeBlockUpdate>[],
                })
              );
            });
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
