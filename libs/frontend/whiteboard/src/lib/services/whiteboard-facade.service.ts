import { Actions, ofType } from '@ngrx/effects';
import { D3AdapterService, DragService, WebSocketService, WhiteboardSelectionService } from './internal-services';
import { ForceDirectedGraph, INodeInput, Link, Node, NodeComponent, WhiteboardOptions } from '../models';
import { Observable, combineLatest, map, of } from 'rxjs';

import { EventBasedWebSocketMessage } from '@detective.solutions/rx-websocket-wrapper';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WhiteboardActions } from '../state/actions';
import { dummyNodes } from './whiteboard-dummy-data';
import { selectWhiteboardNodes } from '../state/selectors';

/* eslint-disable ngrx/avoid-dispatching-multiple-actions-sequentially */ // TODO: Remove this when data is loaded from backend

@Injectable()
export class WhiteboardFacadeService {
  readonly whiteboardNodes$: Observable<Node[]> = this.store.select(selectWhiteboardNodes);
  readonly whiteboardLinks$: Observable<Link[]> = of([]);

  readonly isWhiteboardInitialized$: Observable<boolean> = combineLatest([
    this.actions$.pipe(ofType(WhiteboardActions.whiteboardDataLoaded)),
    this.webSocketService.isConnectedToWebSocketServer$,
  ]).pipe(
    map(
      ([isWhiteboardDataLoaded, isConnectedToWebSocketServer]) => isWhiteboardDataLoaded && isConnectedToWebSocketServer
    )
  );

  readonly whiteboardSelection$ = this.whiteboardSelectionService.whiteboardSelection$;
  readonly isDragging$ = this.dragService.isDragging$;
  readonly webSocket$ = this.webSocketService.webSocket$;
  readonly isConnectedToWebSocketServer$ = this.webSocketService.isConnectedToWebSocketServer$;
  readonly webSocketConnectionFailedEventually$ = this.webSocketService.webSocketConnectionFailedEventually$;

  initializeWhiteboard(whiteboardContainerElement: Element, zoomContainerElement: Element) {
    this.applyZoomBehavior(whiteboardContainerElement, zoomContainerElement);
    this.establishWebsocketConnection();
    this.store.dispatch(WhiteboardActions.loadWhiteboardData());

    // TODO: Remove these mocked data when action is triggered by backend response
    setTimeout(() => {
      this.store.dispatch(WhiteboardActions.whiteboardDataLoaded({ nodes: dummyNodes }));
    }, 500);
  }

  getForceGraph(options: WhiteboardOptions): ForceDirectedGraph {
    return this.getForceDirectedGraph(options);
  }

  applyDragBehaviorToComponent(component: NodeComponent) {
    this.d3AdapterServe.applyDragBehavior(component.elementRef.nativeElement, component.node);
  }

  resetWhiteboard() {
    this.webSocketService.resetWebsocketConnection();
    this.store.dispatch(WhiteboardActions.resetWhiteboardData());
  }

  addElementToWhiteboard(elementToAdd: INodeInput) {
    this.store.dispatch(WhiteboardActions.WhiteboardNodeAdded({ addedNode: elementToAdd }));
  }

  addSelectedElement(selectedElementComponent: NodeComponent) {
    this.whiteboardSelectionService.addSelectedNode(selectedElementComponent);
  }

  resetSelection() {
    this.whiteboardSelectionService.resetSelection();
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

  addToNodeLayoutUpdateBuffer(node: Node) {
    this.dragService.addToNodeLayoutUpdateBuffer(node);
  }

  updateNodeLayoutsFromBuffer() {
    this.dragService.updateNodeLayoutsFromBuffer();
  }

  sendWebsocketMessage(message: EventBasedWebSocketMessage) {
    this.webSocketService.publishMessage(message);
  }

  private establishWebsocketConnection() {
    this.webSocketService.establishWebsocketConnection();
  }

  private getForceDirectedGraph(whiteboardOptions: WhiteboardOptions): ForceDirectedGraph {
    return this.d3AdapterServe.getForceDirectedGraph(whiteboardOptions);
  }

  private applyZoomBehavior(whiteboardContainerElement: Element, zoomContainerElement: Element) {
    this.d3AdapterServe.applyZoomBehavior(whiteboardContainerElement, zoomContainerElement);
  }

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly dragService: DragService,
    private readonly d3AdapterServe: D3AdapterService,
    private readonly whiteboardSelectionService: WhiteboardSelectionService,
    private readonly webSocketService: WebSocketService
  ) {}
}
