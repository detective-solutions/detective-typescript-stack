import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  CreateUserGroupGQL,
  ICreateUserGroupGQLResponse,
  ISearchUserGroupMembersByTenantIdGQLResponse,
  IUpdateUserGroupGQLResponse,
  SearchUserGroupMembersByTenantIdGQL,
  UpdateUserGroupGQL,
} from '../../../graphql';
import {
  DynamicFormControlService,
  DynamicFormError,
  TextBoxFormField,
} from '@detective.solutions/frontend/shared/dynamic-form';
import {
  EMPTY,
  Observable,
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { IUserGroup, UserGroupMember } from '@detective.solutions/shared/data-access';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';
import { FormControl } from '@angular/forms';

import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { QueryRef } from 'apollo-angular';
import { UserGroupDTO } from '@detective.solutions/frontend/shared/data-access';
import { buildSearchTermRegEx } from '@detective.solutions/frontend/shared/utils';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'user-groups-add-edit-dialog',
  styleUrls: ['user-groups-add-edit-dialog.component.scss'],
  templateUrl: 'user-groups-add-edit-dialog.component.html',
})
export class UserGroupsAddEditDialogComponent implements OnInit, OnDestroy {
  addUserGroupFormFields!: TextBoxFormField[];
  editUserGroupFormFields!: TextBoxFormField[];

  membersTableDataSource: { id: string; username: string }[] = [];

  readonly memberSearchFormControl = new FormControl<string>('', { nonNullable: true });
  readonly isAddDialog = !this.dialogInputData.userGroup?.id;
  readonly userGroupMembersTableColumnsSchema = [
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
  readonly displayedColumns = this.userGroupMembersTableColumnsSchema.map(
    (col: { key: string; type: string; label: string }) => col.key
  );

  readonly isLoading$ = new Subject<boolean>();
  readonly proposedNewMembers$ = this.memberSearchFormControl.valueChanges.pipe(
    debounceTime(400),
    distinctUntilChanged(),
    switchMap((searchTerm: string) => (searchTerm ? this.searchForPotentialNewMembers(searchTerm.trim()) : of([])))
  );

  private searchUsersNotAssociatedWithUserGroupWatchQuery!: QueryRef<Response>;

  private readonly userIdsToDelete: string[] = [];
  private readonly subscriptions = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogInputData: { userGroup: UserGroupDTO; searchQuery: QueryRef<Response> },
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope,
    private readonly authService: AuthService,
    private readonly createUserGroupGQL: CreateUserGroupGQL,
    private readonly dialogRef: MatDialogRef<UserGroupsAddEditDialogComponent>,
    private readonly dynamicFormControlService: DynamicFormControlService,
    private readonly logger: LogService,
    private readonly searchUserGroupMembersByTenantIdGQL: SearchUserGroupMembersByTenantIdGQL,
    private readonly translationService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly updateUserGroupGQL: UpdateUserGroupGQL
  ) {}

  ngOnInit() {
    if (this.isAddDialog) {
      this.addUserGroupFormFields = this.generateUserGroupFormFields();
    } else {
      this.editUserGroupFormFields = this.generateUserGroupFormFields(this.dialogInputData.userGroup);
      this.membersTableDataSource = this.dialogInputData.userGroup.members.map((member: UserGroupMember) => {
        return { id: member.id, username: `${member.firstname} ${member.lastname}` };
      });
    }
    this.subscriptions.add(this.dynamicFormControlService.formSubmit$.subscribe(() => this.submitUserGroup()));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  submitUserGroup() {
    const formGroup = this.dynamicFormControlService.currentFormGroup;
    if (!formGroup.valid) {
      return;
    }
    if (this.isAddDialog) {
      const now = new Date().toISOString();
      this.authService.authStatus$
        .pipe(
          switchMap((authStatus: IAuthStatus) =>
            this.createUserGroupGQL.mutate({
              userGroup: {
                xid: uuidv4(),
                name: formGroup.value.name,
                description: formGroup.value.description,
                members: this.membersTableDataSource.map((member: UserGroupMember) => {
                  return { xid: member.id };
                }),
                author: { xid: authStatus.userId },
                lastUpdated: now,
                tenant: { xid: authStatus.tenantId },
                lastUpdatedBy: { xid: authStatus.userId },
                created: now,
              },
            })
          )
        )
        .pipe(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filter((response: any) => response?.data),
          take(1),
          map(({ data }: { data: ICreateUserGroupGQLResponse }) => data),
          catchError((error: Error) => {
            this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
            return EMPTY;
          })
        )
        .subscribe((response: ICreateUserGroupGQLResponse) => this.handleResponse(response));
    } else {
      this.authService.authStatus$
        .pipe(
          switchMap((authStatus: IAuthStatus) =>
            this.updateUserGroupGQL.mutate({
              patch: {
                filter: {
                  xid: {
                    eq: this.dialogInputData.userGroup.id,
                  },
                },
                set: {
                  name: formGroup.value.name,
                  description: formGroup.value.description,
                  members: this.membersTableDataSource.map((member: UserGroupMember) => {
                    return { xid: member.id };
                  }),
                  lastUpdatedBy: {
                    xid: authStatus.userId,
                  },
                  lastUpdated: new Date().toISOString(),
                },
                remove: {
                  members: this.userIdsToDelete.map((userId: string) => {
                    return { xid: userId };
                  }),
                },
              },
            })
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          filter((response: any) => response?.data),
          take(1),
          map(({ data }: { data: IUpdateUserGroupGQLResponse }) => data),
          catchError((error: Error) => {
            this.handleError(DynamicFormError.FORM_SUBMIT_ERROR, error);
            return EMPTY;
          })
        )
        .subscribe((response: IUpdateUserGroupGQLResponse) => this.handleResponse(response));
    }
  }

  addUserGroupMemberRow(userGroupMember: UserGroupMember) {
    this.membersTableDataSource = [
      ...this.membersTableDataSource,
      { id: userGroupMember.id, username: `${userGroupMember.firstname} ${userGroupMember.lastname}` },
    ]; // Deep-copy array to force re-render
  }

  removeUserGroupMemberRow(userGroupMemberId: string) {
    // const userToDelete = this.membersTableDataSource.filter(
    //   (member: UserGroupMember) => member.id === userGroupMemberId
    // )[0];
    this.userIdsToDelete.push(userGroupMemberId);
    this.membersTableDataSource = this.membersTableDataSource.filter(
      (member: UserGroupMember) => member.id !== userGroupMemberId
    );
  }

  private searchForPotentialNewMembers(searchTerm: string): Observable<UserGroupMember[]> {
    return this.authService.authStatus$.pipe(
      switchMap((authStatus: IAuthStatus) => {
        const searchParameters = {
          tenantId: authStatus.tenantId,
          searchTerm: buildSearchTermRegEx(searchTerm),
        };
        if (!this.searchUsersNotAssociatedWithUserGroupWatchQuery) {
          this.searchUsersNotAssociatedWithUserGroupWatchQuery = this.searchUserGroupMembersByTenantIdGQL.watch(
            searchParameters,
            {
              notifyOnNetworkStatusChange: true,
            }
          );
          return this.searchUsersNotAssociatedWithUserGroupWatchQuery.valueChanges;
        } else {
          return this.searchUsersNotAssociatedWithUserGroupWatchQuery.refetch(searchParameters);
        }
      }),
      tap(({ loading }) => this.isLoading$.next(loading)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filter((response: any) => response?.data),
      map(({ data }: { data: ISearchUserGroupMembersByTenantIdGQLResponse }) => data.queryUser),
      map((potentialMembers: UserGroupMember[]) =>
        potentialMembers.filter(
          (potentialMember: UserGroupMember) =>
            !this.membersTableDataSource.some(
              (displayedMember: UserGroupMember) => potentialMember.id === displayedMember.id
            )
        )
      )
    );
  }

  private getTranslation(path: string) {
    let translatedWord = '';
    this.translationService
      .selectTranslate(path, {}, this.translationScope)
      .pipe(take(1))
      .subscribe((translation: string) => {
        translatedWord = translation;
      });
    return translatedWord;
  }

  private generateUserGroupFormFields(userGroup?: IUserGroup): TextBoxFormField[] {
    return [
      new TextBoxFormField({
        key: 'name',
        label: this.getTranslation('userGroups.addEditDialog.displayNameTitle'),
        value: userGroup?.name ?? '',
        required: true,
      }),
      new TextBoxFormField({
        key: 'description',
        label: this.getTranslation('userGroups.addEditDialog.displayNameDescription'),
        value: userGroup?.description ?? '',
      }),
    ];
  }

  private handleResponse(response: IUpdateUserGroupGQLResponse | ICreateUserGroupGQLResponse) {
    this.isLoading$.next(false);
    if (!Object.keys(response).includes('error')) {
      this.translationService
        .selectTranslate('userGroups.toastMessages.actionSuccessful', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => {
          this.toastService.showToast(translation, '', ToastType.INFO, { duration: 4000 });
          this.dialogRef.close();
        });
      this.dialogInputData.searchQuery.refetch();
    } else {
      this.logger.error('Group could not be edited');
      this.translationService
        .selectTranslate('userGroups.toastMessages.actionFailed', {}, this.translationScope)
        .pipe(take(1))
        .subscribe((translation: string) => this.toastService.showToast(translation, 'Close', ToastType.ERROR));
    }
  }

  private handleError(errorType: DynamicFormError, error: Error) {
    let translationKey;
    if (errorType === DynamicFormError.FORM_INIT_ERROR) {
      translationKey = 'userGroups.toastMessages.formInitError';
      this.logger.error('Encountered an error while fetching the form data');
    }
    if (errorType === DynamicFormError.FORM_SUBMIT_ERROR) {
      this.isLoading$.next(false);
      translationKey = 'userGroups.toastMessages.formSubmitError';
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
