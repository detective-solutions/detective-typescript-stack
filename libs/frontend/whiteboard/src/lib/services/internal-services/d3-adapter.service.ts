import { D3DragEvent, SubjectPosition, drag as d3Drag } from 'd3-drag';
import { D3ZoomEvent, zoom as d3Zoom } from 'd3-zoom';
import { ForceDirectedGraph, INode, WhiteboardOptions } from '../../models';

import { BufferService } from './buffer.service';
import { DragService } from './drag.service';
import { Injectable } from '@angular/core';
import { WindowGlobals } from '@detective.solutions/frontend/shared/ui';
import { select as d3Select } from 'd3-selection';

declare let window: WindowGlobals;

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class D3AdapterService {
  constructor(private readonly dragService: DragService, private readonly bufferService: BufferService) {}

  getForceDirectedGraph(options: WhiteboardOptions) {
    return new ForceDirectedGraph(options);
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

  applyDragBehavior(elementToDrag: Element, nodeToUpdate: INode) {
    const d3element = d3Select(elementToDrag);
    const dragServiceRef = this.dragService;
    const bufferServiceRef = this.bufferService;

    function onDragStart(dragStartEvent: D3DragEvent<SVGElement, any, SubjectPosition>) {
      // Continue dragging only on allowed target elements
      if (!dragServiceRef.isDraggingAllowedOnTarget(dragStartEvent.sourceEvent.target as HTMLElement)) {
        return;
      }

      // Prevent propagation to parent elements
      dragStartEvent.sourceEvent.stopPropagation();

      // Calculate delta X/Y to prevent "jumping" of elements on drag
      let deltaX = 0;
      let deltaY = 0;
      if (nodeToUpdate.x && nodeToUpdate.y) {
        deltaX = nodeToUpdate.x - dragStartEvent.x;
        deltaY = nodeToUpdate.y - dragStartEvent.y;
      }

      bufferServiceRef.addToNodeLayoutUpdateBuffer(nodeToUpdate);
      dragStartEvent.on('drag', OnDrag).on('end', OnDragEnd);

      function OnDrag(dragEvent: D3DragEvent<SVGElement, any, SubjectPosition>) {
        // Abort drag if dragging is not activated
        if (window.isDraggingActivated) {
          nodeToUpdate.fx = dragEvent.x + deltaX;
          nodeToUpdate.fy = dragEvent.y + deltaY;
        }
      }

      function OnDragEnd(dragEndEvent: D3DragEvent<SVGElement, any, SubjectPosition>) {
        const hasBeenDragged = dragStartEvent.x !== dragEndEvent.x || dragStartEvent.y !== dragEndEvent.y;
        if (hasBeenDragged) {
          nodeToUpdate.fx = null;
          nodeToUpdate.fy = null;
          nodeToUpdate.x = dragEndEvent.x + deltaX;
          nodeToUpdate.y = dragEndEvent.y + deltaY;

          bufferServiceRef.updateNodeLayoutsFromBuffer();
        }
      }
    }

    d3element.on('pointerdown', () => {
      d3element.call(d3Drag().on('start', onDragStart));
    });
  }
}
