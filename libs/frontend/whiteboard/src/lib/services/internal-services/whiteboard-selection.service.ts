import { Injectable } from '@angular/core';
import { NodeComponent } from '../../models';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class WhiteboardSelectionService {
  whiteboardSelection$: ReplaySubject<string | null> = new ReplaySubject();

  addSelectedNode(selectedNode: NodeComponent) {
    this.whiteboardSelection$.next(selectedNode.node.id);
  }

  resetSelection() {
    this.whiteboardSelection$.next(null);
  }
}
