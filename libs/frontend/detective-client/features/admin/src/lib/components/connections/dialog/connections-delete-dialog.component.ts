import { Component, Inject } from '@angular/core';
import { EMPTY, catchError, map, switchMap, take } from 'rxjs';
import { IConnectionsDeleteResponse, IGetConnectionByIdResponse } from '../../../models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { ConnectionsService } from '../../../services';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';

@Component({
  selector: 'connections-delete-dialog',
  styleUrls: ['connections-delete-dialog.component.scss'],
  templateUrl: 'connections-delete-dialog.component.html',
})
export class ConnectionsDeleteDialogComponent {
  // TODO: Use custom service db call to gather info about usage of connection
  readonly connectionToBeDeleted$ = this.connectionsService.getConnectionById(this.dialogInputData.id);
  readonly connectionName$ = this.connectionToBeDeleted$.pipe(map((value: IGetConnectionByIdResponse) => value.name));

  isSubmitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { id: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly connectionsService: ConnectionsService,
    private readonly dialogRef: MatDialogRef<ConnectionsDeleteDialogComponent>,
    private readonly logger: LogService
  ) {}

  deleteConnection() {
    this.isSubmitting = true;
    this.connectionName$
      .pipe(
        switchMap((connectionName: string) =>
          this.connectionsService.deleteConnection(this.dialogInputData.id, connectionName)
        ),
        take(1),
        catchError((error: Error) => {
          this.handleError(error);
          return EMPTY;
        })
      )
      .subscribe((response: IConnectionsDeleteResponse) => {
        this.handleResponse(response);
        this.dialogRef.close();
      });
  }

  private handleResponse(response: IConnectionsDeleteResponse) {
    this.isSubmitting = false;
    // TODO: Unify response in catalog service (differs from add/edit response)
    if (response.description === 'success') {
      this.translationService
        .selectTranslate('connections.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) =>
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 })
        );
      this.connectionsService.refreshConnections();
    }

    // TODO: Handle error code in response and fetch error message to display
    if (Object.keys(response).includes('error')) {
      this.logger.error('Connection could not be deleted');
      this.translationService
        .selectTranslate('connections.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(error: Error) {
    this.isSubmitting = false;
    this.logger.error('Encountered an error while submitting connection deletion request');
    console.error(error);
    this.translationService
      .selectTranslate('connections.toastMessages.formSubmitError', {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        this.toastService.showToast(translation, 'Close', ToastType.ERROR);
      });
    this.dialogRef.close();
  }
}
