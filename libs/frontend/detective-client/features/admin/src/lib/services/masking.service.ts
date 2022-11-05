import {
  DeleteColumnMaskGQL,
  DeleteMaskingGQL,
  DeleteRowMaskGQL,
  GetAllMaskingsGQL,
  IGetAllMaskingsGQLResponse,
  UpdateMaskingGQL,
} from '../graphql';
import { DropDownValuesDTO, MaskingDTO } from '@detective.solutions/frontend/shared/data-access';
import { GetAllUserGroupsGQL, IGetUserGroupsGQLResponse } from '../graphql/get-all-user-groups.gql';
import { GetMaskingByIdGQL, IGetMaskingByIdGQLResponse } from '../graphql/get-masking-by-id.gql';
import { IDropDownValues, IJwtTokenPayload, IMasking, Mask } from '@detective.solutions/shared/data-access';
import { IGetAllMaskingsResponse, IMaskSubTableDataDef, MaskingCreate, MaskingDelete, MaskingUpdate } from '../models';
import { LogService, transformError } from '@detective.solutions/frontend/shared/error-handling';
import { MutationResult, QueryRef } from 'apollo-angular';
import { Observable, catchError, map } from 'rxjs';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { CreateNewMaskingGQL } from '../graphql/create-new-masking.gql';
import { GetAllColumnsGQL } from '../graphql/get-all-columns-by-table-id.gql';
import { IGetAllColumnsResponse } from '../models/get-all-columns-by-table-id-response.interface';
import { Injectable } from '@angular/core';
import { TableCellEventService } from '@detective.solutions/frontend/detective-client/ui';
import jwtDecode from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class MaskingService {
  private getMaskingByIdWatchQuery!: QueryRef<Response>;
  private getAllMaskingWatchQuery!: QueryRef<Response>;
  private getUserGroupsWatchQuery!: QueryRef<Response>;
  private getColumnsByTableIdWatchQuery!: QueryRef<Response>;

  ROW_MASK_NAME = 'row';
  COLUMN_MASK_NAME = 'column';

  constructor(
    private readonly getMaskingByIdGQL: GetMaskingByIdGQL,
    private readonly updateMaskingGQL: UpdateMaskingGQL,
    private readonly deleteMaskingGQL: DeleteMaskingGQL,
    private readonly deleteRowMaskGQL: DeleteRowMaskGQL,
    private readonly deleteColumnMaskGQL: DeleteColumnMaskGQL,
    private readonly getAllMaskingGQL: GetAllMaskingsGQL,
    private readonly getUserGroupsGQL: GetAllUserGroupsGQL,
    private readonly getColumnsByTableIdGQL: GetAllColumnsGQL,
    private readonly createNewMaskingGQL: CreateNewMaskingGQL,
    private readonly tableCellEventService: TableCellEventService,
    private readonly authService: AuthService,
    private readonly logger: LogService
  ) {}

  getMaskingById(xid: string): Observable<IMasking> {
    this.getMaskingByIdWatchQuery = this.getMaskingByIdGQL.watch({ xid: xid });
    return this.getMaskingByIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetMaskingByIdGQLResponse) => response.getMasking)
    );
  }

  getAllMaskings(paginationOffset: number, pageSize: number): Observable<IGetAllMaskingsResponse> {
    if (!this.getAllMaskingWatchQuery) {
      this.getAllMaskingWatchQuery = this.getAllMaskingGQL.watch(
        {
          paginationOffset: paginationOffset,
          pageSize: pageSize,
        },
        { pollInterval: 10000 }
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
          paginationOffset: 0,
          pageSize: 10000,
        },
        { pollInterval: 10000 }
      );
    }

    return this.getUserGroupsWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetUserGroupsGQLResponse) => {
        return response.queryUserGroup.map(DropDownValuesDTO.Build);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  refreshMaskings() {
    const currentResult = this.getAllMaskingWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedMaskingCount = (currentResult as IGetAllMaskingsGQLResponse)?.queryMasking?.length;
    if (alreadyLoadedMaskingCount) {
      this.getAllMaskingWatchQuery.refetch({ paginationOffset: 0, pageSize: alreadyLoadedMaskingCount });
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
    if (stringBool == 'true') {
      return true;
    } else {
      return false;
    }
  }

  getMaskAuthor(): string {
    const stringToken: string = this.authService.getAccessToken();
    const objectToken: IJwtTokenPayload = jwtDecode(stringToken);
    return objectToken.sub;
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

      // TODO: check if required
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

  updateMasking(update: MaskingUpdate): boolean {
    let isDone = false;
    const user = this.getMaskAuthor();
    const date = new Date().toISOString();

    const filteredColumns = update.masks.filter((u) => u.filterType === this.COLUMN_MASK_NAME);
    const filteredRows = update.masks.filter((u) => u.filterType === this.ROW_MASK_NAME);

    const columns = filteredColumns.map((x: any) => {
      return this.getColumnMaskObject(x, user, date);
    });

    const rows = filteredRows.map((x: any) => {
      return this.getRowMaskObject(x, user, date);
    });

    this.updateMaskingGQL
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
      .subscribe(() => {
        const columnMaskIDToDelete = update.toDelete.columns.map((col) => col.xid);
        this.deleteColumnOrRowMask(columnMaskIDToDelete, this.COLUMN_MASK_NAME);

        const rowMaskIDToDelete = update.toDelete.rows.map((row) => row.xid);
        this.deleteColumnOrRowMask(rowMaskIDToDelete, this.ROW_MASK_NAME);

        isDone = true;
      });

    return isDone;
  }

  deleteColumnOrRowMask(toDelete: string[], maskType: string = this.COLUMN_MASK_NAME) {
    const filter = {
      filter: {
        xid: {
          in: toDelete,
        },
      },
    };

    if (toDelete.length > 0) {
      switch (maskType) {
        case this.COLUMN_MASK_NAME:
          this.deleteColumnMaskGQL.mutate(filter);
          break;
        case this.ROW_MASK_NAME:
          this.deleteRowMaskGQL.mutate(filter);
          break;
        case '':
          break;
      }
    }
  }

  deleteMasking(set: MaskingDelete): Observable<MutationResult<Response>> {
    this.deleteColumnOrRowMask(set.rows, this.ROW_MASK_NAME);
    this.deleteColumnOrRowMask(set.columns, this.COLUMN_MASK_NAME);

    return this.deleteMaskingGQL.mutate({
      filter: {
        xid: {
          eq: set.masking,
        },
      },
    });
  }

  createMasksFromCurrentData(payload: MaskingCreate): boolean {
    let isDone = false;
    const columnMasks: Mask[] = [];
    const rowMasks: Mask[] = [];
    const user = this.getMaskAuthor();
    const date = new Date().toISOString();

    payload.masks.forEach((obj: IMaskSubTableDataDef) => {
      switch (obj.filterType) {
        case this.ROW_MASK_NAME:
          rowMasks.push(this.getRowMaskObject(obj, user, date));
          break;
        case this.COLUMN_MASK_NAME:
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

    this.createNewMaskingGQL
      .mutate({
        masking: masking,
      })
      .subscribe(() => (isDone = true));

    return isDone;
  }

  private handleError(error: string) {
    this.tableCellEventService.resetLoadingStates$.next(true);
    return transformError(error);
  }
}
