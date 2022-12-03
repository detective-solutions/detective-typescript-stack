import { AnyWhiteboardNode, IWhiteboardNodePropertiesUpdate } from '@detective.solutions/shared/data-access';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { WhiteboardNodeActions } from '../../state';

@Injectable()
export class BufferService {
  private readonly nodePositionUpdateBuffer: Set<AnyWhiteboardNode> = new Set();
  private readonly nodeResizeUpdateBuffer: Set<AnyWhiteboardNode> = new Set();

  constructor(private readonly store: Store) {}

  addToNodePositionBuffer(node: AnyWhiteboardNode) {
    this.nodePositionUpdateBuffer.add(node);
  }

  updateNodePositionsFromBuffer() {
    const updates: Update<IWhiteboardNodePropertiesUpdate>[] = [];
    this.nodePositionUpdateBuffer.forEach((node: AnyWhiteboardNode) => {
      updates.push({
        id: node.id,
        changes: { x: Math.round(node.x), y: Math.round(node.y) }, // Round node position to reduce data
      });
    });
    this.store.dispatch(WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({ updates }));
    this.nodePositionUpdateBuffer.clear();
  }

  addToNodeResizeUpdateBuffer(node: AnyWhiteboardNode) {
    this.nodeResizeUpdateBuffer.add(node);
  }

  updateNodeSizeFromBuffer() {
    this.nodeResizeUpdateBuffer.forEach((node: AnyWhiteboardNode) => {
      this.store.dispatch(
        WhiteboardNodeActions.WhiteboardNodePropertiesUpdated({
          // Round node dimensions to reduce data
          updates: [{ id: node.id, changes: { width: Math.round(node.width), height: Math.round(node.height) } }],
        })
      );
    });
    this.nodeResizeUpdateBuffer.clear();
  }
}
