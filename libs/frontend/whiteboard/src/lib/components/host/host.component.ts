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
  IWhiteboardNodePropertiesUpdate,
  MessageEventType,
  WhiteboardNodeType,
  WhiteboardOptions,
} from '@detective.solutions/shared/data-access';
import {
  DisplayWhiteboardNode,
  EmbeddingWhiteboardNode,
  ForceDirectedGraph,
  IWhiteboardCollaborationCursor,
  TableWhiteboardNode,
  UploadResponse,
} from '../../models';
import { Subject, Subscription, combineLatest, debounceTime, delayWhen, filter, map, switchMap, take, tap } from 'rxjs';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import {
  WhiteboardGeneralActions,
  WhiteboardMetadataActions,
  WhiteboardNodeActions,
  selectActiveUsers,
  selectWhiteboardContextState,
  selectWhiteboardNodesBlockedByUserId,
} from '../../state';

import { DomSanitizer } from '@angular/platform-browser';
import { IWhiteboardContextState } from '../../state/interfaces';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WHITEBOARD_NODE_SIBLING_ELEMENT_ID_PREFIX } from '../../utils';
import { WhiteboardFacadeService } from '../../services';
import { formatDate } from '@detective.solutions/shared/utils';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

  private cdkOverlay: HTMLElement;
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
    private readonly store: Store,
    private readonly sanitizer: DomSanitizer,
    private readonly toastService: ToastService,
    private readonly overlayContainer: OverlayContainer
  ) {
    // As the overlay is not part of Angular Material, we need to inject the theme class manually
    this.cdkOverlay = this.overlayContainer.getContainerElement();
    this.cdkOverlay.classList.add('default-theme'); // TODO: Inject a theme service to provide the current theme
  }

  ngOnInit() {
    // Bind Angular change detection to each graph tick for render sync
    this.subscriptions.add(this.forceGraph.ticker$.subscribe(() => this.changeDetectorRef.markForCheck()));

    // Handle position updates caused by the graph force
    this.subscriptions.add(
      this.forceGraph.nodePositionUpdatedByForce$.subscribe((node: AnyWhiteboardNode) =>
        this.whiteboardFacade.addToNodePositionBuffer(node)
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
    event.preventDefault();
    this.buildNodeByType(event);
  }

  buildNodeByType(event: DragEvent) {
    // TODO: Add interface for drag data transfer object
    const dragDataTransfer = JSON.parse(event.dataTransfer?.getData('text/plain') ?? '');
    if (!dragDataTransfer) {
      console.error('Could not extract drag data for adding whiteboard node');
    }
    const now = formatDate(new Date());
    const convertedDOMPoint = this.convertDOMToSVGCoordinates(event.clientX, event.clientY);
    const isFile = event.dataTransfer?.files.length !== 0;
    const defaultMargin = 50;
    const defaultWidth = 900;
    const defaultHeight = 500;

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
    const dataTransfer = event.dataTransfer || { files: [] };

    const defaultNode = TableWhiteboardNode.Build({
      id: '99999999-9999-9999-9999-999999999999',
      title: 'error',
      x: convertedDOMPoint.x,
      y: convertedDOMPoint.y,
      width: defaultWidth,
      height: defaultHeight,
      locked: false,
      lastUpdatedBy: ' ',
      lastUpdated: now,
      created: now,
      entity: {
        id: ' ',
      },
    });

    if (isFile) {
      this.toastService.showToast(
        `Upload file ${dataTransfer.files[0].name} this might take a while`,
        '',
        ToastType.INFO,
        {
          duration: 4000,
        }
      );
      this.whiteboardFacade.uploadFile(event).subscribe((response: UploadResponse) => {
        this.store
          .select(selectWhiteboardContextState)
          .pipe(take(1))
          .subscribe((context: IWhiteboardContextState) => {
            if (isFile && response.success) {
              if (response.nodeType === 'display') {
                for (let i = 0; i < dataTransfer.files.length; i++) {
                  const margin = i * (defaultMargin + defaultWidth) || 0;
                  convertedDOMPoint.x += margin;

                  const file = dataTransfer.files[i];
                  const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file)) || '';

                  const displayNode = DisplayWhiteboardNode.Build({
                    id: response.xid,
                    title: file.name,
                    fileName: file.name,
                    pageCount: response.setup.pageCount || 0,
                    currentIndex: 0,
                    pages: response.setup.pages || [],
                    currentLink: (response.setup.pages || [''])[0],
                    expires: new Date(),
                    x: convertedDOMPoint.x,
                    y: convertedDOMPoint.y,
                    width: defaultWidth,
                    height: defaultHeight,
                    locked: false,
                    file: { file, url },
                    author: '78b4daab-dfe4-4bad-855f-ac575cc59730',
                    editors: [{ id: '78b4daab-dfe4-4bad-855f-ac575cc59730' }],
                    lastUpdatedBy: '78b4daab-dfe4-4bad-855f-ac575cc59730',
                    lastUpdated: now,
                    created: now,
                  });

                  this.store.dispatch(
                    WhiteboardNodeActions.WhiteboardNodeAdded({
                      addedNode: displayNode,
                      addedManually: true,
                    })
                  );
                }
              }

              if (response.nodeType === 'table') {
                // TODO: Remove when data from dragged element is used
                const tableNode = TableWhiteboardNode.Build({
                  id: response.xid,
                  title: randomTitles[Math.floor(Math.random() * randomTitles.length)],
                  x: convertedDOMPoint.x,
                  y: convertedDOMPoint.y,
                  width: defaultWidth,
                  height: defaultHeight,
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
            }
          });
      });
    } else {
      this.store
        .select(selectWhiteboardContextState)
        .pipe(take(1))
        .subscribe((context: IWhiteboardContextState) => {
          const dragDataTransfer = JSON.parse(event.dataTransfer?.getData('text/plain') ?? '');

          if (!dragDataTransfer) {
            console.error('Could not extract drag data for adding whiteboard node');
            return defaultNode;
          }

          if (dragDataTransfer.type === WhiteboardNodeType.TABLE) {
            // TODO: Remove when data from dragged element is used
            const tableNode = TableWhiteboardNode.Build({
              id: uuidv4(),
              title: randomTitles[Math.floor(Math.random() * randomTitles.length)],
              x: convertedDOMPoint.x,
              y: convertedDOMPoint.y,
              width: defaultWidth,
              height: defaultHeight,
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
            const embeddingNode = EmbeddingWhiteboardNode.Build({
              id: uuidv4(),
              title: '',
              x: convertedDOMPoint.x,
              y: convertedDOMPoint.y,
              width: defaultWidth,
              height: 50,
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
          map((webSocketResponse: any) => webSocketResponse?.body)
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
        .subscribe((messageData: IMessage<null>) => {
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeDeletedRemotely({
              deletedNodeId: messageData.context.nodeId as string,
            })
          );
          this.deleteWhiteboardNodeSiblingElement(
            WHITEBOARD_NODE_SIBLING_ELEMENT_ID_PREFIX + messageData.context.nodeId
          );
        })
    );

    // Listen to WHITEBOARD_NODE_BLOCKED websocket message event
    // this.subscriptions.add(
    //   this.whiteboardFacade.getWebSocketSubjectAsync$
    //     .pipe(
    //       switchMap((webSocketSubject$) =>
    //         combineLatest([
    //           webSocketSubject$.on$(MessageEventType.WhiteboardNodeBlocked),
    //           this.store.select(selectWhiteboardContextState).pipe(take(1)),
    //         ])
    //       ),
    //       filter(([messageData, context]) => messageData.context.userId !== context.userId),
    //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //       map(([messageData, _context]) => messageData)
    //     )
    //     .subscribe((messageData: IMessage<IWhiteboardNodeBlockUpdate>) =>
    //       // Convert incoming message to ngRx Update type
    //       this.store.dispatch(
    //         WhiteboardNodeActions.WhiteboardNodeBlockedRemotely({
    //           update: {
    //             id: messageData.context.nodeId,
    //             changes: messageData.body,
    //           } as Update<IWhiteboardNodeBlockUpdate>,
    //         })
    //       )
    //     )
    // );

    // Listen to WHITEBOARD_NODE_PROPERTIES_UPDATED websocket message event
    this.subscriptions.add(
      this.whiteboardFacade.getWebSocketSubjectAsync$
        .pipe(
          switchMap((webSocketSubject$) =>
            combineLatest([
              webSocketSubject$.on$(MessageEventType.WhiteboardNodePropertiesUpdated),
              this.store.select(selectWhiteboardContextState).pipe(take(1)),
            ])
          ),
          filter(([messageData, context]) => messageData.context.userId !== context.userId),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          map(([messageData, _context]) => messageData)
        )
        .subscribe((messageData: IMessage<IWhiteboardNodePropertiesUpdate[]>) => {
          // Convert incoming message to ngRx Update type
          const updates: Update<IWhiteboardNodePropertiesUpdate>[] = [];
          messageData.body.forEach((propertiesUpdate: IWhiteboardNodePropertiesUpdate) => {
            const { nodeId, ...actualUpdatedProperties } = propertiesUpdate;
            updates.push({ id: nodeId, changes: actualUpdatedProperties });
          });
          this.store.dispatch(WhiteboardNodeActions.WhiteboardNodePropertiesUpdatedRemotely({ updates }));
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

  private deleteWhiteboardNodeSiblingElement(elementId: string) {
    const nodeSiblingElement = document.getElementById(elementId);
    if (nodeSiblingElement) {
      nodeSiblingElement.remove();
    }
  }
}
