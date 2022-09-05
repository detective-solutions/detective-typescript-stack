import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';
import { NodeComponent } from '../../models';
import { ReplaySubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { WhiteboardNodeActions } from '../../state';

@Injectable()
export class WhiteboardSelectionService {
  readonly whiteboardSelection$: ReplaySubject<string | null> = new ReplaySubject();
  private selectedNodes: AnyWhiteboardNode[] = [];

  constructor(private readonly store: Store) {}

  addSelectedNode(selectedNode: NodeComponent, currentUserId: string) {
    this.resetSelection(); // Remove this when implementing multi-selection
    this.selectedNodes.push(selectedNode.node);
    this.whiteboardSelection$.next(selectedNode.node.id);
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodeBlocked({
        update: { id: selectedNode.node.id, changes: { temporary: { blockedBy: currentUserId } } },
      })
    );
  }

  resetSelection() {
    this.selectedNodes.forEach((deselectedNode: AnyWhiteboardNode) => {
      this.store.dispatch(
        WhiteboardNodeActions.WhiteboardNodeUnblocked({
          update: { id: deselectedNode.id, changes: { temporary: { blockedBy: null } } },
        })
      );
    });
    this.selectedNodes = [];
    this.whiteboardSelection$.next(null);
  }
}
