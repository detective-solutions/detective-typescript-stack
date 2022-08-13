import { Actions, ofType } from '@ngrx/effects';
import { AnyWhiteboardNode, ForceDirectedGraph, Link, NodeComponent, WhiteboardOptions } from '../models';
import {
  BufferService,
  D3AdapterService,
  DragService,
  WebSocketService,
  WhiteboardSelectionService,
} from './internal-services';
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
    this.actions$.pipe(ofType(WhiteboardGeneralActions.whiteboardDataLoaded)),
    this.webSocketService.isConnectedToWebSocketServer$,
  ]).pipe(
    map(
      ([isWhiteboardDataLoaded, isConnectedToWebSocketServer]) => isWhiteboardDataLoaded && isConnectedToWebSocketServer
    )
  );
  readonly whiteboardSelection$ = this.whiteboardSelectionService.whiteboardSelection$;
  readonly isDragging$ = this.dragService.isDragging$;

  // TODO: Test if delayWhen operator works as expected when additional actions are implemented
  // readonly getWebSocketSubjectAsync$ = this.webSocketService.getWebSocketSubjectAsync$.pipe(
  //   // Delay subscribing to web socket until whiteboard data is loaded (incoming messages will be buffered)
  //   delayWhen(() => this.isWhiteboardInitialized$.pipe(filter((isInitialized: boolean) => !isInitialized)))
  // );
  readonly getWebSocketSubjectAsync$ = this.webSocketService.getWebSocketSubjectAsync$;

  readonly isConnectedToWebSocketServer$ = this.webSocketService.isConnectedToWebSocketServer$;
  readonly webSocketConnectionFailedEventually$ = this.webSocketService.webSocketConnectionFailedEventually$;

  initializeWhiteboard(whiteboardContainerElement: Element, zoomContainerElement: Element) {
    this.d3AdapterService.applyZoomBehavior(whiteboardContainerElement, zoomContainerElement);
    this.webSocketService.establishWebsocketConnection();
    this.store.dispatch(WhiteboardGeneralActions.loadWhiteboardData());

    // TODO: Remove these mocked data when action is triggered by backend response
    // setTimeout(() => {
    //   this.store.dispatch(WhiteboardNodeActions.whiteboardDataLoaded({ nodes: dummyNodes }));
    // }, 500);
  }

  getForceGraph(options: WhiteboardOptions): ForceDirectedGraph {
    return this.d3AdapterService.getForceDirectedGraph(options);
  }

  resetWhiteboard() {
    this.webSocketService.resetWebsocketConnection();
    this.store.dispatch(WhiteboardGeneralActions.resetWhiteboardData());
  }

  addSelectedElement(selectedElementComponent: NodeComponent) {
    this.whiteboardSelectionService.addSelectedNode(selectedElementComponent);
  }

  resetSelection() {
    this.whiteboardSelectionService.resetSelection();
  }

  applyDragBehaviorToComponent(component: NodeComponent) {
    this.d3AdapterService.applyDragBehavior(component.elementRef.nativeElement, component.node);
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

  addToNodeLayoutUpdateBuffer(node: AnyWhiteboardNode) {
    this.bufferService.addToNodeLayoutUpdateBuffer(node);
  }

  updateNodeLayoutsFromBuffer() {
    this.bufferService.updateNodeLayoutsFromBuffer();
  }

  sendWebsocketMessage(message: EventBasedWebSocketMessage) {
    this.webSocketService.publishMessage(message);
  }

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly bufferService: BufferService,
    private readonly d3AdapterService: D3AdapterService,
    private readonly dragService: DragService,
    private readonly webSocketService: WebSocketService,
    private readonly whiteboardSelectionService: WhiteboardSelectionService
  ) {}
}
