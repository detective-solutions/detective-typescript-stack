import { D3DragEvent, SubjectPosition, drag as d3Drag } from 'd3-drag';
import { D3ZoomEvent, zoom as d3Zoom } from 'd3-zoom';
import { ForceDirectedGraph, Link, Node } from '../model';

import { Injectable } from '@angular/core';
import { select as d3Select } from 'd3-selection';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class D3Service {
  getForceDirectedGraph(nodes: Node[], links: Link[], options: { width: number; height: number }) {
    return new ForceDirectedGraph(nodes, links, options);
  }

  applyZoomBehavior(svgElementToZoomOn: HTMLElement, containerElement: any) {
    const onZoom = (event: D3ZoomEvent<SVGElement, any>) => {
      const transform = event.transform;
      d3Select(containerElement).attr(
        'transform',
        'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')'
      );
    };
    const zoomAndPanningBehavior = d3Zoom().on('zoom', onZoom) as any;
    d3Select(svgElementToZoomOn).call(zoomAndPanningBehavior);
  }

  applyDragBehavior(element: any, node: Node, graph: ForceDirectedGraph) {
    const d3element = d3Select(element);

    function onDragStart(event: D3DragEvent<SVGElement, any, SubjectPosition>) {
      // Prevent propagation to parent elements
      event.sourceEvent.stopPropagation();

      if (!event.active) {
        graph.simulation.alphaTarget(0.3).restart();
      }

      event.on('drag', OnDrag).on('end', OnDragEnd);

      function OnDrag(event: D3DragEvent<SVGElement, any, SubjectPosition>) {
        node.fx = event.x;
        node.fy = event.y;
      }

      function OnDragEnd() {
        if (!event.active) {
          graph.simulation.alphaTarget(0);
        }

        node.fx = null;
        node.fy = null;
      }
    }

    d3element.call(d3Drag().on('start', onDragStart));
  }
}
