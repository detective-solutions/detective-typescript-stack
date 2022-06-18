import {
  CheckboxFormField,
  DynamicFormControlService,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { Subscription, map, switchMap } from 'rxjs';
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
      // TODO: This should not be necessary anymore after DET-884 is fixed
      const payload = {
        connectorName: form.value['Connectorname'],
        databaseSchema: form.value['database schema'],
        database: form.value['database name'],
        host: form.value['host address'],
        user: form.value['username'],
        password: form.value['password'],
        port: form.value['port'],
        ssl: form.value['ssl security'],
        metaDataCacheMaximumSize: form.value['Metadata cache size'],
        batchSize: form.value['batch size'],
      };

      const connectionName = form.value.Connectorname;
      this.subscriptions.add(
        this.connectionsService
          .addConnection(this.connectorTypeFormGroup.value.connectorType, connectionName, payload)
          .subscribe((res) => {
            console.log(res);
          })
      );
    } else {
      // TODO: Handle invalid form
      console.log(form.valid);
    }
  }

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
