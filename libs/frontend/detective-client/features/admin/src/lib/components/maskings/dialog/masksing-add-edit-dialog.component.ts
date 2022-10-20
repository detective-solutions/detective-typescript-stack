/* eslint-disable sort-imports */
import {
  BaseFormField,
  CheckboxFormField,
  DynamicFormControlService,
  TextBoxFormField,
  DropdownFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject } from '@angular/core';
import { EMPTY, Subscription, catchError, map, pluck, tap, Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IConnectorPropertiesResponse, IGetAllConnectionsResponse } from '../../../models';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConnectionsService, MaskingService } from '../../../services';
import { IDropDownValues } from '@detective.solutions/shared/data-access';
import { ConnectionTable } from '@detective.solutions/frontend/shared/data-access';
import { v4 as uuidv4 } from 'uuid';

const USER_DATA = [
  {
    id: uuidv4(),
    columnName: 'Users',
    visible: '',
    valueName: 'John Smith',
    replaceType: '*',
    customReplaceType: '',
  },
];

const COLUMNS_SCHEMA = [
  {
    key: 'filterType',
    type: 'text',
    label: 'Filter',
  },
  {
    key: 'columnName',
    type: 'text',
    label: 'Column',
  },
  {
    key: 'visible',
    type: 'text',
    label: 'Hide',
  },
  {
    key: 'valueName',
    type: 'text',
    label: 'Value',
  },
  {
    key: 'replaceType',
    type: 'text',
    label: 'Method',
  },
  {
    key: 'customReplaceType',
    type: 'text',
    label: 'custom value',
  },
  {
    key: 'isEdit',
    type: 'isEdit',
    label: '',
  },
];

@Component({
  selector: 'masking-add-edit-dialog',
  styleUrls: ['masking-add-edit-dialog.component.scss'],
  templateUrl: 'masking-add-edit-dialog.component.html',
})
export class MaskingAddEditDialogComponent {
  private static readonly connectorFormFieldName = 'connector';
  private connector!: string;
  private readonly subscriptions = new Subscription();
  readonly availableConnections$: Observable<IGetAllConnectionsResponse>;

  readonly defaultDropDownValues = [{ key: '', value: '' }];

  userGroups$: IDropDownValues[] = this.defaultDropDownValues;
  connectorTables$: IDropDownValues[] = this.defaultDropDownValues;

  availableColumns$: { table: string; columns: { xid: string; columnName: string }[] }[] = [
    { table: '', columns: [{ xid: '', columnName: '' }] },
  ];
  tableColumns$: { table: string; columns: [{ xid: string; columnName: string }] } = {
    table: '',
    columns: [{ xid: '', columnName: '' }],
  };

  isAddDialog = !this.dialogInputData?.id;
  showSubmitButton = false;
  isSubmitting = false;
  displayedColumns: string[] = COLUMNS_SCHEMA.map((col) => col.key);
  dataSource = USER_DATA;

  // TODO: Replace with SelectionGroup once defined
  columnsSchema: { key: string; type: string; label: string }[] = COLUMNS_SCHEMA;

  dropDownValues: { columnName: string[]; visible: string[]; filterType: string[] } = {
    columnName: ['test', 'test2', 'test3'],
    visible: ['yes', 'no'],
    filterType: ['row', 'column'],
  };

  readonly connectorTypeFormGroup = this.formBuilder.group({
    connector: MaskingAddEditDialogComponent.connectorFormFieldName,
  });

  readonly formFieldDefinitions$ = this.connectorTypeFormGroup
    .get(MaskingAddEditDialogComponent.connectorFormFieldName)
    ?.valueChanges.pipe(
      tap((selectedConnectorType: string) => (this.connector = selectedConnectorType)),
      map(() => {
        return {
          properties: [
            {
              propertyName: 'table',
              displayName: 'Table',
              description: 'Which table is the masking for',
              default: '',
              values: this.connectorTables$,
              type: 'select',
              required: true,
            },
            {
              propertyName: 'userGroup',
              displayName: 'User Group',
              description: 'For which user groups',
              default: '',
              values: this.userGroups$,
              type: 'select',
              required: true,
            },
            {
              propertyName: 'title',
              displayName: 'Title',
              description: 'The name of the masking displayed later on',
              default: '',
              values: [{ key: '', value: '' }],
              type: 'string',
              required: true,
            },
            {
              propertyName: 'description',
              displayName: 'Description',
              description: 'When and and how this masking should be applied',
              default: '',
              values: [{ key: '', value: '' }],
              type: 'string',
              required: true,
            },
          ],
        };
      }),
      pluck('properties'),
      map(this.getFormFieldByType),
      tap(() => (this.showSubmitButton = true)),
      catchError((error) => {
        console.log(error);
        // this.handleError(DynamicFormError.FORM_INIT_ERROR, error);
        return EMPTY;
      })
    );

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { id: string },
    private readonly maskingService: MaskingService,
    private readonly dynamicFormControlService: DynamicFormControlService,
    private readonly connectionsService: ConnectionsService,
    private readonly formBuilder: FormBuilder
  ) {
    this.subscriptions.add(
      this.dynamicFormControlService.formSubmit$.subscribe((formGroup: FormGroup) => this.submitForm(formGroup))
    );

    this.availableConnections$ = this.connectionsService.getAllConnections(0, 500);
    this.availableConnections$.subscribe((e) => console.log(e));
    this.maskingService.getAvailableUserGroups().subscribe((x) => {
      this.userGroups$ = x;
    });

    // TODO: Query dynamically on connector selection
    this.connectionsService.getTablesOfConnection('5a38e2ca-a16c-432e-ab51-8a4c75cb6d5e').subscribe((x) => {
      const result: IDropDownValues[] = [];
      x.connectedTables.forEach((data: ConnectionTable) => {
        result.push({ key: data.xid, value: data.name });
      });
      this.connectorTables$ = result;
    });
  }

  submitForm(formGroup?: FormGroup) {
    formGroup = formGroup ?? this.dynamicFormControlService.currentFormGroup;
    console.log(formGroup);
  }

  addRow() {
    const newRow = {
      id: uuidv4(),
      columnName: '',
      visible: '',
      valueName: '',
      replaceType: '',
      customReplaceType: '',
      isEdit: true,
    };
    this.dataSource = [newRow, ...this.dataSource];
  }

  removeRow(id: string) {
    this.dataSource = this.dataSource.filter((u) => u.id !== id);
  }

  updateAvailableTables(selectedObject: any) {
    this.connectionsService.getTablesOfConnection(selectedObject.value).subscribe((x) => {
      const tables: IDropDownValues[] = [];
      const columns: { table: string; columns: { xid: string; columnName: string }[] }[] = [
        { table: '', columns: [{ xid: '', columnName: '' }] },
      ];
      x.connectedTables.forEach((data: ConnectionTable) => {
        tables.push({ key: data.xid, value: data.name });
        columns.push({ table: data.xid, columns: data.columns });
      });
      this.connectorTables$ = tables;
      this.availableColumns$ = columns;
    });
  }

  updateAvailableColumns(selectedObject: any) {
    console.log('table: ', selectedObject.value);
  }

  getDropdownValues(key: any) {
    type StatusKey = keyof typeof this.dropDownValues;
    const dropDownKey: StatusKey = key;
    return this.dropDownValues[dropDownKey];
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
        case 'select': {
          formFields.push(
            new DropdownFormField({
              type: 'dropdown',
              key: data.propertyName,
              label: data.displayName,
              options: data.values,
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
}
