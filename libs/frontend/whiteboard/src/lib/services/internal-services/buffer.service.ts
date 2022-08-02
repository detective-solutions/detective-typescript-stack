import { AbstractNodeInput, INode } from '../../models';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardNodeActions } from '../../state';

@Injectable()
export class BufferService {
  private readonly nodeLayoutUpdateBuffer: Set<INode> = new Set();

  constructor(private readonly store: Store) {}

  addToNodeLayoutUpdateBuffer(node: INode) {
    this.nodeLayoutUpdateBuffer.add(node);
  }

  updateNodeLayoutsFromBuffer() {
    const updates: Update<AbstractNodeInput>[] = [];
    this.nodeLayoutUpdateBuffer.forEach((node: INode) =>
      updates.push({
        id: node.id,
        changes: {
          layout: {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
          },
        },
      })
    );
    this.store.dispatch(WhiteboardNodeActions.WhiteboardNodeLayoutUpdate({ updates: updates }));
    this.nodeLayoutUpdateBuffer.clear();
  }
}
