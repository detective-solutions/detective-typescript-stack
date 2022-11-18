import {
  DeleteColumnMaskGQL,
  DeleteMaskingGQL,
  DeleteRowMaskGQL,
  GetAllMaskingsGQL,
  GetAllUserGroupsAsDropDownValuesGQL,
  ICreateNewMaskingGQLResponse,
  IDeleteColumnMaskGQLResponse,
  IDeleteMaskingGQLResponse,
  IDeleteRowMaskGQLResponse,
  IGetAllMaskingsGQLResponse,
  IGetUserGroupsAsDropDownValuesGQLResponse,
  IUpdateMaskingGQLResponse,
  UpdateMaskingGQL,
} from '../graphql';
import { GetMaskingByIdGQL, IGetMaskingByIdGQLResponse } from '../graphql/get-masking-by-id.gql';
import { IDropDownValues, IMask, IMasking } from '@detective.solutions/shared/data-access';
import {
  IGetAllMaskingsResponse,
  IMaskSubTableDataDef,
  IMaskingCreateInput,
  IMaskingDeleteInput,
  IMaskingUpdateInput,
} from '../models';
import { LogService, transformError } from '@detective.solutions/frontend/shared/error-handling';
import { Observable, catchError, map } from 'rxjs';

import { CreateNewMaskingGQL } from '../graphql/create-new-masking.gql';
import { GetAllColumnsGQL } from '../graphql/get-all-columns-by-table-id.gql';
import { IGetAllColumnsResponse } from '../models/get-all-columns-by-table-id-response.interface';
import { Injectable } from '@angular/core';
import { MaskingDTO } from '@detective.solutions/frontend/shared/data-access';
import { QueryRef } from 'apollo-angular';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import { UsersService } from './user.service';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class MaskingService {
  public static ROW_MASK_NAME = 'row';
  public static COLUMN_MASK_NAME = 'column';

  private getMaskingByIdWatchQuery!: QueryRef<Response>;
  private getAllMaskingWatchQuery!: QueryRef<Response>;
  private getUserGroupsWatchQuery!: QueryRef<Response>;
  private getColumnsByTableIdWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getMaskingByIdGQL: GetMaskingByIdGQL,
    private readonly updateMaskingGQL: UpdateMaskingGQL,
    private readonly deleteMaskingGQL: DeleteMaskingGQL,
    private readonly deleteRowMaskGQL: DeleteRowMaskGQL,
    private readonly deleteColumnMaskGQL: DeleteColumnMaskGQL,
    private readonly getAllMaskingGQL: GetAllMaskingsGQL,
    private readonly getUserGroupsGQL: GetAllUserGroupsAsDropDownValuesGQL,
    private readonly getColumnsByTableIdGQL: GetAllColumnsGQL,
    private readonly createNewMaskingGQL: CreateNewMaskingGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly userService: UsersService,
    private readonly logger: LogService
  ) {}

  getMaskingById(xid: string): Observable<IMasking> {
    this.getMaskingByIdWatchQuery = this.getMaskingByIdGQL.watch({ xid: xid }, { fetchPolicy: 'network-only' });
    return this.getMaskingByIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetMaskingByIdGQLResponse) => response.getMasking)
    );
  }

  getAllMaskings(paginationOffset: number, pageSize: number): Observable<IGetAllMaskingsResponse> {
    if (!this.getAllMaskingWatchQuery) {
      this.getAllMaskingWatchQuery = this.getAllMaskingGQL.watch(
        {
          xid: this.userService.getTenant(),
          paginationOffset: paginationOffset,
          pageSize: pageSize,
        },
        { pollInterval: 1000 }
      );
    }

    return this.getAllMaskingWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetAllMaskingsGQLResponse) => {
        return {
          maskings: response.queryMasking.map(MaskingDTO.Build),
          totalElementsCount: response.aggregateMasking.count,
        };
      }),
      catchError((error) => this.handleError(error))
    );
  }

  getColumnsByTableId(xid: string): Observable<IGetAllColumnsResponse> {
    this.getColumnsByTableIdWatchQuery = this.getColumnsByTableIdGQL.watch({ xid: xid });
    return this.getColumnsByTableIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetAllColumnsResponse) => response)
    );
  }

  getAvailableUserGroups(): Observable<IDropDownValues[]> {
    if (!this.getUserGroupsWatchQuery) {
      this.getUserGroupsWatchQuery = this.getUserGroupsGQL.watch(
        {
          xid: this.userService.getTenant(),
          paginationOffset: 0,
          pageSize: 1000,
        },
        { pollInterval: 1000 }
      );
    }

    return this.getUserGroupsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUserGroupsAsDropDownValuesGQLResponse) => response.queryUserGroup),
      catchError((error) => this.handleError(error))
    );
  }

  refreshMaskings() {
    const currentResult = this.getAllMaskingWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedMaskingCount = (currentResult as IGetAllMaskingsGQLResponse)?.queryMasking?.length;
    if (alreadyLoadedMaskingCount) {
      this.getAllMaskingWatchQuery.refetch({
        xid: this.userService.getTenant(),
        paginationOffset: 0,
        pageSize: alreadyLoadedMaskingCount,
      });
    } else {
      this.logger.error('Could not determine currently loaded masking count. Reusing values of last query...');
      this.getAllMaskingWatchQuery.refetch();
    }
  }

  getAllMaskingsNextPage(paginationOffset: number, pageSize: number) {
    this.getAllMaskingWatchQuery
      .fetchMore({
        variables: { paginationOffset: paginationOffset, pageSize: pageSize },
      })
      .catch((error) => this.handleError(error));
  }

  getBooleanFromString(stringBool: string): boolean {
    return stringBool === 'true' ? true : false;
  }

  getRowMaskObject(mask: any, user: string, date: string) {
    return {
      xid: mask.id,
      columnName: mask.columnName,
      valueName: mask.valueName,
      visible: this.getBooleanFromString(mask.visible),
      replaceType: mask.replaceType,
      customReplaceValue: mask.customReplaceType,
      author: { xid: user },
      lastUpdatedBy: { xid: user },
      lastUpdated: date,
      created: date,
    };
  }

  getColumnMaskObject(mask: any, user: string, date: string) {
    return {
      xid: mask.id,
      columnName: mask.columnName,
      visible: this.getBooleanFromString(mask.visible),
      replaceType: mask.replaceType,
      author: { xid: user },
      lastUpdatedBy: { xid: user },
      lastUpdated: date,
      created: date,
    };
  }

  updateMasking(update: IMaskingUpdateInput): Observable<IUpdateMaskingGQLResponse> {
    const user = this.userService.getAuthor();
    const date = new Date().toISOString();

    const filteredColumns = update.masks.filter(
      (mask: IMaskSubTableDataDef) => mask.filterType === MaskingService.COLUMN_MASK_NAME
    );
    const filteredRows = update.masks.filter(
      (mask: IMaskSubTableDataDef) => mask.filterType === MaskingService.ROW_MASK_NAME
    );

    const columns = filteredColumns.map((mask: IMask) => {
      return this.getColumnMaskObject(mask, user, date);
    });

    const rows = filteredRows.map((mask: IMask) => {
      return this.getRowMaskObject(mask, user, date);
    });

    return this.updateMaskingGQL
      .mutate(
        {
          patch: {
            filter: {
              xid: {
                eq: update.masking.xid,
              },
            },
            set: {
              name: update.masking.name,
              description: update.masking.description,
              columns: columns,
              rows: rows,
              lastUpdatedBy: {
                xid: user,
              },
              lastUpdated: date,
            },
            remove: {
              columns: update.toDelete.columns,
              rows: update.toDelete.rows,
            },
          },
        },
        {
          refetchQueries: [
            { query: this.getMaskingByIdGQL.document, variables: { xid: update.masking.xid } },
            { query: this.getAllMaskingGQL.document, variables: { paginationOffset: 0, pageSize: 100 } },
          ],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: IUpdateMaskingGQLResponse) => {
          if (!Object.keys(response).includes('error')) {
            const columnMaskIDToDelete = update.toDelete.columns.map((col) => col.xid);
            this.deleteColumnOrRowMask(columnMaskIDToDelete, MaskingService.COLUMN_MASK_NAME);

            const rowMaskIDToDelete = update.toDelete.rows.map((row) => row.xid);
            this.deleteColumnOrRowMask(rowMaskIDToDelete, MaskingService.ROW_MASK_NAME);
          } else {
            console.log('no deletion on mask level', Object.keys(response));
          }
          return response;
        })
      );
  }

  deleteColumnOrRowMask(MasksToDelete: string[], maskType: string = MaskingService.COLUMN_MASK_NAME) {
    const filter = {
      filter: {
        xid: {
          in: MasksToDelete,
        },
      },
    };

    if (MasksToDelete.length > 0) {
      switch (maskType) {
        case MaskingService.COLUMN_MASK_NAME:
          this.deleteColumnMaskGQL.mutate(filter).pipe(
            map((response: any) => response.data),
            map((response: IDeleteColumnMaskGQLResponse) => {
              if (!Object.keys(response).includes('error')) {
                this.logger.error(`deletion for column masks ${MasksToDelete} completed`);
              } else {
                this.logger.error(`error for column mask deletion ${MasksToDelete}`);
              }
            })
          );
          break;
        case MaskingService.ROW_MASK_NAME:
          this.deleteRowMaskGQL.mutate(filter).pipe(
            map((response: any) => response.data),
            map((response: IDeleteRowMaskGQLResponse) => {
              if (!Object.keys(response).includes('error')) {
                this.logger.error(`deletion for row masks ${MasksToDelete} completed`);
              } else {
                this.logger.error(`error for row mask deletion ${MasksToDelete}`);
              }
            })
          );
          break;
        default:
          break;
      }
    }
  }

  deleteMasking(set: IMaskingDeleteInput): Observable<IDeleteMaskingGQLResponse> {
    return this.deleteMaskingGQL
      .mutate(
        {
          filter: {
            xid: {
              eq: set.masking,
            },
          },
          remove: {
            columns: set.columns,
            rows: set.rows,
          },
        },
        {
          refetchQueries: [
            { query: this.getAllMaskingGQL.document, variables: { paginationOffset: 0, pageSize: 100 } },
          ],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: IDeleteMaskingGQLResponse) => response)
      );
  }

  createMasksFromCurrentData(payload: IMaskingCreateInput): Observable<ICreateNewMaskingGQLResponse> {
    const columnMasks: IMask[] = [];
    const rowMasks: IMask[] = [];
    const user = this.userService.getAuthor();
    const date = new Date().toISOString();

    payload.masks.forEach((obj: IMaskSubTableDataDef) => {
      switch (obj.filterType) {
        case MaskingService.ROW_MASK_NAME:
          rowMasks.push(this.getRowMaskObject(obj, user, date));
          break;
        case MaskingService.COLUMN_MASK_NAME:
          columnMasks.push(this.getColumnMaskObject(obj, user, date));
          break;
        case '':
          console.log('skip: ', obj);
          break;
      }
    });

    const masking = payload.masking;

    masking.xid = uuidv4();
    masking.author = { xid: user };
    masking.lastUpdated = date;
    masking.lastUpdatedBy = { xid: user };
    masking.created = date;
    masking.columns = columnMasks;
    masking.rows = rowMasks;

    return this.createNewMaskingGQL
      .mutate(
        {
          masking: masking,
        },
        {
          refetchQueries: [
            { query: this.getAllMaskingGQL.document, variables: { paginationOffset: 0, pageSize: 100 } },
          ],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: ICreateNewMaskingGQLResponse) => response)
      );
  }

  private handleError(error: string) {
    this.tableCellEventService.resetLoadingStates$.next(true);
    return transformError(error);
  }
}
