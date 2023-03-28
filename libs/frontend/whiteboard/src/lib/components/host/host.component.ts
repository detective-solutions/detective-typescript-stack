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
  ComponentCanDeactivate,
  DisplayWhiteboardNode,
  EmbeddingWhiteboardNode,
  ForceDirectedGraph,
  IWhiteboardCollaborationCursor,
  IWhiteboardNodeDragData,
  TableWhiteboardNode,
} from '../../models';
import {
  Observable,
  Subject,
  Subscription,
  combineLatest,
  debounceTime,
  delayWhen,
  filter,
  map,
  of,
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

import { DomSanitizer } from '@angular/platform-browser';
import { IWhiteboardContextState } from '../../state/interfaces';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WHITEBOARD_NODE_SIBLING_ELEMENT_ID_PREFIX } from '../../utils';
import { WhiteboardFacadeService } from '../../services';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: 'whiteboard-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HostComponent implements OnInit, AfterViewInit, OnDestroy, ComponentCanDeactivate {
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

  canDeactivate(): boolean | Observable<boolean> {
    return of(true);
  }

  onElementDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onElementDrop(event: DragEvent) {
    event.preventDefault();
    this.buildNodeByType(event);
  }

  buildNodeByType(event: DragEvent) {
    this.store
      .select(selectWhiteboardContextState)
      .pipe(take(1))
      .subscribe((context: IWhiteboardContextState) => {
        const now = new Date().toISOString();
        const convertedDOMPoint = this.convertDOMToSVGCoordinates(event.clientX, event.clientY);
        const defaultMargin = 50;

        let addedNode;
        const defaultNodeConfig = {
          id: uuidv4(),
          x: convertedDOMPoint.x,
          y: convertedDOMPoint.y,
          width: 900,
          height: 500,
          locked: false,
          lastUpdated: now,
          lastUpdatedBy: context.userId,
          created: now,
          editors: [{ id: context.userId }],
        };

        const isFile = event.dataTransfer?.files && event.dataTransfer?.files.length !== 0;
        if (isFile) {
          for (let i = 0; i < event.dataTransfer.files.length; i++) {
            const margin = i * (defaultMargin + defaultNodeConfig.width) || 0;
            convertedDOMPoint.x += margin;

            const fileToUpload = event.dataTransfer.files[i];
            if (!fileToUpload) {
              console.error(event);
              throw new Error('Could not extract file from drag event');
            }

            addedNode = DisplayWhiteboardNode.Build({
              ...defaultNodeConfig,
              title: fileToUpload.name,
              author: context.userId,
              editors: [{ id: context.userId }],
              temporary: { file: fileToUpload },
            });
          }
        } else {
          const dragData = JSON.parse(event.dataTransfer?.getData('text/plain') ?? '') as IWhiteboardNodeDragData;
          if (!dragData) {
            throw new Error('Could not extract drag data for adding whiteboard node');
          }

          switch (dragData.type) {
            case WhiteboardNodeType.TABLE: {
              addedNode = TableWhiteboardNode.Build({
                ...defaultNodeConfig,
                title: dragData.title,
                entity: {
                  id: dragData.entityId,
                  baseQuery: dragData.baseQuery,
                },
              });
              break;
            }
            case WhiteboardNodeType.EMBEDDING: {
              addedNode = EmbeddingWhiteboardNode.Build({
                ...defaultNodeConfig,
                title: '',
                author: context.userId,
                editors: [{ id: context.userId }],
              });
              break;
            }
          }
        }
        this.store.dispatch(
          WhiteboardNodeActions.WhiteboardNodeAdded({
            addedNode: addedNode as AnyWhiteboardNode,
            addedManually: true,
          })
        );
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
