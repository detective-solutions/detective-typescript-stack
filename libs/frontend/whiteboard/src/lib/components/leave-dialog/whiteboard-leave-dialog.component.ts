import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';
import { WhiteboardLeaveGuard } from '../../guards';

@Component({
  selector: 'whiteboard-leave-dialog',
  templateUrl: './whiteboard-leave-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhiteboardLeaveDialogComponent {
  constructor(
    private readonly dialogRef: MatDialogRef<WhiteboardLeaveDialogComponent>,
    private readonly whiteboardLeaveGuard: WhiteboardLeaveGuard
  ) {}

  confirm() {
    this.whiteboardLeaveGuard.confirmed$.next(true);
    this.whiteboardLeaveGuard.confirmed$.next(null);
    this.dialogRef.close();
  }

  cancel() {
    this.whiteboardLeaveGuard.confirmed$.next(false);
    this.whiteboardLeaveGuard.confirmed$.next(null);
    this.dialogRef.close();
  }
}
