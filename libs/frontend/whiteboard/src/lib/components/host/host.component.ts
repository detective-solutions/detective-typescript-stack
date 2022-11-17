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
  IWhiteboardNodeSizeUpdate,
  MessageEventType,
  WhiteboardNodeType,
  WhiteboardOptions,
} from '@detective.solutions/shared/data-access';
import {
  EmbeddingWhiteboardNode,
  ForceDirectedGraph,
  IWhiteboardCollaborationCursor,
  TableWhiteboardNode,
} from '../../models';
import {
  Subject,
  Subscription,
  combineLatest,
  debounceTime,
  delayWhen,
  filter,
  map,
  pluck,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  WhiteboardGeneralActions,
  WhiteboardMetadataActions,
  WhiteboardNodeActions,
  selectActiveUsers,
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

  collaborationCursors: IWhiteboardCollaborationCursor[] = [];

  readonly whiteboardNodes$ = this.whiteboardFacade.whiteboardNodes$.pipe(
    // Buffer node updates while user is dragging
    delayWhen(() => this.whiteboardFacade.isDragging$.pipe(filter((isDragging: boolean) => !isDragging))),
    // Update underlying graph nodes
    tap((nodes: AnyWhiteboardNode[]) => this.forceGraph.updateNodes(nodes))
  );
  readonly isWhiteboardInitialized$ = this.whiteboardFacade.isWhiteboardInitialized$;
  readonly isConnectedToWebSocketServer$ = this.whiteboardFacade.isConnectedToWebSocketServer$;
  readonly webSocketConnectionFailedEventually$ = this.whiteboardFacade.webSocketConnectionFailedEventually$;
  readonly cursorMovement$ = new Subject<MouseEvent>();

  readonly forceGraph: ForceDirectedGraph = this.whiteboardFacade.getForceGraph(HostComponent.options);
  readonly nodeType = WhiteboardNodeType;
  readonly cursorTimeoutInterval = 7000;
  readonly whiteboardHtmlId = 'whiteboard';

  private readonly subscriptions = new Subscription();

  // Reset element selection when clicking blank space on the whiteboard
  @HostListener('pointerdown', ['$event'])
  private resetElementSelection(event: PointerEvent) {
    (event.target as HTMLElement).id === this.whiteboardHtmlId && this.whiteboardFacade.resetSelection();
  }

  @HostListener('mousemove', ['$event'])
  private mirrorCursorMovement(event: MouseEvent) {
    this.cursorMovement$.next(event);
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
              id: '9ebc4871-7135-11ec-a2d9-287fcf6e439d',
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
          // const href = 'https://www.simplesite.com';
          const embeddingNode = EmbeddingWhiteboardNode.Build({
            id: uuidv4(),
            title: '',
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

  trackCollaborationCursorByUserId(_index: number, collaborationCursor: IWhiteboardCollaborationCursor) {
    return collaborationCursor.userInfo.id;
  }

  getUserFullName(user: IUserForWhiteboard) {
    return `${user.firstname} ${user.lastname}`;
  }

  getUserInitialia(user: IUserForWhiteboard) {
    return (user.firstname.charAt(0) + user.lastname.charAt(0)).toUpperCase();
  }

  private initializeCollaborationSubscriptions() {
    this.subscriptions.add(
      // Debounce outgoing cursor updates to dispatch only if mouse wasn't moved for at least 300 ms
      this.cursorMovement$.pipe(debounceTime(300)).subscribe((event: MouseEvent) => {
        const convertedCoordinates = this.convertDOMToSVGCoordinates(event.x, event.y);
        this.store.dispatch(
          WhiteboardGeneralActions.WhiteboardCursorMoved({ x: convertedCoordinates.x, y: convertedCoordinates.y })
        );
      })
    );

    // Listen to LOAD_WHITEBOARD_DATA websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.LoadWhiteboardData)),
          pluck('body')
        )
        .subscribe((messageData: ICachableCasefileForWhiteboard) =>
          this.store.dispatch(
            WhiteboardGeneralActions.WhiteboardDataLoaded({
              casefile: messageData,
            })
          )
        )
    );

    // Listen to WHITEBOARD_CURSOR_MOVED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardCursorMoved),
              this.store.select(selectWhiteboardContextState),
              this.store.select(selectActiveUsers),
            ])
          ),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          filter(([messageData, context, _activeUsers]) => messageData.context.userId !== context.userId)
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .subscribe(([messageData, _context, activeUsers]) =>
          this.handleIncomingCollaborationCursor(messageData, activeUsers)
        )
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
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<AnyWhiteboardNode>) =>
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeAdded({
              addedNode: messageData.body as AnyWhiteboardNode,
              addedManually: false,
            })
          )
        )
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
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<null>) =>
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeDeletedRemotely({
              deletedNodeId: messageData.context.nodeId as string,
            })
          )
        )
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
        .subscribe((messageData: IMessage<IWhiteboardNodeBlockUpdate>) =>
          // Convert incoming message to ngRx Update type
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeBlockedRemotely({
              update: {
                id: messageData.context.nodeId,
                changes: messageData.body,
              } as Update<IWhiteboardNodeBlockUpdate>,
            })
          )
        )
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
              updates: updates as Update<IWhiteboardNodePositionUpdate>[],
            })
          );
        })
    );

    // Listen to WHITEBOARD_NODE_RESIZED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardNodeResized),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<IWhiteboardNodeSizeUpdate>) =>
          // Convert incoming message to ngRx Update type
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeResizedRemotely({
              update: {
                id: messageData.context.nodeId,
                changes: messageData.body,
              } as Update<IWhiteboardNodeSizeUpdate>,
            })
          )
        )
    );

    // Listen to WHITEBOARD_USER_JOINED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardUserJoined),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
              this.store.select(selectActiveUsers).pipe(take(1)),
            ])
          ),
          filter(
            ([messageData, context, activeUsers]) =>
              messageData.context.userId !== context.userId &&
              !activeUsers.some((user: IUserForWhiteboard) => user.id === messageData.body) // Check if user already exists
          ),

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context, _activeUsers]) => messageData)
        )
        .subscribe((messageData: IMessage<IUserForWhiteboard>) =>
          this.store.dispatch(WhiteboardMetadataActions.WhiteboardUserJoined({ user: messageData.body }))
        )
    );

    // Listen to WHITEBOARD_USER_LEFT websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardUserLeft),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<IUserForWhiteboard>) => {
          this.store.dispatch(WhiteboardMetadataActions.WhiteboardUserLeft({ userId: messageData.context.userId }));
          // Remove collaboration cursor
          this.collaborationCursors = this.collaborationCursors.filter(
            (cursor: IWhiteboardCollaborationCursor) => cursor.userInfo.id !== messageData.context.userId
          );
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

    // Listen to WHITEBOARD_TITLE_FOCUSED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardTitleFocused),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<string | null>) =>
          this.store.dispatch(
            WhiteboardMetadataActions.WhiteboardTitleFocusedRemotely({ titleFocusedBy: messageData.body })
          )
        )
    );

    // Listen to WHITEBOARD_TITLE_UPDATED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(switchMap((webSocketSubject$) => webSocketSubject$.on$(MessageEventType.WhiteboardTitleUpdated)))
        .subscribe((messageData: IMessage<string>) =>
          this.store.dispatch(WhiteboardMetadataActions.WhiteboardTitleUpdatedRemotely({ title: messageData.body }))
        )
    );
  }

  private convertDOMToSVGCoordinates(x: number, y: number): DOMPoint {
    const screenCTM = this.zoomContainerElement.nativeElement.getScreenCTM();
    if (!screenCTM) {
      throw new Error('Could not get screen CTM for the SVG zoom group while transforming DOM to SVG coordinates');
    }
    return new DOMPoint(x, y).matrixTransform(screenCTM.inverse());
  }

  private handleIncomingCollaborationCursor(
    messageData: IMessage<IWhiteboardCollaborationCursor>,
    activeUsers: IUserForWhiteboard[]
  ) {
    const userInfo = activeUsers.find((user: IUserForWhiteboard) => user.id === messageData.context.userId);
    if (userInfo) {
      const existingCursor = this.collaborationCursors.find(
        (cursor: IWhiteboardCollaborationCursor) => cursor.userInfo.id === messageData.context.userId
      );

      const cursorTimeoutHandler = () => {
        this.collaborationCursors = this.collaborationCursors.filter(
          (cursor: IWhiteboardCollaborationCursor) => cursor.userInfo.id !== existingCursor?.userInfo.id
        );
      };

      if (existingCursor) {
        window.clearInterval(existingCursor.timeout);
        existingCursor.x = messageData.body.x;
        existingCursor.y = messageData.body.y;
        existingCursor.timeout = window.setTimeout(cursorTimeoutHandler, this.cursorTimeoutInterval);
      } else {
        this.collaborationCursors.push({
          x: messageData.body.x,
          y: messageData.body.y,
          userInfo: userInfo,
          timeout: window.setTimeout(cursorTimeoutHandler, this.cursorTimeoutInterval),
        });
      }
    }
  }
}
