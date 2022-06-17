import {
  BaseFormField,
  CheckboxFormField,
  DropdownFormField,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { Observable, map, of, switchMap, tap } from 'rxjs';
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
    tap(console.log),
    switchMap((selectedConnectorType: string) => this.connectionsService.getConnectorProperties(selectedConnectorType)),
    map(this.getFormFieldByType),
    tap(console.log)
  );
  formFieldDefinitions$: Observable<BaseFormField<any>[]> = of([
    new DropdownFormField({
      key: 'connectorTypes',
      label: 'Connector Type',
      options: [
        { key: 'accumulo', value: 'Accumulo' },
        { key: 'bigquery', value: 'BigQuery' },
        { key: 'cassandra', value: 'Cassandra' },
        { key: 'hive', value: 'Hive' },
        { key: 'postgresql', value: 'PostgreSQL' },
      ],
    }),
    new TextBoxFormField({
      key: 'connectorName',
      label: 'Name',
      required: true,
    }),
  ]);

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
          formFieldDefinition.push(new CheckboxFormField({ key: data.title, label: data.title, type: 'checkbox' }));
          return;
        }
        case 'string': {
          formFieldDefinition.push(
            new TextBoxFormField({ key: data.title, label: data.title, type: 'text', required: true })
          );
          return;
        }
        case 'integer': {
          formFieldDefinition.push(
            new TextBoxFormField({ key: data.title, label: data.title, type: 'number', required: true })
          );
          return;
        }
        default: {
          return;
        }
      }
    });
    return formFieldDefinition;
  }
}
