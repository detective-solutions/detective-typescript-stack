import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
import { BaseNodeComponent } from '../base/base-node.component';
import { filter } from 'rxjs';
import { selectWhiteboardNodeById } from '../../../state';

@Component({
  selector: '[displayNode]',
  templateUrl: './display-node.component.html',
  styleUrls: ['./display-node.component.scss', '../base/base-node.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DisplayNodeComponent extends BaseNodeComponent implements OnInit {
  ngOnInit() {
    // Node update subscription needs to be defined here, otherwise this.id would be undefined
    this.subscriptions.add(
      this.store
        .select(selectWhiteboardNodeById(this.node.id))
        .pipe(filter(Boolean))
        .subscribe((updatedNode: AnyWhiteboardNode) => {
          // WARNING: It is not possible to simply reassign this.node reference when updating the node values
          // Currently the rendering will break due to some conflicts between HTML and SVG handling
          this.updateExistingNodeObject(updatedNode);
          this.nodeUpdates$.next(updatedNode);
        })
    );
  }
}
