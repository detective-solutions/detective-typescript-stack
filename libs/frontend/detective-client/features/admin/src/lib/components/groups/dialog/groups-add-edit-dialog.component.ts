/* eslint-disable sort-imports */
import {
  BaseFormField,
  DynamicFormControlService,
  DynamicFormError,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { EMPTY, Subscription, catchError, take, Observable, tap, map, pluck, combineLatest, debounceTime } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { UsersService } from '../../../services';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { IDropDownUser, IUser, IUserGroup } from '@detective.solutions/shared/data-access';
import { GroupMember, IConnectorPropertiesResponse, IGetAllUsersResponse } from '../../../models';
import { ICreateUserGroupGQLResponse, IUpdateUserGroupGQLResponse } from '../../../graphql';

@Component({
  selector: 'groups-add-edit-dialog',
  styleUrls: ['groups-add-edit-dialog.component.scss'],
  templateUrl: 'groups-add-edit-dialog.component.html',
})
export class GroupsAddEditDialogComponent implements OnInit {
  private static COLUMNS_SCHEMA = [
    {
      key: 'username',
      type: 'text',
      label: 'subTable.username',
    },
    {
      key: 'isEdit',
      type: 'isEdit',
      label: 'subTable.id',
    },
  ];

  isSubmitting = false;
  filteredOptions!: Observable<IDropDownUser[]>;
  newFormFiledData!: BaseFormField<string | boolean>[];
  dataSource: GroupMember[] = [];
  columnsSchema: { key: string; type: string; label: string }[] = GroupsAddEditDialogComponent.COLUMNS_SCHEMA;
  displayedColumns: string[] = GroupsAddEditDialogComponent.COLUMNS_SCHEMA.map((col) => col.key);

  readonly searchBox = new FormControl('');
  readonly isAddDialog = !this.dialogInputData?.id;
  readonly existingFormFieldData$ = this.userService.getUserGroupById(this.dialogInputData?.id).pipe(
    map((response: IUserGroup) => {
      response.members?.forEach((element) => {
        this.addRow(element.xid, `${element.firstname} ${element.lastname}`, false);
      });
      this.isSubmitting = true;
      return response;
    }),
    map((response: IUserGroup) => this.generateTableProperties(response.name ?? '', response.description ?? '')),
    pluck('properties'),
    map(this.getFormFieldByType),
    tap(() => (this.isSubmitting = false)),
    catchError((error: Error) => {
      this.handleError(DynamicFormError.FORM_INIT_ERROR, error);
      return EMPTY;
    })
  );

  @ViewChild(GroupsAddEditDialogComponent.COLUMNS_SCHEMA[0].key) input: string | undefined;

  private userOptions$!: Observable<IDropDownUser[]>;
  private readonly subscriptions = new Subscription();

  private usersToDelete: { xid: string }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { id: string },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly userService: UsersService,
    private readonly dialogRef: MatDialogRef<GroupsAddEditDialogComponent>,
    private readonly dynamicFormControlService: DynamicFormControlService,
    private readonly logger: LogService
  ) {
    this.subscriptions.add(
      this.dynamicFormControlService.formSubmit$.subscribe((formGroup: FormGroup) => this.submitForm(formGroup))
    );
  }

  ngOnInit() {
    this.newFormFiledData = this.generateAddForm();

    this.userOptions$ = this.userService.getAllUsers(0, 10000).pipe(
      map((users: IGetAllUsersResponse) => {
        return users.users.map((user: IUser) => {
          return { xid: user.id, name: `${user.firstname} ${user.lastname}` };
        });
      })
    );

    const searchValues$ = this.searchBox.valueChanges.pipe(
      debounceTime(200),
      map((searchValue: string) => searchValue.toLowerCase()),
      catchError(() => EMPTY)
    );

    this.filteredOptions = combineLatest([this.userOptions$, searchValues$]).pipe(
      map(([list, searchVal]) => {
        const currentGroupMemebers = this.dataSource.map((member: GroupMember) => member.username);
        return list.filter(
          (userItem: IDropDownUser) =>
            userItem.name.toLowerCase().includes(searchVal) && !currentGroupMemebers.includes(userItem.name)
        );
      })
    );
  }

  submitForm(formGroup?: FormGroup) {
    formGroup = formGroup ?? this.dynamicFormControlService.currentFormGroup;

    const members = this.dataSource
      .filter((member: GroupMember) => member.isNew)
      .map((member: GroupMember) => {
        return { xid: member.id };
      });

    if (formGroup.valid && this.isAddDialog) {
      const payload = {
        name: formGroup.value.name,
        description: formGroup.value.description,
        members: members,
      };

      this.userService
        .createUserGroup(payload)
        .pipe(
          take(1),
          catchError((error: Error) => {
            this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
            return EMPTY;
          })
        )
        .subscribe((response: ICreateUserGroupGQLResponse) => {
          this.handleResponse(response);
        });
    } else if (formGroup.valid && !this.isAddDialog) {
      const update = {
        xid: this.dialogInputData.id,
        name: formGroup.value.name,
        description: formGroup.value.description,
        members: members,
        toDeleteMembers: this.usersToDelete,
      };

      this.userService
        .updateUserGroup(update)
        .pipe(
          take(1),
          catchError((error: Error) => {
            this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
            return EMPTY;
          })
        )
        .subscribe((response: IUpdateUserGroupGQLResponse) => {
          this.handleResponse(response);
        });
    }
  }

  displayEmptyString() {
    return '';
  }

  addRow(id: string, username: string, isNew: boolean = true) {
    const newRow = {
      id: id,
      username: username,
      isNew: isNew,
    };
    this.dataSource = [...this.dataSource, newRow];
  }

  removeRow(id: string) {
    const userToDelete = this.dataSource.filter((member: GroupMember) => member.id === id)[0];
    if (!userToDelete.isNew) {
      this.usersToDelete.push({ xid: userToDelete.id });
    }

    this.dataSource = this.dataSource.filter((member: GroupMember) => member.id !== id);
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

  generateAddForm() {
    const tableProperties = this.generateTableProperties(' ', ' ');
    const formField = this.getFormFieldByType(tableProperties.properties);
    return formField;
  }

  generateTableProperties(title: string, description: string) {
    return {
      properties: [
        {
          propertyName: 'name',
          displayName: this.getTranslation('groups.addEditDialog.subTable.displayNameTitle'),
          description: this.getTranslation('groups.addEditDialog.subTable.displayNameTitle'),
          default: title ?? '',
          options: [{ key: '', value: '' }],
          type: 'string',
          required: true,
        },
        {
          propertyName: 'description',
          displayName: this.getTranslation('groups.addEditDialog.subTable.displayNameDescription'),
          description: this.getTranslation('groups.addEditDialog.subTable.displayNameDescription'),
          default: description ?? '',
          options: [{ key: '', value: '' }],
          type: 'string',
          required: true,
        },
      ],
    };
  }

  private getFormFieldByType(formFieldData: IConnectorPropertiesResponse[]): BaseFormField<string | boolean>[] {
    const formFields: BaseFormField<string | boolean>[] = [];

    formFieldData.forEach((data: IConnectorPropertiesResponse) => {
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
    });
    return formFields;
  }

  private handleResponse(response: IUpdateUserGroupGQLResponse | ICreateUserGroupGQLResponse) {
    this.isSubmitting = false;
    if (!Object.keys(response).includes('error')) {
      this.translationService
        .selectTranslate('groups.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.userService.refreshUserGroups();
    } else {
      this.logger.error('Group could not be edited');
      this.translationService
        .selectTranslate('groups.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error) {
    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'groups.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isSubmitting = false;
      translationKey = 'groups.toastMessages.formSubmitError';
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
