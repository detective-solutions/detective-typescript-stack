import { Injectable } from '@angular/core';
import { KeyboardService } from '@detective.solutions/frontend/shared/ui';
import { ReplaySubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { WhiteboardNodeActions } from '../../state';
import { nodeDragTimeout } from '../../utils';

@Injectable()
export class WhiteboardSelectionService {
  readonly whiteboardSelection$ = new ReplaySubject<string[]>();

  private selectedNodeIds: string[] = [];
  private actionTimeout = nodeDragTimeout + 50;

  constructor(private readonly keyboardService: KeyboardService, private readonly store: Store) {}

  addSelectedNode(selectedNodeId: string, currentUserId: string) {
    if (!this.selectedNodeIds.includes(selectedNodeId)) {
      // Reset selection if multi-selection is not activated
      if (!this.keyboardService.isControlPressed) {
        this.resetSelection();
      }

      this.selectedNodeIds.push(selectedNodeId);
      this.whiteboardSelection$.next(this.selectedNodeIds);

      // IMPORTANT: Timeout is needed to allow delayed dragging of nodes
      // (Otherwise the dispatch will break the delayed dragging mechanism when switching selected nodes)
      setTimeout(
        () =>
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeBlocked({
              update: { id: selectedNodeId, changes: { temporary: { blockedBy: currentUserId } } },
            })
          ),
        this.actionTimeout
      );
    }
  }

  resetSelection() {
    this.selectedNodeIds.forEach((deselectedNodeId: string) => {
      // IMPORTANT: Timeout is needed to allow delayed dragging of nodes
      // (Otherwise the dispatch will break the delayed dragging mechanism when switching selected nodes)
      setTimeout(
        () =>
          this.store.dispatch(
            WhiteboardNodeActions.WhiteboardNodeBlocked({
              update: { id: deselectedNodeId, changes: { temporary: { blockedBy: null } } },
            })
          ),
        this.actionTimeout
      );
    });
    this.selectedNodeIds = [];
    this.whiteboardSelection$.next([]);
  }
}
