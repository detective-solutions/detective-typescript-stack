import { AfterViewChecked, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import {
  BaseFormField,
  CheckboxFormField,
  DropdownFormField,
  DynamicFormControlService,
  DynamicFormError,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { EMPTY, Observable, Subject, Subscription, catchError, filter, map, of, switchMap, take, tap } from 'rxjs';
import {
  GetAllColumnsGQL,
  GetAllConnectionsGQL,
  GetAllUserGroupsAsDropDownValuesGQL,
  GetTablesBySourceConnectionIdGQL,
  ICreateNewMaskingGQLResponse,
  IGetAllColumnsGQLResponse,
  IGetAllConnectionsGQLResponse,
  IGetTablesBySourceConnectionIdGQLResponse,
  IGetUserGroupsAsDropDownValuesGQLResponse,
  IUpdateMaskingGQLResponse,
} from '../../../graphql';
import { IColumn, IDropDownValues, IMask } from '@detective.solutions/shared/data-access';
import {
  IConnectionTable,
  ISourceConnectionTables,
  MaskingDTO,
  SourceConnectionDTO,
} from '@detective.solutions/frontend/shared/data-access';
import { IConnectorPropertiesResponse, IMaskSubTableDataDef, IMaskSubTableDataDropdown } from '../../../models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaskingService, UsersService } from '../../../services';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { QueryRef } from 'apollo-angular';
import { UntypedFormBuilder } from '@angular/forms';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Component({
  selector: 'maskings-add-edit-dialog',
  styleUrls: ['maskings-add-edit-dialog.component.scss'],
  templateUrl: 'maskings-add-edit-dialog.component.html',
})
export class MaskingAddEditDialogComponent implements OnInit, AfterViewChecked, OnDestroy {
  private static readonly connectorFormFieldName = 'connector';
  private static readonly BINARY_ANSWER = [
    { key: 'subTable.true', value: 'true' },
    { key: 'subTable.false', value: 'false' },
  ];
  private static readonly FILTER_TYPES = [
    { key: 'subTable.dimensionColumn', value: MaskingService.COLUMN_MASK_NAME },
    { key: 'subTable.dimensionRow', value: MaskingService.ROW_MASK_NAME },
  ];
  private static readonly MASK_METHODS = [
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

  readonly columnsSchema = [
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

  private dataSource: IMaskSubTableDataDef[] = [];
  private tableColumns!: IDropDownValues[];

  readonly masksToDelete!: { columns: IMask[]; rows: IMask[] };
  readonly isAddDialog = !this.dialogInputData.masking;
  readonly displayedColumns = this.columnsSchema.map((col) => col.key);
  readonly connectorTypeFormGroup = this.formBuilder.nonNullable.group({
    connector: MaskingAddEditDialogComponent.connectorFormFieldName,
  });

  readonly isLoading$ = new Subject<boolean>();
  readonly formFieldDefinitionsByConnectorType$ = this.connectorTypeFormGroup
    .get(MaskingAddEditDialogComponent.connectorFormFieldName)
    ?.valueChanges.pipe(
      tap((selectedConnectorType: string) => (this.currentConnectorTypeId = selectedConnectorType)),
      switchMap(this.getAllUserGroupsAsDropdownValues),
      tap((userGroupsAsDropdownValues: IDropDownValues[]) => {
        this.userGroupsAsDropdownValues = userGroupsAsDropdownValues;
        this.updateAvailableTables();
      }),
      map(() => this.getFormFieldByType(this.getTableProperties())),
      catchError((error) => this.handleError(DynamicFormError.FORM_INIT_ERROR, error))
    );
  readonly existingFormFieldData$ = of(this.isAddDialog).pipe(
    filter((isAddDialog: boolean) => !isAddDialog),
    tap(() => (this.currentConnectorTypeId = this.dialogInputData.masking.table.dataSource.id)),
    map(() => this.getFormFieldByType(this.getTableProperties())),
    catchError((error) => this.handleError(DynamicFormError.FORM_INIT_ERROR, error))
  );

  private readonly defaultDropDownValues = [{ key: '', value: '' }];
  private readonly subscriptions = new Subscription();

  private connectorTables = this.defaultDropDownValues;
  private maskDataDropdownValues: IMaskSubTableDataDropdown = {
    columnName: this.tableColumns,
    visible: MaskingAddEditDialogComponent.BINARY_ANSWER,
    filterType: MaskingAddEditDialogComponent.FILTER_TYPES,
    replaceType: MaskingAddEditDialogComponent.MASK_METHODS,
  };
  private userGroupsAsDropdownValues!: IDropDownValues[];
  private currentConnectorTypeId!: string;
  private getAllConnectionsWatchQuery!: QueryRef<Response>;
  private getAllColumnsWatchQuery!: QueryRef<Response>;
  private getTablesBySourceConnectionIdWatchQuery!: QueryRef<Response>;
  private getAllUsersAsDropdownValuesWatchQuery!: QueryRef<Response>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { masking: MaskingDTO; searchQuery: QueryRef<Response> },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly authService: AuthService,
    private readonly translationService: TranslocoService,
    private readonly maskingService: MaskingService,
    private readonly userService: UsersService,
    private readonly dynamicFormControlService: DynamicFormControlService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly getTablesBySourceConnectionIdGQL: GetTablesBySourceConnectionIdGQL,
    private readonly getAllUserGroupsAsDropdownValuesGQL: GetAllUserGroupsAsDropDownValuesGQL,
    private readonly getAllColumnsGQL: GetAllColumnsGQL,
    private readonly getAllConnectionsGQL: GetAllConnectionsGQL,
    private readonly toastService: ToastService,
    private readonly logger: LogService,
    private readonly dialogRef: MatDialogRef<MaskingAddEditDialogComponent>
  ) {}

  ngOnInit() {
    this.subscriptions.add(this.dynamicFormControlService.formSubmit$.subscribe(() => this.submitForm()));
    this.dynamicFormControlService.selectionChanged$.subscribe((event: IDropDownValues) => {
      if (event.key === 'table') {
        this.updateAvailableColumns(event.value ?? '');
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.dataSource = [];
  }

  ngAfterViewChecked() {
    this.maskDataDropdownValues = {
      columnName: this.tableColumns,
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
      .subscribe((translation: string) => (translatedWord = translation));
    return translatedWord;
  }

  getAllSourceConnections(): Observable<SourceConnectionDTO[]> {
    if (!this.getAllConnectionsWatchQuery) {
      this.getAllConnectionsWatchQuery = this.getAllConnectionsGQL.watch();
    }
    return this.getAllConnectionsWatchQuery.valueChanges.pipe(
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map(({ querySourceConnection }: IGetAllConnectionsGQLResponse) =>
        querySourceConnection.map(SourceConnectionDTO.Build)
      )
    );
  }

  getTableProperties(): IConnectorPropertiesResponse[] {
    return [
      {
        propertyName: 'table',
        displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameTable'),
        description: 'Which table is the masking for', // TODO: Translate
        default: this.isAddDialog ? '' : this.dialogInputData.masking.table.name,
        options: this.isAddDialog ? undefined : this.connectorTables,
        type: this.isAddDialog ? 'dropdown' : 'string',
        required: true,
        disabled: this.isAddDialog ? false : true,
      },
      {
        propertyName: 'groups',
        displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameGroups'),
        description: 'For which user groups', // TODO: Translate
        default: this.isAddDialog ? '' : (this.dialogInputData.masking.groups ?? [])[0].name ?? '',
        options: this.isAddDialog ? this.userGroupsAsDropdownValues : [],
        type: this.isAddDialog ? 'dropdown' : 'string',
        required: true,
        disabled: this.isAddDialog ? false : true,
      },
      {
        propertyName: 'name',
        displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameTitle'),
        description: 'The name of the masking displayed later on', // TODO: Translate
        default: this.isAddDialog ? '' : this.dialogInputData.masking.name,
        type: 'string',
        required: true,
      },
      {
        propertyName: 'description',
        displayName: this.getTranslation('maskings.addEditDialog.subTable.displayNameDescription'),
        description: 'When and and how this masking should be applied', // TODO: Translate
        default: this.isAddDialog ? this.dialogInputData.masking.description : '',
        type: 'string',
        required: true,
      },
    ];
  }

  submitForm() {
    this.isLoading$.next(true);
    const formGroup = this.dynamicFormControlService.currentFormGroup;

    if (formGroup.valid && this.isAddDialog) {
      const masking = {
        table: { id: formGroup.value.table },
        groups: [{ id: formGroup.value.groups }],
        name: formGroup.value.name,
        tenant: { id: this.userService.getTenant() },
        description: formGroup.value.description,
      };

      this.maskingService
        .createMasksFromCurrentData({
          masking: masking,
          masks: this.dataSource,
        })
        .pipe(
          take(1),
          catchError((error: Error) => this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error))
        )
        .subscribe((response: ICreateNewMaskingGQLResponse) => this.handleResponse(response));
    } else if (formGroup.valid && this.isAddDialog === false) {
      const set = {
        masking: {
          id: this.dialogInputData.masking.id,
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
          catchError((error: Error) => this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error))
        )
        .subscribe((response: IUpdateMaskingGQLResponse) => this.handleResponse(response));
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
          this.masksToDelete.columns.push({ id: maskToDelete.id });
          break;
        case MaskingService.ROW_MASK_NAME:
          this.masksToDelete.rows.push({ id: maskToDelete.id });
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
        id: mask.id ?? '',
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
    if (!this.getTablesBySourceConnectionIdWatchQuery) {
      this.getTablesBySourceConnectionIdWatchQuery = this.getTablesBySourceConnectionIdGQL
        // TODO: Add parameter type
        .watch({ sourceConnectionId: this.currentConnectorTypeId });
    }
    return this.getTablesBySourceConnectionIdWatchQuery.valueChanges
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter((response: any) => response?.data),
        map((response: IGetTablesBySourceConnectionIdGQLResponse) => response.getSourceConnection),
        take(1)
      )
      .subscribe(
        (sourceConnectionTables: ISourceConnectionTables) =>
          (this.connectorTables = sourceConnectionTables.connectedTables.map((data: IConnectionTable) => {
            return { key: data.id, value: data.name };
          }))
      );
  }

  updateAvailableColumns(tableId: string) {
    if (!this.getAllColumnsWatchQuery) {
      this.getAllColumnsWatchQuery = this.getAllColumnsGQL.watch({ tableId });
    }
    return this.getAllColumnsWatchQuery.valueChanges
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        filter((response: any) => response?.data),
        map((response: IGetAllColumnsGQLResponse) => response.queryColumnDefinition)
      )
      .subscribe(
        (response: IColumn[]) =>
          (this.tableColumns = response.map((column: IColumn) => {
            return { value: column.columnName, key: column.columnName };
          }))
      );
  }

  getDropdownValueByKey(key: string) {
    return this.maskDataDropdownValues[key as keyof typeof this.maskDataDropdownValues];
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

  private getAllUserGroupsAsDropdownValues() {
    if (!this.getAllUsersAsDropdownValuesWatchQuery) {
      this.authService.authStatus$.pipe(take(1)).subscribe((authStatus: IAuthStatus) => {
        this.getAllUsersAsDropdownValuesWatchQuery = this.getAllUserGroupsAsDropdownValuesGQL.watch({
          tenant: authStatus.tenantId,
        });
      });
    }
    return this.getAllUsersAsDropdownValuesWatchQuery.valueChanges.pipe(
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map((response: IGetUserGroupsAsDropDownValuesGQLResponse) => response.queryUserGroup)
    );
  }

  private handleResponse(response: IUpdateMaskingGQLResponse | ICreateNewMaskingGQLResponse) {
    this.isLoading$.next(false);
    if (!Object.keys(response).includes('error')) {
      this.translationService
        .selectTranslate('maskings.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogInputData.searchQuery.refetch(); // Update parent view
          this.dialogRef.close();
        });
    } else {
      this.logger.error('Masking could not be edited');
      this.translationService
        .selectTranslate('maskings.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error): Observable<never> {
    let translationKey;
    this.logger.error(String(error));
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'maskings.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isLoading$.next(false);
      translationKey = 'maskings.toastMessages.formSubmitError';
      this.logger.error('Encountered an error while submitting the form data');
    }
    if (translationKey) {
      this.translationService
        .selectTranslate(translationKey, {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
    return EMPTY;
  }
}
