import { ReplaySubject, tap } from 'rxjs';

import { AnyWhiteboardNode } from '@detective.solutions/shared/data-access';
import { Injectable } from '@angular/core';
import { NodeComponent } from '../../models';
import { Store } from '@ngrx/store';
import { WhiteboardNodeActions } from '../../state';

@Injectable()
export class WhiteboardSelectionService {
  readonly whiteboardSelectionSubject$: ReplaySubject<string | null> = new ReplaySubject();
  readonly whiteboardSelection$ = this.whiteboardSelectionSubject$.pipe(
    tap((selectedNodeId: string | null) => {
      if (selectedNodeId) {
        this.store.dispatch(WhiteboardNodeActions.WhiteboardNodeBlocked({ nodeId: selectedNodeId }));
      } else {
        this.selectedNodes.forEach((deselectedNode: AnyWhiteboardNode) => {
          this.store.dispatch(WhiteboardNodeActions.WhiteboardNodeUnblocked({ nodeId: deselectedNode.id }));
        });
      }
    })
  );
  private selectedNodes: AnyWhiteboardNode[] = [];

  constructor(private readonly store: Store) {}

  addSelectedNode(selectedNode: NodeComponent) {
    this.selectedNodes.push(selectedNode.node);
    this.whiteboardSelectionSubject$.next(selectedNode.node.id);
  }

  resetSelection() {
    this.selectedNodes = [];
    this.whiteboardSelectionSubject$.next(null);
  }
}
