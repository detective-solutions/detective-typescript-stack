import {
  BaseFormField,
  CheckboxFormField,
  DynamicFormControlService,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { Subscription, map, pluck, switchMap } from 'rxjs';
import { ConnectionsService } from '../../../services';
import { FormBuilder } from '@angular/forms';
import { IConnectorPropertiesResponse } from '../../../interfaces';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: 'connections-dialog',
  styleUrls: ['connections-dialog.component.scss'],
  templateUrl: 'connections-dialog.component.html',
})
export class ConnectionsDialogComponent {
  private static readonly connectorTypeFormFieldName = 'connectorType';

  readonly connectorTypeFormGroup = this.formBuilder.group({
    connectorType: ConnectionsDialogComponent.connectorTypeFormFieldName,
  });

  readonly availableConnectorTypes$ = this.connectionsService.getAvailableConnectorTypes();
  readonly formFieldDefinitionsByConnectorType$ = this.connectorTypeFormGroup
    .get(ConnectionsDialogComponent.connectorTypeFormFieldName)
    ?.valueChanges.pipe(
      switchMap((selectedConnectorType: string) =>
        this.connectionsService.getConnectorProperties(selectedConnectorType)
      ),
      pluck('properties'),
      map(this.getFormFieldByType)
    );

  private readonly subscriptions = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: object,
    private readonly formBuilder: FormBuilder,
    private readonly connectionsService: ConnectionsService,
    private readonly dynamicFormControlService: DynamicFormControlService
  ) {}

  submitForm() {
    const form = this.dynamicFormControlService.currentFormGroup;
    if (form.valid) {
      const connectionName = form.value.connectorName;
      this.subscriptions.add(
        this.connectionsService
          .addConnection(this.connectorTypeFormGroup.value.connectorType, connectionName, form.value)
          .subscribe((res) => {
            console.log(res);
          })
      );
    } else {
      // TODO: Handle invalid form
      console.log(form.valid);
    }
  }

  private getFormFieldByType(formFieldData: IConnectorPropertiesResponse[]): BaseFormField<string>[] {
    const formFields: BaseFormField<string>[] = [];

    formFieldData.forEach((data: IConnectorPropertiesResponse) => {
      switch (data.type) {
        case 'boolean': {
          formFields.push(
            new CheckboxFormField({
              key: data.propertyName,
              label: data.displayName,
              type: 'checkbox',
              value: data.default,
              required: data.required,
            })
          );
          break;
        }
        case 'string': {
          formFields.push(
            new TextBoxFormField({
              key: data.propertyName,
              label: data.displayName,
              type: 'text',
              value: data.default,
              required: data.required,
            })
          );
          break;
        }
        case 'integer': {
          formFields.push(
            new TextBoxFormField({
              key: data.propertyName,
              label: data.displayName,
              type: 'number',
              value: data.default,
              required: data.required,
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
}
