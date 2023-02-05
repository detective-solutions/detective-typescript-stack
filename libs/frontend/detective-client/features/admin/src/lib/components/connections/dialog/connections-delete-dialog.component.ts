import { Component, Inject } from '@angular/core';
import { EMPTY, Observable, Subject, catchError, take } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { ConnectionsService } from '../../../services';
import { IConnectionsDeleteResponse } from '../../../models';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { QueryRef } from 'apollo-angular';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';

@Component({
  selector: 'connections-delete-dialog',
  styleUrls: ['connections-delete-dialog.component.scss'],
  templateUrl: 'connections-delete-dialog.component.html',
})
export class ConnectionsDeleteDialogComponent {
  isLoading$ = new Subject<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dialogInputData: { connection: SourceConnectionDTO; searchQuery: QueryRef<Response> },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly connectionsService: ConnectionsService,
    private readonly dialogRef: MatDialogRef<ConnectionsDeleteDialogComponent>,
    private readonly logger: LogService,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService
  ) {}

  deleteConnection() {
    this.isLoading$.next(true);
    this.connectionsService
      .deleteConnection(this.dialogInputData.connection)
      .pipe(
        take(1),
        catchError((error: Error) => this.handleError(error))
      )
      .subscribe((response: IConnectionsDeleteResponse) => this.handleResponse(response));
  }

  private handleResponse(response: IConnectionsDeleteResponse) {
    // TODO: Unify response in catalog service (differs from add/edit response)
    if (response.description === 'success') {
      this.translationService
        .selectTranslate('connections.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogInputData.searchQuery.refetch();
        });
    }

    // TODO: Handle error code in response and fetch error message to display
    if (Object.keys(response).includes('error')) {
      this.logger.error('Connection could not be deleted');
      this.translationService
        .selectTranslate('connections.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
    this.dialogRef.close();
    this.isLoading$.next(false);
  }

  private handleError(error: Error): Observable<never> {
    this.logger.error('Encountered an error while submitting connection deletion request');
    console.error(error);
    this.translationService
      .selectTranslate('connections.toastMessages.formSubmitError', {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        this.isLoading$.next(false);
        this.toastService.showToast(translation, 'Close', ToastType.ERROR);
      });
    return EMPTY;
  }
}
