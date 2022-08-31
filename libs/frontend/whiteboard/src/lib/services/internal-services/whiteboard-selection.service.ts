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

  addSelectedNode(selectedNode: NodeComponent) {
    this.store.dispatch(WhiteboardNodeActions.WhiteboardNodeBlocked({ nodeId: selectedNode.node.id }));
    this.selectedNodes.push(selectedNode.node);
    this.whiteboardSelection$.next(selectedNode.node.id);
  }

  resetSelection() {
    this.selectedNodes.forEach((deselectedNode: AnyWhiteboardNode) => {
      this.store.dispatch(WhiteboardNodeActions.WhiteboardNodeUnblocked({ nodeId: deselectedNode.id }));
    });
    this.selectedNodes = [];
    this.whiteboardSelection$.next(null);
  }
}
