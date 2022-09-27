import { Actions, ofType } from '@ngrx/effects';
import { AnyWhiteboardNode, WhiteboardOptions } from '@detective.solutions/shared/data-access';
import {
  BufferService,
  D3AdapterService,
  DragService,
  WebSocketService,
  WhiteboardSelectionService,
  WhiteboardUserService,
} from './internal-services';
import { ForceDirectedGraph, Link, NodeComponent } from '../models';
import { Observable, combineLatest, map, of } from 'rxjs';
import { WhiteboardGeneralActions, selectAllWhiteboardNodes } from '../state';

import { EventBasedWebSocketMessage } from '@detective.solutions/rx-websocket-wrapper';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

@Injectable()
export class WhiteboardFacadeService {
  readonly whiteboardNodes$: Observable<AnyWhiteboardNode[]> = this.store.select(selectAllWhiteboardNodes);
  readonly whiteboardLinks$: Observable<Link[]> = of([]);
  readonly isWhiteboardInitialized$: Observable<boolean> = combineLatest([
    this.actions$.pipe(ofType(WhiteboardGeneralActions.WhiteboardDataLoaded)),
    this.webSocketService.isConnectedToWebSocketServer$,
  ]).pipe(
    map(
      ([isWhiteboardDataLoaded, isConnectedToWebSocketServer]) => isWhiteboardDataLoaded && isConnectedToWebSocketServer
    )
  );
  readonly isConnectedToWebSocketServer$ = this.webSocketService.isConnectedToWebSocketServer$;
  readonly webSocketConnectionFailedEventually$ = this.webSocketService.webSocketConnectionFailedEventually$;
  readonly getWebSocketSubjectAsync$ = this.webSocketService.getWebSocketSubjectAsync$;
  readonly isDragging$ = this.dragService.isDragging$;
  readonly whiteboardSelection$ = this.whiteboardSelectionService.whiteboardSelection$;

  initializeWhiteboard(whiteboardContainerElement: Element, zoomContainerElement: Element) {
    this.d3AdapterService.applyZoomBehavior(whiteboardContainerElement, zoomContainerElement);
    this.webSocketService.establishWebsocketConnection();
  }

  getForceGraph(options: WhiteboardOptions): ForceDirectedGraph {
    return this.d3AdapterService.getForceDirectedGraph(options);
  }

  resetWhiteboard() {
    this.webSocketService.resetWebsocketConnection();
    this.store.dispatch(WhiteboardGeneralActions.ResetWhiteboardData());
  }

  addSelectedNode(selectedNodeId: string, currentUserId: string) {
    this.whiteboardSelectionService.addSelectedNode(selectedNodeId, currentUserId);
  }

  resetSelection() {
    this.whiteboardSelectionService.resetSelection();
  }

  applyDragBehaviorToComponent(component: NodeComponent, currentUserId: string) {
    this.d3AdapterService.applyDragBehavior(component.elementRef.nativeElement, component.node, currentUserId);
  }

  activateDragging() {
    this.dragService.activateDragging();
  }

  addDelayedDragHandling(event: Event) {
    this.dragService.addDelayedDragHandling(event);
  }

  removeDelayedDragHandling() {
    this.dragService.removeDelayedDragHandling();
  }

  addToNodeUpdateBuffer(node: AnyWhiteboardNode) {
    this.bufferService.addToNodeUpdateBuffer(node);
  }

  updateNodesFromBuffer() {
    this.bufferService.updateNodesFromBuffer();
  }

  sendWebsocketMessage(message: EventBasedWebSocketMessage) {
    this.webSocketService.publishMessage(message);
  }

  getWhiteboardUserById(id: string) {
    return this.whiteboardUserService.getWhiteboardUserById(id);
  }

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly bufferService: BufferService,
    private readonly d3AdapterService: D3AdapterService,
    private readonly dragService: DragService,
    private readonly webSocketService: WebSocketService,
    private readonly whiteboardSelectionService: WhiteboardSelectionService,
    private readonly whiteboardUserService: WhiteboardUserService
  ) {}
}
