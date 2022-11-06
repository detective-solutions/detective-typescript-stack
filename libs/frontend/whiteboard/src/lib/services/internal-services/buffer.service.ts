import { AnyWhiteboardNode, IWhiteboardNodeSizeUpdate } from '@detective.solutions/shared/data-access';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardNodeActions } from '../../state';

@Injectable()
export class BufferService {
  private readonly nodeUpdateBuffer: Set<AnyWhiteboardNode> = new Set();

  constructor(private readonly store: Store) {}

  addToNodeUpdateBuffer(node: AnyWhiteboardNode) {
    this.nodeUpdateBuffer.add(node);
  }

  updateNodesPositionFromBuffer() {
    const updates: Update<AnyWhiteboardNode>[] = [];
    this.nodeUpdateBuffer.forEach((node: AnyWhiteboardNode) => {
      updates.push({
        id: node.id,
        // Round node position to reduce data
        changes: { x: Math.round(node.x), y: Math.round(node.y) },
      });
    });
    this.store.dispatch(WhiteboardNodeActions.WhiteboardNodesPositionUpdated({ updates: updates }));
    this.nodeUpdateBuffer.clear();
  }

  updateNodeSizeFromBuffer() {
    if (this.nodeUpdateBuffer.size === 1) {
      this.nodeUpdateBuffer.forEach((node: AnyWhiteboardNode) => {
        // Round node dimensions to reduce data
        this.store.dispatch(
          WhiteboardNodeActions.WhiteboardNodeResized({
            update: { id: node.id, changes: { width: Math.round(node.width), height: Math.round(node.height) } },
          })
        );
      });
      this.nodeUpdateBuffer.clear();
    } else {
      console.warn('Could not update node size from buffer, because buffer holds wrong data:', this.nodeUpdateBuffer);
    }
  }
}
