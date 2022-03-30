import { D3DragEvent, SubjectPosition, drag as d3Drag } from 'd3-drag';
import { D3ZoomEvent, zoom as d3Zoom } from 'd3-zoom';
import { ForceDirectedGraph, Link, Node } from '../model';

import { Injectable } from '@angular/core';
import { select as d3Select } from 'd3-selection';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class D3Service {
  static addDragOverlays() {
    D3Service.getDragOverlayElements().forEach((element: Element) => {
      element.setAttribute('style', 'display: block');
    });
  }

  static removeDragOverlays() {
    D3Service.getDragOverlayElements().forEach((element: Element) => {
      element.removeAttribute('style');
    });
  }

  static getDragOverlayElements(): NodeListOf<Element> {
    return document.querySelectorAll('.drag-overlay') ?? [];
  }

  getForceDirectedGraph(nodes: Node[], links: Link[], options: { width: number; height: number }) {
    return new ForceDirectedGraph(nodes, links, options);
  }

  applyZoomBehavior(elementToZoomOn: HTMLElement, containerElement: HTMLElement) {
    const onZoom = (event: D3ZoomEvent<HTMLElement, any>) =>
      d3Select(containerElement).attr('transform', event.transform.toString());

    const zoomBehavior = d3Zoom().on('zoom', onZoom) as any;

    // Handle cursor display while panning
    zoomBehavior.on('start', (event: D3ZoomEvent<any, any>) => {
      if (event.sourceEvent.type !== 'wheel') {
        document.body.style.cursor = 'grabbing';
      }
    });
    zoomBehavior.on('end', () => (document.body.style.cursor = 'default'));

    d3Select(elementToZoomOn).call(zoomBehavior);
  }

  applyDragBehavior(element: any, node: Node, graph: ForceDirectedGraph) {
    const d3element = d3Select(element);

    // Prevent drag events on HTML inputs
    d3element.selectAll('input').on('mousedown', (event: MouseEvent) => event.stopPropagation());

    function onDragStart(dragStartEvent: D3DragEvent<SVGElement, any, SubjectPosition>) {
      // Prevent propagation to parent elements
      dragStartEvent.sourceEvent.stopPropagation();

      D3Service.addDragOverlays();

      // Calculate delta X/Y to prevent "jumping" of elements on drag
      let deltaX = 0;
      let deltaY = 0;
      if (node.x && node.y) {
        deltaX = node.x - dragStartEvent.x;
        deltaY = node.y - dragStartEvent.y;
      }

      // TODO: Check why this is necessary
      if (!dragStartEvent.active) {
        graph.simulation.alphaTarget(0.4).restart();
      }

      dragStartEvent.on('drag', OnDrag).on('end', OnDragEnd);

      function OnDrag(onDragEvent: D3DragEvent<SVGElement, any, SubjectPosition>) {
        node.fx = onDragEvent.x + deltaX;
        node.fy = onDragEvent.y + deltaY;
      }

      function OnDragEnd() {
        // TODO: Check why this is necessary
        if (!dragStartEvent.active) {
          graph.simulation.alphaTarget(0);
        }
        node.fx = null;
        node.fy = null;

        D3Service.removeDragOverlays();
      }
    }

    d3element.call(d3Drag().on('start', onDragStart));
  }
}
