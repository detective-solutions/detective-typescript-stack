import { BaseFormField, DropdownFormField, TextBoxFormField } from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: 'connections-dialog',
  templateUrl: 'connections-dialog.component.html',
})
export class ConnectionsDialogComponent {
  connectorTypeFormGroup = new FormGroup({});

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

  constructor(@Inject(MAT_DIALOG_DATA) public data: object) {}
}
