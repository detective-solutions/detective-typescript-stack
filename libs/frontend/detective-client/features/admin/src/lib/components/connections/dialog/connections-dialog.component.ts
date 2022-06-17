import { CheckboxFormField, TextBoxFormField } from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { ConnectionsService } from '../../../services';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: 'connections-dialog',
  styleUrls: ['connections-dialog.component.scss'],
  templateUrl: 'connections-dialog.component.html',
})
export class ConnectionsDialogComponent {
  connectorTypeFormGroup = this.formBuilder.group({ connectorType: 'connectorType' });

  availableConnectorTypes$ = this.connectionsService.getAvailableConnectorTypes();

  formFieldDefinitionsByConnectorType = this.connectorTypeFormGroup.get('connectorType')?.valueChanges.pipe(
    switchMap((selectedConnectorType: string) => this.connectionsService.getConnectorProperties(selectedConnectorType)),
    map(this.getFormFieldByType)
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: object,
    private readonly formBuilder: FormBuilder,
    private readonly connectionsService: ConnectionsService
  ) {}

  private getFormFieldByType(formFieldData: any): any[] {
    const formFieldDefinition: any[] = [];
    Object.values(formFieldData.properties).forEach((data: any) => {
      switch (data.type) {
        case 'boolean': {
          formFieldDefinition.push(
            new CheckboxFormField({ key: data.title, label: data.title, type: 'checkbox', value: data.default })
          );
          return;
        }
        case 'string': {
          formFieldDefinition.push(
            new TextBoxFormField({
              key: data.title,
              label: data.title,
              type: 'text',
              value: data.default,
              required: true,
            })
          );
          return;
        }
        case 'integer': {
          formFieldDefinition.push(
            new TextBoxFormField({
              key: data.title,
              label: data.title,
              type: 'number',
              value: data.default,
              required: true,
            })
          );
          return;
        }
        default: {
          throw new Error(`Unknown connector property type ${data?.type}`);
        }
      }
    });
    return formFieldDefinition;
  }
}
