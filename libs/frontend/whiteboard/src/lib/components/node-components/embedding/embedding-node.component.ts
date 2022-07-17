import { Component, ViewEncapsulation } from '@angular/core';

import { BaseNodeComponent } from '../base/base-node.component';

@Component({
  selector: '[embeddingNode]',
  templateUrl: './embedding-node.component.html',
  styleUrls: ['./embedding-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmbeddingNodeComponent extends BaseNodeComponent {}
