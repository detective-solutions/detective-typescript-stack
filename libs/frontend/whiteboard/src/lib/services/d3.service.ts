import { D3DragEvent, SubjectPosition, drag as d3Drag } from 'd3-drag';
import { D3ZoomEvent, zoom as d3Zoom } from 'd3-zoom';
import { ForceDirectedGraph, Link, Node } from '../model';

import { Injectable } from '@angular/core';
import { WindowGlobals } from '@detective.solutions/frontend/shared/ui';
import { select as d3Select } from 'd3-selection';

declare let window: WindowGlobals;

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class D3Service {
  getForceDirectedGraph(nodes: Node[], links: Link[], options: { width: number; height: number }) {
    return new ForceDirectedGraph(nodes, links, options);
  }

  applyZoomBehavior(elementToZoomOn: Element, containerElement: Element) {
    const onZoom = (event: D3ZoomEvent<HTMLElement, any>) =>
      d3Select(containerElement).attr('transform', event.transform.toString());

    const zoomBehavior = d3Zoom().on('zoom', onZoom) as any;
    zoomBehavior.filter(this.filterZoomBehavior);

    // Handle cursor display while panning and not dragging an element
    zoomBehavior.on('start', (event: D3ZoomEvent<any, any>) => {
      if (event.sourceEvent.type !== 'wheel') {
        window.isPanningActivated = true;
        setTimeout(() => {
          if (window.isPanningActivated) {
            document.body.style.cursor = 'grabbing';
          }
        }, 100);
      }
    });
    zoomBehavior.on('end', () => {
      window.isPanningActivated = false;
      document.body.style.cursor = 'default';
    });

    const d3Element = d3Select(elementToZoomOn);
    d3Element.call(zoomBehavior);
  }

  filterZoomBehavior(event: any) {
    let pass = true;

    // Prevent d3-zoom dblclick default event handling
    if (event.type === 'dblclick') {
      pass = false;
    }
    return pass;
  }

  addZoomPreventionEventHandler(elementToBeHandled: HTMLElement) {
    d3Select(elementToBeHandled)
      .selectAll('.prevent-zoom')
      .on('wheel', (event: WheelEvent) => {
        console.log('Spacebar pressed', window.isSpacebarPressed);
        if (!window.isSpacebarPressed) {
          event.stopPropagation();
        }
      });
  }

  applyDragBehavior(elementToDrag: Element, nodeToUpdate: Node, graph: ForceDirectedGraph) {
    const d3element = d3Select(elementToDrag);

    function onDragStart(dragStartEvent: D3DragEvent<SVGElement, any, SubjectPosition>) {
      // Prevent propagation to parent elements
      dragStartEvent.sourceEvent.stopPropagation();

      // Calculate delta X/Y to prevent "jumping" of elements on drag
      let deltaX = 0;
      let deltaY = 0;
      if (nodeToUpdate.x && nodeToUpdate.y) {
        deltaX = nodeToUpdate.x - dragStartEvent.x;
        deltaY = nodeToUpdate.y - dragStartEvent.y;
      }

      // TODO: Check why this is necessary
      if (!dragStartEvent.active) {
        graph.simulation.alphaTarget(0.4).restart();
      }

      dragStartEvent.on('drag', OnDrag).on('end', OnDragEnd);

      function OnDrag(onDragEvent: D3DragEvent<SVGElement, any, SubjectPosition>) {
        // Abort drag if dragging is not activated
        if (window.isDraggingActivated) {
          nodeToUpdate.fx = onDragEvent.x + deltaX;
          nodeToUpdate.fy = onDragEvent.y + deltaY;
        }
      }

      function OnDragEnd() {
        // TODO: Check why this is necessary
        if (!dragStartEvent.active) {
          graph.simulation.alphaTarget(0);
        }
        nodeToUpdate.fx = null;
        nodeToUpdate.fy = null;
      }
    }

    d3element.on('pointerdown', () => {
      d3element.call(d3Drag().on('start', onDragStart));
    });
  }
}
