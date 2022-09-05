import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';
import { NodeComponent } from '../../models';
import { ReplaySubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { WhiteboardNodeActions } from '../../state';

@Injectable()
export class WhiteboardSelectionService {
  readonly whiteboardSelection$: ReplaySubject<string | null> = new ReplaySubject();
  private selectedNodes: string[] = [];

  constructor(private readonly store: Store) {}

  addSelectedNode(selectedNodeId: string, currentUserId: string) {
    this.resetSelection(); // Remove this when implementing multi-selection
    this.selectedNodes.push(selectedNodeId);
    this.whiteboardSelection$.next(selectedNodeId);
    this.store.dispatch(
      WhiteboardNodeActions.WhiteboardNodeBlocked({
        update: { id: selectedNodeId, changes: { temporary: { blockedBy: currentUserId } } },
      })
    );
  }

  resetSelection() {
    this.selectedNodes.forEach((deselectedNodeId: string) => {
      this.store.dispatch(
        WhiteboardNodeActions.WhiteboardNodeUnblocked({
          update: { id: deselectedNodeId, changes: { temporary: { blockedBy: null } } },
        })
      );
    });
    this.selectedNodes = [];
    this.whiteboardSelection$.next(null);
  }
}
