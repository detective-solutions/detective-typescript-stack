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
    this.dialogRef.close();
  }

  cancel() {
    this.whiteboardLeaveGuard.confirmed$.next(false);
    this.dialogRef.close();
  }
}
