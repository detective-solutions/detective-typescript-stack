import { Component, DoCheck, ViewEncapsulation } from '@angular/core';

import { BaseNodeComponent } from '../base/base-node.component';
import { WHITEBOARD_NODE_SIBLING_ELEMENT_ID_PREFIX } from '../../../utils';
import { WhiteboardNodeActions } from '../../../state';

@Component({
  selector: '[embeddingNode]',
  templateUrl: './embedding-node.component.html',
  styleUrls: ['./embedding-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmbeddingNodeComponent extends BaseNodeComponent implements DoCheck {
  private static DRAG_OVERLAY_SIBLING_ELEMENT_ID_PREFIX = 'embedding-drag-overlay-';
  private static DEFAULT_NODE_WIDTH = 900;
  private static DEFAULT_NODE_HEIGHT = 50;
  private static DEFAULT_NODE_HEIGHT_WITH_SRC = 500;
  private static SVG_ELEMENT_NAMESPACE = 'http://www.w3.org/2000/svg';
  private static SVG_FOREIGN_OBJECT_ELEMENT_NAME = 'foreignObject';

  hasSrc = false;
  currentNodeTitle = '';

  readonly selectionBarMinHeight = 110;

  private siblingEmbeddingElement!: SVGForeignObjectElement | null;
  private siblingDragOverlayElement!: SVGForeignObjectElement | null;
  private iFrameElement!: HTMLIFrameElement;

  protected override customAfterViewInit() {
    // Title property is used as src value for iFrames controlled by embedding nodes
    if (this.node.title) {
      this.currentNodeTitle = this.node.title;
      this.hasSrc = true;
    } else {
      // Reset node incl. height and removing sibling embedding element if title is missing
      this.customDelete();
      this.node.height = EmbeddingNodeComponent.DEFAULT_NODE_HEIGHT;
      this.hasSrc = false;
    }
    this.initIFrameIfNecessary();
    this.subscriptions.add(
      this.nodeTitleUpdate$.subscribe((updatedNodeTitle: string) => (this.currentNodeTitle = updatedNodeTitle))
    );
    this.subscriptions.add(
      this.nodeTitleBlur$.subscribe((updatedNodeTitle: string) => this.renderEmbedding(updatedNodeTitle))
    );
    this.subscriptions.add(
      this.isDragging$.subscribe((isDragging: boolean) => this.displayInvisibleSiblingDragOverLay(isDragging))
    );
  }

  ngDoCheck() {
    if (this.siblingEmbeddingElement) {
      this.siblingEmbeddingElement.setAttribute(
        'transform',
        `translate(${this.node.x},${this.node.y + this.nodeHeaderHeight})`
      );
      this.siblingEmbeddingElement.setAttribute('width', String(this.node.width));
      this.siblingEmbeddingElement.setAttribute('height', String(this.node.height - this.nodeHeaderHeight));
    }
    if (this.siblingDragOverlayElement) {
      this.siblingDragOverlayElement.setAttribute(
        'transform',
        `translate(${this.node.x},${this.node.y + this.nodeHeaderHeight})`
      );
    }
  }

  displayInvisibleSiblingDragOverLay(isDragging: boolean) {
    if (!this.hasSrc) {
      return;
    }

    const zoomContainer = document.getElementById('zoom-container');
    if (!zoomContainer) {
      throw new Error('Could not query zoom container for creating embedding drag overlay');
    }

    if (!this.siblingDragOverlayElement) {
      this.siblingDragOverlayElement = zoomContainer.querySelector(
        `#${EmbeddingNodeComponent.DRAG_OVERLAY_SIBLING_ELEMENT_ID_PREFIX}${this.node.id}`
      );
    }

    if (isDragging) {
      if (!this.siblingDragOverlayElement) {
        this.siblingDragOverlayElement = this.createSiblingDragOverLayElement();
        zoomContainer.appendChild(this.siblingDragOverlayElement);
      }
    } else {
      if (this.siblingDragOverlayElement) {
        this.siblingDragOverlayElement.remove();
      }
    }
  }

  renderEmbedding(src?: string) {
    if (!src && !this.node?.title) {
      // Reset node to initial state
      this.node.width = EmbeddingNodeComponent.DEFAULT_NODE_WIDTH;
      this.node.height = EmbeddingNodeComponent.DEFAULT_NODE_HEIGHT;
    } else if (this.node.height === EmbeddingNodeComponent.DEFAULT_NODE_HEIGHT) {
      // Init node with default height
      this.node.height = EmbeddingNodeComponent.DEFAULT_NODE_HEIGHT_WITH_SRC;
    }
    // Dispatching this action will cause the node to re-render, which will invoke initIFrame() automatically
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({
        updates: [
          {
            id: this.node.id,
            changes: { title: src ?? this.currentNodeTitle, width: this.node.width, height: this.node.height },
          },
        ],
      })
    );
  }

  initIFrameIfNecessary() {
    // It is necessary to create a sibling element that is not part of whiteboard simulation to prevent reloading of
    // the iFrame on every change. The sibling element has to react on any changes to the actual embedding node.
    const embeddingsWrapper = document.getElementById('embedding-sibling-wrapper');
    if (!embeddingsWrapper) {
      throw new Error('Could not query embeddings wrapper for creating embedding node sibling element');
    }
    this.siblingEmbeddingElement = embeddingsWrapper.querySelector(
      `#${WHITEBOARD_NODE_SIBLING_ELEMENT_ID_PREFIX}${this.node.id}`
    );
    const shouldReloadIFrame = this.iFrameHasDifferentSrc(this.siblingEmbeddingElement, this.currentNodeTitle);
    if (!this.siblingEmbeddingElement || shouldReloadIFrame) {
      this.customDelete(); // Delete existing sibling embeddings if existing
      // At the moment we need to use these native imperative functions in order
      // to manipulate the DOM outside of the component's template
      this.siblingEmbeddingElement = this.createSiblingEmbeddingElement();
      this.iFrameElement = this.createIFrameElement();
      this.siblingEmbeddingElement.appendChild(this.iFrameElement);
      embeddingsWrapper.appendChild(this.siblingEmbeddingElement);
    }
  }

  protected override customDelete() {
    if (this.siblingEmbeddingElement) {
      this.siblingEmbeddingElement.remove();
    }
  }

  private createSiblingEmbeddingElement(): SVGForeignObjectElement {
    const siblingEmbeddingElement = document.createElementNS(
      EmbeddingNodeComponent.SVG_ELEMENT_NAMESPACE,
      EmbeddingNodeComponent.SVG_FOREIGN_OBJECT_ELEMENT_NAME
    ) as SVGForeignObjectElement;
    siblingEmbeddingElement.setAttribute('width', String(this.node.width));
    siblingEmbeddingElement.setAttribute('height', String(this.node.height - this.nodeHeaderHeight));
    siblingEmbeddingElement.setAttribute(
      'transform',
      `translate(${this.node.x},${this.node.y + this.nodeHeaderHeight})`
    );
    siblingEmbeddingElement.id = WHITEBOARD_NODE_SIBLING_ELEMENT_ID_PREFIX + this.node.id;
    return siblingEmbeddingElement;
  }

  private createIFrameElement(): HTMLIFrameElement {
    const src = this.node.title ?? '';
    const iFrameElement = document.createElement('iframe');
    iFrameElement.setAttribute('frameBorder', '0');
    iFrameElement.width = '100%';
    iFrameElement.height = '100%';
    iFrameElement.src = this.checkSrcForProtocol(src);
    return iFrameElement;
  }

  private createSiblingDragOverLayElement(): SVGForeignObjectElement {
    const siblingDragOverlayElement = document.createElementNS(
      EmbeddingNodeComponent.SVG_ELEMENT_NAMESPACE,
      EmbeddingNodeComponent.SVG_FOREIGN_OBJECT_ELEMENT_NAME
    ) as SVGForeignObjectElement;
    siblingDragOverlayElement.setAttribute(
      'id',
      `${EmbeddingNodeComponent.DRAG_OVERLAY_SIBLING_ELEMENT_ID_PREFIX}${this.node.id}`
    );
    siblingDragOverlayElement.setAttribute('width', String(this.node.width));
    siblingDragOverlayElement.setAttribute('height', String(this.node.height - this.nodeHeaderHeight));
    siblingDragOverlayElement.setAttribute(
      'transform',
      `translate(${this.node.x},${this.node.y + this.nodeHeaderHeight})`
    );
    siblingDragOverlayElement.setAttribute('fill', 'transparent');
    return siblingDragOverlayElement;
  }

  private checkSrcForProtocol(src: string): string {
    return src.startsWith('http') ? src : `http://${src}`;
  }

  private iFrameHasDifferentSrc(embeddingElement: SVGForeignObjectElement | null, srcToCompare: string) {
    if (!embeddingElement) {
      return true;
    }
    const iFrameElement = embeddingElement.querySelector('iframe');
    return iFrameElement
      ? this.removeSlashFromSrc(iFrameElement.src) !== this.checkSrcForProtocol(this.removeSlashFromSrc(srcToCompare))
      : true;
  }

  private removeSlashFromSrc(src: string): string {
    return src.endsWith('/') ? src.slice(0, -1) : src;
  }
}
