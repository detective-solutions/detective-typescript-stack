import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ProviderScope, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { MatDialogRef } from '@angular/material/dialog';

import { WhiteboardLeaveGuard } from '../../guards';

@Component({
  selector: 'whiteboard-leave-dialog',
  templateUrl: './whiteboard-leave-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhiteboardLeaveDialogComponent {
  constructor(
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
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
