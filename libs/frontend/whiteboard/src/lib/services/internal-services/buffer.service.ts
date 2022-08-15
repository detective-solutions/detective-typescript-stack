import { AnyWhiteboardNode } from '../../models';
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

  updateNodesFromBuffer() {
    const updates: Update<AnyWhiteboardNode>[] = [];
    this.nodeUpdateBuffer.forEach((node: AnyWhiteboardNode) => {
      const { id, ...updatedProperties } = node;
      updates.push({
        id: id,
        changes: updatedProperties,
      });
    });
    this.store.dispatch(WhiteboardNodeActions.WhiteboardNodeBatchUpdate({ updates: updates }));
    this.nodeUpdateBuffer.clear();
  }
}
