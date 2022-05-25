import { Injectable } from '@angular/core';
import { NodeComponent } from '../../models';
import { Subject } from 'rxjs';

@Injectable()
export class WhiteboardSelectionService {
  whiteboardSelection$: Subject<string | null> = new Subject();

  addSelectedElement(selectedElementComponent: NodeComponent) {
    this.whiteboardSelection$.next(selectedElementComponent.node.id);
  }

  resetSelection() {
    this.whiteboardSelection$.next(null);
  }
}
