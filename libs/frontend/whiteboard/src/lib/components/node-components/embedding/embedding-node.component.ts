import { Component, DoCheck, ViewEncapsulation } from '@angular/core';

import { BaseNodeComponent } from '../base/base-node.component';
import { IEmbeddingWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Subject } from 'rxjs';
import { WhiteboardNodeActions } from '../../../state';

@Component({
  selector: '[embeddingNode]',
  templateUrl: './embedding-node.component.html',
  styleUrls: ['./embedding-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmbeddingNodeComponent extends BaseNodeComponent implements DoCheck {
  private static SIBLING_ELEMENT_ID_PREFIX = 'embedding-';

  hasHref = false;
  headerTitleInputValue = '';

  readonly selectionBarMinHeight = 250;
  readonly updatedTitle$ = new Subject<string>();

  private siblingEmbeddingElement!: SVGForeignObjectElement | null;
  private iFrameElement!: HTMLIFrameElement;

  protected override customAfterViewInit() {
    // Title property is used as href value for embedding nodes
    if ((this.node as IEmbeddingWhiteboardNode).title) {
      this.hasHref = true;
      this.initIFrame();
    }
    this.subscriptions.add(
      this.updatedTitle$.subscribe((updatedTitle: string) => (this.headerTitleInputValue = updatedTitle))
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
  }

  renderEmbedding(href?: string) {
    this.customDelete(); // Make sure to delete sibling embedding element if already existing
    // Dispatching this action will cause the node to re-render, which will invoke initIFrame() automatically
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodeTitleUpdated({
        update: {
          id: this.node.id,
          changes: { title: href ?? this.headerTitleInputValue },
        },
      })
    );
  }

  initIFrame() {
    // It is necessary to create a sibling element that is not part of whiteboard simulation to prevent reloading of
    // the iFrame on every change. The sibling element has to react on any changes to the actual embedding node.
    const embeddingsWrapper = window.document.getElementById('embeddings-wrapper');
    if (!embeddingsWrapper) {
      throw new Error('Could not query embeddings wrapper for creating embedding node sibling element');
    }
    this.siblingEmbeddingElement = embeddingsWrapper.querySelector(
      `#${EmbeddingNodeComponent.SIBLING_ELEMENT_ID_PREFIX}${this.node.id}`
    );
    if (!this.siblingEmbeddingElement) {
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
    const siblingEmbeddingElement = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    siblingEmbeddingElement.setAttribute('width', String(this.node.width));
    siblingEmbeddingElement.setAttribute('height', String(this.node.height - this.nodeHeaderHeight));
    siblingEmbeddingElement.setAttribute(
      'transform',
      `translate(${this.node.x},${this.node.y + this.nodeHeaderHeight})`
    );
    siblingEmbeddingElement.id = EmbeddingNodeComponent.SIBLING_ELEMENT_ID_PREFIX + this.node.id;
    return siblingEmbeddingElement;
  }

  private createIFrameElement(): HTMLIFrameElement {
    const href = (this.node as IEmbeddingWhiteboardNode).title ?? '';
    const iFrameElement = document.createElement('iframe');
    iFrameElement.setAttribute('frameBorder', '0');
    iFrameElement.width = '100%';
    iFrameElement.height = '100%';
    iFrameElement.src = this.checkHrefForProtocol(href);
    return iFrameElement;
  }

  private checkHrefForProtocol(href: string) {
    return href.startsWith('http') ? href : `http://${href}`;
  }
}
