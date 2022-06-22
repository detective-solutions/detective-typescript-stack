import {
  BaseFormField,
  CheckboxFormField,
  DynamicFormControlService,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import { map, pluck, switchMap, take, tap } from 'rxjs';
import { ConnectionsService } from '../../../services';
import { FormBuilder } from '@angular/forms';
import { IConnectorPropertiesResponse } from '../../../models';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';

@Component({
  selector: 'connections-add-edit-dialog',
  styleUrls: ['connections-add-edit-dialog.component.scss'],
  templateUrl: 'connections-add-edit-dialog.component.html',
})
export class ConnectionsAddEditDialogComponent {
  private static readonly connectorTypeFormFieldName = 'connectorType';

  isEditDialog = !!this.dialogInputData?.id;
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
      map(this.getFormFieldByType)
    );

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
  ) {}

  submitForm() {
    const form = this.dynamicFormControlService.currentFormGroup;
    if (form.valid) {
      this.connectionsService
        .addConnection(this.connectorTypeFormGroup.value.connectorType, form.value)
        .pipe(
          tap(() => (this.isSubmitting = true)),
          take(1)
        )
        .subscribe((response: object) => {
          this.isSubmitting = false;
          this.handleResponse(response);
          this.dialogRef.close();
        });
    } else {
      form.markAllAsTouched();
      this.logger.info('Could not submit. Form is invalid,');
    }
  }

  private getFormFieldByType(formFieldData: IConnectorPropertiesResponse[]): BaseFormField<string>[] {
    const formFields: BaseFormField<string>[] = [];

    formFieldData.forEach((data: IConnectorPropertiesResponse) => {
      switch (data.type) {
        case 'boolean': {
          formFields.push(
            new CheckboxFormField({
              type: 'checkbox',
              key: data.propertyName,
              label: data.displayName,
              value: data.default,
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
              value: data.default,
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
              value: data.default,
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

  private handleResponse(response: object) {
    if (Object.keys(response).includes('success')) {
      this.translationService
        .selectTranslate('connections.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) =>
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 })
        );
    } else {
      this.translationService
        .selectTranslate('connections.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }
}
