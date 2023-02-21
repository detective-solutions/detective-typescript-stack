import { Component, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { StatusResponse, ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { ISendInviteInput } from '../../interfaces';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { take } from 'rxjs';

@Component({
  selector: 'invite-dialog',
  styleUrls: ['invite-dialog.component.scss'],
  templateUrl: 'invite-dialog.component.html',
})
export class InviteDialogComponent {
  isSubmitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ISendInviteInput,
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

  sendInvite(inviteInput: ISendInviteInput) {
    const headers = new HttpHeaders()
      .set('Authentication', this.authService.getAccessToken())
      .set('Access-Control-Allow-Origin', '*');
    this.httpClient
      .post<StatusResponse>(
        `${environment.devApiHost}${environment.provisioningApiPathV1}${environment.provisioningSendInviteV1}`,
        { email: inviteInput.email, name: 'detective' },
        { headers: headers }
      )
      .pipe(take(1))
      .subscribe((subscriptionState: StatusResponse) => {
        this.handleResponse('update subscription', subscriptionState);
        this.closeModal();
      });
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
    this.closeModal();
  }
}
