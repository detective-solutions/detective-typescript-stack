import {
  BaseFormField,
  CheckboxFormField,
  DynamicFormControlService,
  DynamicFormError,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { EMPTY, Subscription, catchError, map, pluck, switchMap, take, tap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { ConnectionsService } from '../../../services';
import { IConnectorPropertiesResponse } from '../../../models';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';

@Component({
  selector: 'connections-add-edit-dialog',
  styleUrls: ['connections-add-edit-dialog.component.scss'],
  templateUrl: 'connections-add-edit-dialog.component.html',
})
export class ConnectionsAddEditDialogComponent {
  private static readonly connectorTypeFormFieldName = 'connectorType';

  isAddDialog = !this.dialogInputData?.id;
  showSubmitButton = false;
  isSubmitting = false;

  readonly connectorTypeFormGroup = this.formBuilder.group({
    connectorType: ConnectionsAddEditDialogComponent.connectorTypeFormFieldName,
  });

  readonly availableConnectorTypes$ = this.connectionsService.getAvailableConnectorTypes();

  readonly formFieldDefinitionsByConnectorType$ = this.connectorTypeFormGroup
    .get(ConnectionsAddEditDialogComponent.connectorTypeFormFieldName)
    ?.valueChanges.pipe(
      switchMap((selectedConnectorType: string) =>
        this.connectionsService.getConnectorProperties(selectedConnectorType)
      ),
      pluck('properties'),
      map(this.getFormFieldByType),
      tap(() => (this.showSubmitButton = true)),
      catchError((error) => {
        this.handleError(DynamicFormError.FORM_INIT_ERROR, error);
        return EMPTY;
      })
    );

  readonly existingFormFieldData$ = this.connectionsService
    .getExistingConnectorPropertiesById(this.dialogInputData?.id)
    .pipe(
      pluck('properties'),
      map(this.getFormFieldByType),
      tap(() => (this.showSubmitButton = true)),
      catchError((error: Error) => {
        this.handleError(DynamicFormError.FORM_INIT_ERROR, error);
        return EMPTY;
      })
    );

  private readonly subscriptions = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { id: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly connectionsService: ConnectionsService,
    private readonly dialogRef: MatDialogRef<ConnectionsAddEditDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly dynamicFormControlService: DynamicFormControlService,
    private readonly logger: LogService
  ) {
    this.subscriptions.add(
      this.dynamicFormControlService.formSubmit$.subscribe((formGroup: FormGroup) => this.submitForm(formGroup))
    );
  }

  submitForm(formGroup?: FormGroup) {
    formGroup = formGroup ?? this.dynamicFormControlService.currentFormGroup;
    if (formGroup.valid) {
      const formValues = this.removeEmptyStringFormValues(formGroup.value);
      this.isSubmitting = true;
      this.connectionsService
        .addConnection(this.connectorTypeFormGroup.value.connectorType, formGroup.value)
        .pipe(
          take(1),
          catchError((error: Error) => {
            this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
            return EMPTY;
          })
        )
        .subscribe((response: object) => this.handleResponse(response));
    } else {
      formGroup.markAllAsTouched();
      this.logger.info('Could not submit. Form is invalid,');
    }
  }

  private getFormFieldByType(formFieldData: IConnectorPropertiesResponse[]): BaseFormField<string | boolean>[] {
    const formFields: BaseFormField<string | boolean>[] = [];

    formFieldData.forEach((data: IConnectorPropertiesResponse) => {
      switch (data.type) {
        case 'boolean': {
          formFields.push(
            new CheckboxFormField({
              type: 'checkbox',
              key: data.propertyName,
              label: data.displayName,
              value: !!data.default,
              required: data.required,
              hint: data.description,
            })
          );
          break;
        }
        case 'string': {
          formFields.push(
            new TextBoxFormField({
              type: 'text',
              key: data.propertyName,
              label: data.displayName,
              value: String(data.default),
              required: data.required,
              hint: data.description,
            })
          );
          break;
        }
        case 'integer': {
          formFields.push(
            new TextBoxFormField({
              type: 'number',
              key: data.propertyName,
              label: data.displayName,
              value: String(data.default),
              required: data.required,
              hint: data.description,
            })
          );
          break;
        }
        default: {
          throw new Error(`Unknown connector property type ${data?.type}`);
        }
      }
    });
    return formFields;
  }

  private removeEmptyStringFormValues(formValues: { [key: string]: string | number }) {
    for (const key in formValues) {
      if (formValues[key] === '') {
        delete formValues[key];
      }
    }
    return formValues;
  }

  private handleResponse(response: object) {
    this.isSubmitting = false;
    if (Object.keys(response).includes('success')) {
      this.translationService
        .selectTranslate('connections.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
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

  private handleError(errorType: DynamicFormError, error: Error) {
    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'connections.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isSubmitting = false;
      translationKey = 'connections.toastMessages.formSubmitError';
      this.logger.error('Encountered an error while submitting the form data');
    }
    console.error(error);

    if (translationKey) {
      this.translationService
        .selectTranslate(translationKey, {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, 'Close', ToastType.ERROR);
        });
    }
  }
}
