import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

import { Injectable } from '@angular/core';

export enum ToastType {
  INFO = 'info-toast',
  ERROR = 'error-toast',
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private readonly snackBar: MatSnackBar) {}

  showToast(
    message: string,
    action: string,
    type: ToastType,
    config = new MatSnackBarConfig()
  ): MatSnackBarRef<TextOnlySnackBar> {
    config.panelClass = type;
    return this.snackBar.open(message, action, config);
  }
}
