import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
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
      updates.push({
        id: node.id,
        // Round node position to reduce data
        changes: { x: Math.round(node.x), y: Math.round(node.y), type: node.type },
      });
    });
    this.store.dispatch(WhiteboardNodeActions.WhiteboardNodesMoved({ updates: updates }));
    this.nodeUpdateBuffer.clear();
  }
}
