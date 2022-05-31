import { Actions, ofType } from '@ngrx/effects';
import { D3AdapterService, DragService, WebSocketService, WhiteboardSelectionService } from './internal-services';
import { ForceDirectedGraph, INodeInput, Link, Node, NodeComponent, WhiteboardOptions } from '../models';
import { Observable, combineLatest, filter, map, of } from 'rxjs';

import { EventBasedWebSocketMessage } from '@detective.solutions/rx-websocket-wrapper';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WhiteboardActions } from '../state/actions';
import { dummyNodes } from './whiteboard-dummy-data';
import { selectWhiteboardNodes } from '../state/selectors';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable ngrx/avoid-dispatching-multiple-actions-sequentially */ // TODO: Remove this when data is loaded from backend
/* eslint-disable ngrx/avoid-mapping-selectors */ // TODO: Check how to map in selectors

@Injectable()
export class WhiteboardFacadeService {
  readonly whiteboardNodes$: Observable<Node[]> = this.store.select(selectWhiteboardNodes).pipe(
    filter((entities) => !!entities),
    map((entities) => Object.values(entities) as any),
    map((nodeInputs: INodeInput[]) => nodeInputs.map(Node.Build)) // TODO: Move this to selector function
  );

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

  addNodesToUpdateAfterDrag(node: Node) {
    this.dragService.addNodeToUpdateAfterDrag(node);
  }

  updateNodesAfterDrag() {
    this.dragService.updateNodesAfterDrag();
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
