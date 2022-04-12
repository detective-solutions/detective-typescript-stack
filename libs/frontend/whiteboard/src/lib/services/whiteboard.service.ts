import { ForceDirectedGraph, Node, WhiteboardComponent } from '../model';
import { Subject, of } from 'rxjs';

import { D3Service } from './d3.service';
import { Injectable } from '@angular/core';

@Injectable()
export class WhiteboardService {
  options = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  graph!: ForceDirectedGraph;
  rootSVGElement!: SVGElement | null;

  dummyNodes: Node[] = [];
  availableWhiteboardComponents: WhiteboardComponent[] = [];
  nodes$ = of(this.dummyNodes);

  whiteboardSelection$: Subject<string | null> = new Subject();

  // links = [new Link(this.dummyNodes[0], this.dummyNodes[1])];
  links = [];
  links$ = of(this.links);

  selectedWhiteboardElements: WhiteboardComponent[] = [];

  nodeNodesIndex = 4;

  constructor(private readonly d3Service: D3Service) {
    this.getForceDirectedGraph();
  }

  addElement(zoomContainerElement: SVGGraphicsElement, x: number, y: number) {
    const convertedDOMPoint = this.convertDOMToSVGCoordinates(zoomContainerElement, x, y);
    const node = new Node(String(this.nodeNodesIndex), convertedDOMPoint.x, convertedDOMPoint.y);

    this.dummyNodes.push(node);
    ++this.nodeNodesIndex;

    this.graph.initNodes();
    this.graph.initLinks();

    // Necessary to simulate collusion when adding new elements
    // TODO: Read documentation about alphaTarget value
    this.graph.simulation.alphaTarget(1).restart();
  }

  getForceDirectedGraph() {
    this.graph = this.d3Service.getForceDirectedGraph(this.dummyNodes, this.links, this.options);
  }

  registerWhiteboardComponent(component: WhiteboardComponent) {
    this.availableWhiteboardComponents.push(component);
    this.applyDragBehavior(component);
    this.d3Service.addZoomPreventionEventHandler(component.elementRef.nativeElement);
  }

  setupWhiteboardComponentEventHandler(component: WhiteboardComponent) {
    this.d3Service.addZoomPreventionEventHandler(component.elementRef.nativeElement);
  }

  addSelectedElement(selectedElementComponent: WhiteboardComponent) {
    this.whiteboardSelection$.next(selectedElementComponent.id);
    this.selectedWhiteboardElements.push(selectedElementComponent);
  }

  resetSelection() {
    this.whiteboardSelection$.next(null);
    this.selectedWhiteboardElements = [];
  }

  applyZoomBehavior(elementToZoomOn: Element, zoomContainer: Element) {
    this.d3Service.applyZoomBehavior(elementToZoomOn, zoomContainer);
  }

  applyDragBehavior(component: WhiteboardComponent) {
    this.d3Service.applyDragBehavior(component.elementRef.nativeElement, component.node, this.graph);
  }

  /**
   * Convert DOM coordinates to SVG coordinates based on SVG offset and zoom level
   */
  convertDOMToSVGCoordinates(zoomContainerElement: SVGGraphicsElement, x: number, y: number): DOMPoint {
    const screenCTM = zoomContainerElement.getScreenCTM();
    if (!screenCTM) {
      throw new Error('Could not get screen CTM for the SVG zoom group while transforming DOM to SVG coordinates');
    }
    return new DOMPoint(x, y).matrixTransform(screenCTM.inverse());
  }
}
