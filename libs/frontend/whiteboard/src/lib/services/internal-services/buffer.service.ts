import { AnyWhiteboardNode } from '../../models';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardNodeActions } from '../../state';

@Injectable()
export class BufferService {
  private readonly nodeLayoutUpdateBuffer: Set<AnyWhiteboardNode> = new Set();

  constructor(private readonly store: Store) {}

  addToNodeLayoutUpdateBuffer(node: AnyWhiteboardNode) {
    this.nodeLayoutUpdateBuffer.add(node);
  }

  updateNodeLayoutsFromBuffer() {
    const updates: Update<AnyWhiteboardNode>[] = [];
    this.nodeLayoutUpdateBuffer.forEach((node: AnyWhiteboardNode) =>
      updates.push({
        id: node.id,
        changes: {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        },
      })
    );
    this.store.dispatch(WhiteboardNodeActions.WhiteboardNodeLayoutUpdate({ updates: updates }));
    this.nodeLayoutUpdateBuffer.clear();
  }
}
