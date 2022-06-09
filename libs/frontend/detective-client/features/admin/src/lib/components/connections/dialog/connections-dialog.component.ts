import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'connections-dialog',
  templateUrl: 'connections-dialog.component.html',
})
export class ConnectionsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: object) {}
}
