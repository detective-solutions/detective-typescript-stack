import {
  BaseFormField,
  CheckboxFormField,
  DynamicFormControlService,
  DynamicFormError,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { EMPTY, Observable, Subject, Subscription, catchError, filter, map, of, switchMap, take, tap } from 'rxjs';
import { IConnectionsAddEditResponse, IConnectorPropertiesResponse, IConnectorSchemaResponse } from '../../../models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { CatalogService } from '../../../services';
import { FormBuilder } from '@angular/forms';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { QueryRef } from 'apollo-angular';
import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';

@Component({
  selector: 'connections-add-edit-dialog',
  styleUrls: ['connections-add-edit-dialog.component.scss'],
  templateUrl: 'connections-add-edit-dialog.component.html',
})
export class ConnectionsAddEditDialogComponent {
  private static readonly connectorTypeFormFieldName = 'connectorType';

  readonly isAddDialog = !this.dialogInputData.connection;
  readonly connectorTypeFormGroup = this.formBuilder.nonNullable.group({
    connectorType: ConnectionsAddEditDialogComponent.connectorTypeFormFieldName,
  });

  readonly isLoading$ = new Subject<boolean>();
  readonly availableConnectorTypes$ = this.catalogService.getAvailableConnectorTypes();
  readonly existingFormFieldData$ = of(this.isAddDialog).pipe(
    filter((isAddDialog: boolean) => !isAddDialog),
    switchMap(() => this.catalogService.getExistingConnectorPropertiesById(this.dialogInputData.connection.id)),
    tap((response: IConnectorSchemaResponse) => (this.currentConnectorType = response.connectorType)),
    map((formFieldData: { properties: IConnectorPropertiesResponse[] }) =>
      this.getFormFieldByType(formFieldData.properties)
    ),
    catchError((error: Error) => this.handleError(DynamicFormError.FORM_INIT_ERROR, error))
  );
  readonly formFieldDefinitionsByConnectorType$ = this.connectorTypeFormGroup
    .get(ConnectionsAddEditDialogComponent.connectorTypeFormFieldName)
    ?.valueChanges.pipe(
      tap((selectedConnectorType: string) => (this.currentConnectorType = selectedConnectorType)),
      switchMap((selectedConnectorType: string) => this.catalogService.getConnectorProperties(selectedConnectorType)),
      map((formFieldData: { properties: IConnectorPropertiesResponse[] }) =>
        this.getFormFieldByType(formFieldData.properties)
      ),
      catchError((error) => this.handleError(DynamicFormError.FORM_INIT_ERROR, error))
    );

  private currentConnectorType!: string;
  private readonly subscriptions = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public dialogInputData: { connection: SourceConnectionDTO; searchQuery: QueryRef<Response> },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly catalogService: CatalogService,
    private readonly dialogRef: MatDialogRef<ConnectionsAddEditDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly dynamicFormControlService: DynamicFormControlService,
    private readonly logger: LogService
  ) {
    this.subscriptions.add(this.dynamicFormControlService.formSubmit$.subscribe(() => this.submitForm()));
  }

  submitForm() {
    const formGroup = this.dynamicFormControlService.currentFormGroup;
    if (!formGroup.valid) {
      formGroup.markAllAsTouched();
      this.logger.info('Could not submit. Form is invalid,');
      return;
    }
    this.isLoading$.next(true);
    const formValues = this.removeEmptyStringFormValues(formGroup.value);
    if (this.isAddDialog) {
      this.catalogService
        .addConnection(this.currentConnectorType, formValues)
        .pipe(
          take(1),
          catchError((error: Error) => this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error))
        )
        .subscribe((response: IConnectionsAddEditResponse) => this.handleResponse(response));
    } else {
      this.catalogService
        .updateConnection(this.currentConnectorType, this.dialogInputData.connection.id, formValues)
        .pipe(
          take(1),
          catchError((error: Error) => this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error))
        )
        .subscribe((response: IConnectionsAddEditResponse) => this.handleResponse(response));
    }
  }

  private getFormFieldByType(formFieldData: IConnectorPropertiesResponse[]): BaseFormField<string | boolean>[] {
    return formFieldData.map((connectorProperties: IConnectorPropertiesResponse) => {
      switch (connectorProperties.type) {
        case 'boolean': {
          return new CheckboxFormField({
            type: 'checkbox',
            key: connectorProperties.propertyName,
            label: connectorProperties.displayName,
            value: !!connectorProperties.default,
            required: connectorProperties.required,
            hint: connectorProperties.description,
          });
        }
        case 'string': {
          return new TextBoxFormField({
            type: 'text',
            key: connectorProperties.propertyName,
            label: connectorProperties.displayName,
            value: String(connectorProperties.default),
            required: connectorProperties.required,
            hint: connectorProperties.description,
          });
        }
        case 'integer': {
          return new TextBoxFormField({
            type: 'number',
            key: connectorProperties.propertyName,
            label: connectorProperties.displayName,
            value: String(connectorProperties.default),
            required: connectorProperties.required,
            hint: connectorProperties.description,
          });
        }
        default: {
          throw new Error(`Unknown connector property type ${connectorProperties?.type}`);
        }
      }
    });
  }

  private removeEmptyStringFormValues(formValues: { [key: string]: string | number }) {
    for (const key in formValues) {
      if (formValues[key] === '') {
        delete formValues[key];
      }
    }
    return formValues;
  }

  private handleResponse(response: IConnectionsAddEditResponse) {
    this.isLoading$.next(false);
    // TODO: Unify response in catalog service (differs from delete response)
    if (Object.keys(response).includes('success')) {
      this.translationService
        .selectTranslate('connections.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.dialogInputData.searchQuery.refetch();
    }

    // TODO: Handle error code in response and fetch error message to display
    if (Object.keys(response).includes('error')) {
      this.logger.error('Connection could not be added/edited');
      this.translationService
        .selectTranslate('connections.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error): Observable<never> {
    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'connections.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isLoading$.next(false);
      translationKey = 'connections.toastMessages.formSubmitError';
      this.logger.error('Encountered an error while submitting the form data');
    }
    console.error(error);
    if (translationKey) {
      this.translationService
        .selectTranslate(translationKey, {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
    return EMPTY;
  }
}
