import { Component, Inject } from '@angular/core';
import { DeleteMaskingGQL, IDeleteMaskingGQLResponse } from '../../../graphql';
import { EMPTY, Observable, Subject, catchError, filter, map, take, tap } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { DynamicFormError } from '@detective.solutions/frontend/shared/dynamic-form';
import { IMask } from '@detective.solutions/shared/data-access';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';
import { QueryRef } from 'apollo-angular';

@Component({
  selector: 'maskings-delete-dialog',
  styleUrls: ['maskings-delete-dialog.component.scss'],
  templateUrl: 'maskings-delete-dialog.component.html',
})
export class MaskingDeleteDialogComponent {
  readonly isLoading$ = new Subject<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { masking: MaskingDTO; searchQuery: QueryRef<Response> },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly deleteMaskingGQL: DeleteMaskingGQL,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly dialogRef: MatDialogRef<MaskingDeleteDialogComponent>,
    private readonly logger: LogService
  ) {}

  deleteMasking() {
    this.isLoading$.next(true);
    return this.deleteMaskingGQL
      .mutate({
        filter: {
          xid: {
            eq: this.dialogInputData.masking.id,
          },
        },
        remove: {
          columns: this.dialogInputData.masking.columns?.map((mask: IMask) => mask.id) ?? [],
          rows: this.dialogInputData.masking.rows?.map((mask: IMask) => mask.id) ?? [],
        },
      })
      .pipe(
        tap(({ loading }) => this.isLoading$.next(loading)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter((response: any) => response?.data),
        map(({ data }: { data: IDeleteMaskingGQLResponse }) => data),
        take(1),
        catchError((error: Error) => this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error))
      )
      .subscribe((response: IDeleteMaskingGQLResponse) => this.handleResponse(response));
  }

  private handleResponse(response: IDeleteMaskingGQLResponse) {
    this.isLoading$.next(false);
    if (!Object.keys(response).includes('error')) {
      this.translationService
        .selectTranslate('maskings.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogInputData.searchQuery.refetch(); // Update parent view
          this.dialogRef.close();
        });
    } else {
      this.logger.error('Masking could not be edited');
      this.translationService
        .selectTranslate('maskings.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error): Observable<never> {
    let translationKey;
    this.logger.error(String(error));
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'maskings.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isLoading$.next(false);
      translationKey = 'maskings.toastMessages.formSubmitError';
      this.logger.error('Encountered an error while submitting the form data');
    }

    if (translationKey) {
      this.translationService
        .selectTranslate(translationKey, {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
    return EMPTY;
  }
}
