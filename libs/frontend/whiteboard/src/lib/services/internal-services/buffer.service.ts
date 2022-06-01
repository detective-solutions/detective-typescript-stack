import { INodeInput, Node } from '../../models';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardActions } from '../../state/actions';

@Injectable()
export class BufferService {
  private nodeLayoutUpdateBuffer: Set<Node> = new Set();

  constructor(private readonly store: Store) {}

  addToNodeLayoutUpdateBuffer(node: Node) {
    this.nodeLayoutUpdateBuffer.add(node);
  }

  updateNodeLayoutsFromBuffer() {
    const updates: Update<INodeInput>[] = [];
    this.nodeLayoutUpdateBuffer.forEach((node: Node) =>
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
    this.store.dispatch(WhiteboardActions.WhiteboardNodeLayoutUpdate({ updates: updates }));
    this.nodeLayoutUpdateBuffer.clear();
  }
}
