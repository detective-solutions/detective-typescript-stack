/* eslint-disable sort-imports */
import {
  BaseFormField,
  CheckboxFormField,
  DynamicFormControlService,
  TextBoxFormField,
  DropdownFormField,
  DynamicFormError,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { AfterViewChecked, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { EMPTY, Subscription, catchError, map, pluck, tap, Observable, delay, take } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  IConnectorPropertiesResponse,
  IGetAllConnectionsResponse,
  IMaskSubTableDataDef,
  IMaskSubTableDataDropdown,
  IMaskSubTableDef,
  IMaskDeleteInput,
  ITableColumns,
} from '../../../models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConnectionsService, MaskingService, UsersService } from '../../../services';
import { IDropDownValues, IMasking, IMask } from '@detective.solutions/shared/data-access';
import { IConnectionTable } from '@detective.solutions/frontend/shared/data-access';
import { v4 as uuidv4 } from 'uuid';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { ProviderScope, TranslocoService, TRANSLOCO_SCOPE } from '@ngneat/transloco';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { ICreateNewMaskingGQLResponse, IUpdateMaskingGQLResponse } from '../../../graphql';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: 'masking-add-edit-dialog',
  styleUrls: ['masking-add-edit-dialog.component.scss'],
  templateUrl: 'masking-add-edit-dialog.component.html',
})
export class MaskingAddEditDialogComponent implements AfterViewChecked, OnDestroy {
  private static COLUMNS_SCHEMA = [
    {
      key: 'filterType',
      type: 'select',
      label: 'subTable.ColumnTitleFilter',
    },
    {
      key: 'columnName',
      type: 'select',
      label: 'subTable.ColumnTitleColumn',
    },
    {
      key: 'visible',
      type: 'select',
      label: 'subTable.ColumnTitleHide',
    },
    {
      key: 'valueName',
      type: 'text',
      label: 'subTable.ColumnTitleValueName',
    },
    {
      key: 'replaceType',
      type: 'select',
      label: 'subTable.ColumnTitleMethod',
    },
    {
      key: 'customReplaceType',
      type: 'text',
      label: 'subTable.ColumnTitleCustomReplaceType',
    },
    {
      key: 'isEdit',
      type: 'isEdit',
      label: 'subTable.ColumnTitleIsEdit',
    },
  ];
  private static BINARY_ANSWER = [
    { key: 'subTable.true', value: 'true' },
    { key: 'subTable.false', value: 'false' },
  ];
  private static FILTER_TYPES = [
    { key: 'subTable.dimensionColumn', value: MaskingService.COLUMN_MASK_NAME },
    { key: 'subTable.dimensionRow', value: MaskingService.ROW_MASK_NAME },
  ];
  private static MASK_METHODS = [
    { value: 'full', key: 'subTable.maskingMethods.full' },
    { value: 'full email', key: 'subTable.maskingMethods.fullEmail' },
    { value: 'credit card', key: 'subTable.maskingMethods.creditCard' },
    { value: 'provider email', key: 'subTable.maskingMethods.providerEmail' },
    { value: 'phone number', key: 'subTable.maskingMethods.phoneNumber' },
    { value: 'postal code', key: 'subTable.maskingMethods.postalCode' },
    { value: 'singe name', key: 'subTable.maskingMethods.singleName' },
    { value: 'first- and lastname', key: 'subTable.maskingMethods.firstAndLastname' },
    { value: 'email', key: 'subTable.maskingMethods.email' },
    { value: 'address streetname and number', key: 'subTable.maskingMethods.fullAddress' },
    { value: 'full address', key: 'subTable.maskingMethods.addressStreetnameAndNumber' },
    { value: 'decimal', key: 'subTable.maskingMethods.decimal' },
    { value: 'number', key: 'subTable.maskingMethods.number' },
    { value: 'custom', key: 'subTable.maskingMethods.custom' },
  ];
  private static readonly connectorFormFieldName = 'connector';

  @ViewChild(MaskingAddEditDialogComponent.COLUMNS_SCHEMA[0].key) input: string | undefined;
  isSubmitting = false;
  dataSource: IMaskSubTableDataDef[] = [];
  showSubmitButton = false;
  tableColumns$!: IDropDownValues[];
  selectedMasking$!: IMasking;
  isAddDialog = !this.dialogInputData?.xid;
  masksToDelete: IMaskDeleteInput = { columns: [], rows: [] };
  readonly defaultDropDownValues = [{ key: '', value: '' }];
  readonly availableConnections$: Observable<IGetAllConnectionsResponse> = this.connectionsService.getAllConnections(
    0,
    500
  );
  userGroups$: IDropDownValues[] = this.defaultDropDownValues;
  connectorTables$: IDropDownValues[] = this.defaultDropDownValues;
  displayedColumns: string[] = MaskingAddEditDialogComponent.COLUMNS_SCHEMA.map((col) => col.key);
  availableColumns$: ITableColumns[] = [{ table: '', columns: [{ xid: '', columnName: '' }] }];
  columnsSchema: IMaskSubTableDef[] = MaskingAddEditDialogComponent.COLUMNS_SCHEMA;
  dropDownValues: IMaskSubTableDataDropdown = {
    columnName: this.tableColumns$,
    visible: MaskingAddEditDialogComponent.BINARY_ANSWER,
    filterType: MaskingAddEditDialogComponent.FILTER_TYPES,
    replaceType: MaskingAddEditDialogComponent.MASK_METHODS,
  };
  readonly connectorTypeFormGroup = this.formBuilder.group({
    connector: MaskingAddEditDialogComponent.connectorFormFieldName,
  });
  existingFormFieldData$!: Observable<BaseFormField<string | boolean>[]>;
  readonly formFieldDefinitions$ = this.connectorTypeFormGroup
    .get(MaskingAddEditDialogComponent.connectorFormFieldName)
    ?.valueChanges.pipe(
      map((selectedConnectorType: string) => (this.connector = selectedConnectorType)),
      tap(() => {
        this.updateAvailableTables();
        this.isSubmitting = true;
      }),
      delay(700),
      map(() => this.generateTableProperties()),
      pluck('properties'),
      map(this.getFormFieldByType),
      tap(() => (this.isSubmitting = false)),
      tap(() => (this.showSubmitButton = true)),
      catchError((error) => {
        this.handleError(DynamicFormError.FORM_INIT_ERROR, error);
        return EMPTY;
      })
    );

  private connector!: string;
  private readonly subscriptions = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { xid: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly maskingService: MaskingService,
    private readonly userService: UsersService,
    private readonly dynamicFormControlService: DynamicFormControlService,
    private readonly connectionsService: ConnectionsService,
    private readonly formBuilder: FormBuilder,
    private readonly toastService: ToastService,
    private readonly logger: LogService,
    private readonly dialogRef: MatDialogRef<MaskingAddEditDialogComponent>
  ) {
    this.subscriptions.add(
      this.dynamicFormControlService.formSubmit$.subscribe((formGroup: FormGroup) => this.submitForm(formGroup))
    );

    this.maskingService.getAvailableUserGroups().subscribe((groups: IDropDownValues[]) => {
      this.userGroups$ = groups;
    });

    this.dynamicFormControlService.selectionChanged$.subscribe((event: IDropDownValues) => {
      if (event.key === 'table') {
        const xid: string = String(event.value) || '';
        this.updateAvailableColumns(xid);
      }
    });

    this.existingFormFieldData$ = this.maskingService.getMaskingById(this.dialogInputData?.xid).pipe(
      tap((response: IMasking) => {
        this.connector = response.table.dataSource.xid;
        this.selectedMasking$ = response;
        this.isSubmitting = true;
        this.dataSource = [];
        this.updateAvailableColumns(response.table.xid);
        this.createMasksFromFetch(response.rows ?? [], MaskingService.ROW_MASK_NAME);
        this.createMasksFromFetch(response.columns ?? [], MaskingService.COLUMN_MASK_NAME);
      }),
      map(() => this.generateTableProperties()),
      pluck('properties'),
      map(this.getFormFieldByType),
      tap(() => (this.isSubmitting = false)),
      tap(() => (this.showSubmitButton = true)),
      catchError((error) => {
        this.handleError(DynamicFormError.FORM_INIT_ERROR, error);
        return EMPTY;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.dataSource = [];
  }

  ngAfterViewChecked() {
    this.dropDownValues = {
      columnName: this.tableColumns$,
      visible: MaskingAddEditDialogComponent.BINARY_ANSWER,
      filterType: MaskingAddEditDialogComponent.FILTER_TYPES,
      replaceType: MaskingAddEditDialogComponent.MASK_METHODS,
    };
  }

  getTranslation(path: string) {
    let translatedWord = '';
    this.translationService
      .selectTranslate(path, {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        translatedWord = translation;
      });
    return translatedWord;
  }

  generateTableProperties() {
    if (this.isAddDialog) {
      return {
        properties: [
          {
            propertyName: 'table',
            displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameTable'),
            description: 'Which table is the masking for',
            default: '',
            options: this.connectorTables$,
            type: 'dropdown',
            required: true,
          },
          {
            propertyName: 'groups',
            displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameGroups'),
            description: 'For which user groups',
            default: '',
            options: this.userGroups$,
            type: 'dropdown',
            required: true,
          },
          {
            propertyName: 'name',
            displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameTitle'),
            description: 'The name of the masking displayed later on',
            default: '',
            options: [{ key: '', value: '' }],
            type: 'string',
            required: true,
          },
          {
            propertyName: 'description',
            displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameDescription'),
            description: 'When and and how this masking should be applied',
            default: '',
            options: [{ key: '', value: '' }],
            type: 'string',
            required: true,
          },
        ],
      };
    } else {
      return {
        properties: [
          {
            propertyName: 'table',
            displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameTable'),
            description: 'Which table is the masking for',
            default: this.selectedMasking$.table.name ?? '',
            options: [{ key: '', value: '' }],
            type: 'string',
            required: true,
            disabled: true,
          },
          {
            propertyName: 'groups',
            displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameGroups'),
            description: 'For which user groups',
            default: (this.selectedMasking$.groups ?? [])[0].name ?? '',
            options: [{ key: '', value: '' }],
            type: 'string',
            required: true,
            disabled: true,
          },
          {
            propertyName: 'name',
            displayName: 'Title',
            description: this.getTranslation('maskings.addEditDialog.subTable.displayNameTitle'),
            default: this.selectedMasking$.name ?? '',
            options: [{ key: '', value: '' }],
            type: 'string',
            required: true,
            disabled: false,
          },
          {
            propertyName: 'description',
            displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameDescription'),
            description: 'When and and how this masking should be applied',
            default: this.selectedMasking$.description ?? '',
            options: [{ key: '', value: '' }],
            type: 'string',
            required: true,
            disabled: false,
          },
        ],
      };
    }
  }

  submitForm(formGroup?: FormGroup) {
    this.isSubmitting = true;
    formGroup = formGroup ?? this.dynamicFormControlService.currentFormGroup;

    if (formGroup.valid && this.isAddDialog) {
      const masking = {
        table: { xid: formGroup.value.table },
        groups: [{ xid: formGroup.value.groups }],
        name: formGroup.value.name,
        tenant: { xid: this.userService.getTenant() },
        description: formGroup.value.description,
      };

      this.maskingService
        .createMasksFromCurrentData({
          masking: masking,
          masks: this.dataSource,
        })
        .pipe(
          take(1),
          catchError((error: Error) => {
            this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
            return EMPTY;
          })
        )
        .subscribe((response: ICreateNewMaskingGQLResponse) => {
          this.handleResponse(response);
        });
    } else if (formGroup.valid && this.isAddDialog === false) {
      const set = {
        masking: {
          xid: this.dialogInputData?.xid,
          name: formGroup.value.name,
          description: formGroup.value.description,
        },
        masks: this.dataSource,
        toDelete: this.masksToDelete,
      };

      this.maskingService
        .updateMasking(set)
        .pipe(
          take(1),
          catchError((error: Error) => {
            this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
            return EMPTY;
          })
        )
        .subscribe((response: IUpdateMaskingGQLResponse) => {
          this.handleResponse(response);
        });
    }

    this.dataSource = [];
  }

  addRow() {
    const newRow = {
      filterType: '',
      id: uuidv4(),
      columnName: '',
      visible: true,
      valueName: '',
      replaceType: '',
      customReplaceType: '',
      isNew: true,
      isEdit: true,
    };
    this.dataSource = [...this.dataSource, newRow];
  }

  removeRow(id: string) {
    const maskToDelete = this.dataSource.filter((mask) => mask.id === id)[0];
    if (!maskToDelete.isNew) {
      switch (maskToDelete.filterType) {
        case MaskingService.COLUMN_MASK_NAME:
          this.masksToDelete.columns.push({ xid: maskToDelete.id });
          break;
        case MaskingService.ROW_MASK_NAME:
          this.masksToDelete.rows.push({ xid: maskToDelete.id });
          break;
        default:
          break;
      }
    }
    this.dataSource = this.dataSource.filter((mask) => mask.id !== id);
  }

  createMasksFromFetch(data: IMask[], maskType: string = MaskingService.ROW_MASK_NAME) {
    data.forEach((mask: IMask) => {
      this.dataSource.push({
        filterType: maskType,
        id: mask.xid ?? '',
        columnName: mask.columnName ?? '',
        visible: mask.visible ?? true,
        valueName: mask.valueName ?? '',
        replaceType: mask.replaceType ?? '',
        customReplaceType: mask.customReplaceValue ?? '',
        isNew: false,
      });
    });
  }

  updateAvailableTables() {
    this.connectionsService.getTablesOfConnection(this.connector).subscribe((x) => {
      const tables: IDropDownValues[] = [];
      x.connectedTables.forEach((data: IConnectionTable) => {
        tables.push({ key: data.xid, value: data.name });
      });
      this.connectorTables$ = tables;
    });
  }

  updateAvailableColumns(id: string) {
    this.maskingService.getColumnsByTableId(id).subscribe((response) => {
      const result: IDropDownValues[] = [];
      response.queryColumnDefinition.forEach((element) => {
        result.push({ value: element.columnName, key: element.columnName });
      });
      this.tableColumns$ = result;
    });
  }

  getDropdownValues(key: any) {
    type StatusKey = keyof typeof this.dropDownValues;
    const dropDownKey: StatusKey = key;
    return this.dropDownValues[dropDownKey];
  }

  openMaskingDocumentation() {
    window.open(`${environment.productDoc}${environment.productDocMasking}`, '_blank');
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
              disabled: data.disabled,
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
        case 'dropdown': {
          formFields.push(
            new DropdownFormField({
              type: 'dropdown',
              key: data.propertyName,
              label: data.displayName,
              options: data.options,
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

  private handleResponse(response: IUpdateMaskingGQLResponse | ICreateNewMaskingGQLResponse) {
    this.isSubmitting = false;
    if (!Object.keys(response).includes('error')) {
      this.translationService
        .selectTranslate('maskings.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.maskingService.refreshMaskings();
    } else {
      this.logger.error('Masking could not be edited');
      this.translationService
        .selectTranslate('maskings.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error) {
    let translationKey;
    this.logger.error(String(error));
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'maskings.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isSubmitting = false;
      translationKey = 'maskings.toastMessages.formSubmitError';
      this.logger.error('Encountered an error while submitting the form data');
    }

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
