import { ForceDirectedGraph, INodeInput, Node, NodeComponent, WebsocketMessage } from '../models';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription, of } from 'rxjs';

import { D3Service } from './d3.service';
import { WebsocketService } from './websocket.service';

@Injectable()
export class WhiteboardService implements OnDestroy {
  options = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  graph!: ForceDirectedGraph;
  rootSVGElement!: SVGElement | null;
  zoomContainerElement!: SVGGraphicsElement | null;

  dummyNodes: Node[] = [];
  readonly nodes$ = of(this.dummyNodes);

  whiteboardSelection$: Subject<string | null> = new Subject();

  // links = [new Link(this.dummyNodes[0], this.dummyNodes[1])];
  links = [];
  readonly links$ = of(this.links);

  selectedNodeComponents: NodeComponent[] = [];

  private readonly subscriptions = new Subscription();

  constructor(private readonly d3Service: D3Service, private readonly websocketService: WebsocketService) {
    this.getForceDirectedGraph();
  }

  addElementToWhiteboard(elementToAdd: INodeInput) {
    if (!this.zoomContainerElement) {
      this.zoomContainerElement = document.querySelector('#whiteboard g');
      if (!this.zoomContainerElement) {
        throw new Error(
          'Could not add new element, because WhiteboardService has not reference to the zoomContainerElement.'
        );
      }
    }

    const convertedDOMPoint = this.convertDOMToSVGCoordinates(
      this.zoomContainerElement,
      elementToAdd.layout.x,
      elementToAdd.layout.y
    );
    const node = new Node(
      elementToAdd.id,
      elementToAdd.type,
      elementToAdd.title,
      elementToAdd.locked,
      convertedDOMPoint.x,
      convertedDOMPoint.y,
      elementToAdd.layout.width,
      elementToAdd.layout.height
    );

    this.dummyNodes.push(node);

    this.graph.initNodes();
    this.graph.initLinks();

    // Necessary to simulate collusion when adding new elements
    // TODO: Read documentation about alphaTarget value
    this.graph.simulation.alphaTarget(1).restart();
  }

  addSelectedElement(selectedElementComponent: NodeComponent) {
    this.whiteboardSelection$.next(selectedElementComponent.node.id);
    this.selectedNodeComponents.push(selectedElementComponent);
  }

  resetSelection() {
    this.whiteboardSelection$.next(null);
    this.selectedNodeComponents = [];
  }

  applyZoomBehavior(elementToZoomOn: Element, zoomContainer: Element) {
    this.d3Service.applyZoomBehavior(elementToZoomOn, zoomContainer);
  }

  applyDragBehavior(component: NodeComponent) {
    this.d3Service.applyDragBehavior(component.elementRef.nativeElement, component.node, this.graph);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendWebsocketMessage(message: WebsocketMessage<any>) {
    this.websocketService.publishMessage(message);
  }

  convertDOMToSVGCoordinates(zoomContainerElement: SVGGraphicsElement, x: number, y: number): DOMPoint {
    const screenCTM = zoomContainerElement.getScreenCTM();
    if (!screenCTM) {
      throw new Error('Could not get screen CTM for the SVG zoom group while transforming DOM to SVG coordinates');
    }
    return new DOMPoint(x, y).matrixTransform(screenCTM.inverse());
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private getForceDirectedGraph() {
    this.graph = this.d3Service.getForceDirectedGraph(this.dummyNodes, this.links, this.options);
  }
}
