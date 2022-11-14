/* eslint-disable sort-imports */
import { Component, Inject } from '@angular/core';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { StatusResponse, ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import { take } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { ISendInviteInput } from '../../interfaces';

export interface DialogData {
  email: string;
}

@Component({
  selector: 'invite-dialog',
  styleUrls: ['invite-dialog.component.scss'],
  templateUrl: 'invite-dialog.component.html',
})
export class InviteDialogComponent {
  isSubmitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly httpClient: HttpClient,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly dialogRef: MatDialogRef<InviteDialogComponent>,
    private readonly logger: LogService
  ) {}

  closeModal() {
    this.dialogRef.close();
  }

  sendInvite(inviteInput: ISendInviteInput): void {
    const token: string = this.authService.getAccessToken();
    const headers = new HttpHeaders().set('Authentication', token);
    headers.set('Access-Control-Allow-Origin', '*');

    this.httpClient
      .post<StatusResponse>(
        `${environment.devApiHost}${environment.provisioningApiPathV1}${environment.provisioningSendInviteV1}`,
        { email: inviteInput.email, name: 'detective' },
        { headers: headers }
      )
      .pipe(take(1))
      .subscribe((subscriptionState: StatusResponse) => this.handleResponse('update subscription', subscriptionState));
    this.dialogRef.close();
  }

  private handleResponse(actionName: string, response: StatusResponse) {
    let toastMessage = 'actionFailed';
    let toastType = ToastType.ERROR;

    if (response.status) {
      toastMessage = 'actionSuccessful';
      toastType = ToastType.INFO;
      this.logger.info(`${actionName}: ${response.status}`);
    } else {
      this.logger.error(`${actionName}: ${response.status}`);
    }
    this.translationService
      .selectTranslate(`navigation.toastMessages.${toastMessage}`, {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        this.toastService.showToast(translation, 'Close', toastType);
      });
    this.dialogRef.close();
  }
}
