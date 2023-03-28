import { Observable, Subject, filter } from 'rxjs';

import { CanDeactivate } from '@angular/router';
import { ComponentCanDeactivate } from '../models/can-deactivate.interface';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WhiteboardLeaveDialogComponent } from '../components/leave-dialog/whiteboard-leave-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class WhiteboardLeaveGuard implements CanDeactivate<ComponentCanDeactivate> {
  confirmed$ = new Subject<boolean>();

  constructor(private readonly matDialog: MatDialog) {}

  canDeactivate(component: ComponentCanDeactivate): Observable<boolean> {
    if (component.canDeactivate()) {
      this.matDialog.open(WhiteboardLeaveDialogComponent);
    }
    return this.confirmed$.pipe(filter((v: boolean) => v));
  }
}
