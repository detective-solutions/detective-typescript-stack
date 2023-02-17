import {
  DeleteColumnMaskGQL,
  DeleteRowMaskGQL,
  GetAllMaskingsGQL,
  ICreateNewMaskingGQLResponse,
  IDeleteColumnMaskGQLResponse,
  IDeleteRowMaskGQLResponse,
  IGetAllMaskingsGQLResponse,
  IUpdateMaskingGQLResponse,
  UpdateMaskingGQL,
} from '../graphql';
import { GetMaskingByIdGQL, IGetMaskingByIdGQLResponse } from '../graphql/get-masking-by-id.gql';
import { IMask, IMasking } from '@detective.solutions/shared/data-access';
import { IMaskSubTableDataDef, IMaskingCreateInput, IMaskingUpdateInput } from '../models';
import { Observable, map } from 'rxjs';

import { CreateNewMaskingGQL } from '../graphql/create-new-masking.gql';
import { Injectable } from '@angular/core';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { QueryRef } from 'apollo-angular';
import { UsersService } from './users.service';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class MaskingService {
  public static ROW_MASK_NAME = 'row';
  public static COLUMN_MASK_NAME = 'column';

  private getMaskingByIdWatchQuery!: QueryRef<Response>;
  private getAllMaskingWatchQuery!: QueryRef<Response>;

  constructor(
    private readonly getMaskingByIdGQL: GetMaskingByIdGQL,
    private readonly updateMaskingGQL: UpdateMaskingGQL,
    private readonly deleteRowMaskGQL: DeleteRowMaskGQL,
    private readonly deleteColumnMaskGQL: DeleteColumnMaskGQL,
    private readonly getAllMaskingGQL: GetAllMaskingsGQL,
    private readonly createNewMaskingGQL: CreateNewMaskingGQL,
    private readonly userService: UsersService,
    private readonly logger: LogService
  ) {}

  getMaskingById(maskingId: string): Observable<IMasking> {
    this.getMaskingByIdWatchQuery = this.getMaskingByIdGQL.watch({ id: maskingId }, { fetchPolicy: 'network-only' });
    return this.getMaskingByIdWatchQuery.valueChanges.pipe(
      map((response: any) => response.data),
      map((response: IGetMaskingByIdGQLResponse) => response.getMasking)
    );
  }

  refreshMaskings() {
    const currentResult = this.getAllMaskingWatchQuery.getCurrentResult()?.data as any;
    const alreadyLoadedMaskingCount = (currentResult as IGetAllMaskingsGQLResponse)?.queryMasking?.length;
    if (alreadyLoadedMaskingCount) {
      this.getAllMaskingWatchQuery.refetch({
        id: this.userService.getTenant(),
        paginationOffset: 0,
        pageSize: alreadyLoadedMaskingCount,
      });
    } else {
      this.logger.error('Could not determine currently loaded masking count. Reusing values of last query...');
      this.getAllMaskingWatchQuery.refetch();
    }
  }

  getBooleanFromString(stringBool: string): boolean {
    return stringBool === 'true' ? true : false;
  }

  getRowMaskObject(mask: any, userId: string, date: string) {
    return {
      id: mask.id,
      columnName: mask.columnName,
      valueName: mask.valueName,
      visible: this.getBooleanFromString(mask.visible),
      replaceType: mask.replaceType,
      customReplaceValue: mask.customReplaceType,
      author: { id: userId },
      lastUpdatedBy: { id: userId },
      lastUpdated: date,
      created: date,
    };
  }

  getColumnMaskObject(mask: any, userId: string, date: string) {
    return {
      id: mask.id,
      columnName: mask.columnName,
      visible: this.getBooleanFromString(mask.visible),
      replaceType: mask.replaceType,
      author: { id: userId },
      lastUpdatedBy: { id: userId },
      lastUpdated: date,
      created: date,
    };
  }

  updateMasking(update: IMaskingUpdateInput): Observable<IUpdateMaskingGQLResponse> {
    const userId = this.userService.getAuthor();
    const date = new Date().toISOString();

    const filteredColumns = update.masks.filter(
      (mask: IMaskSubTableDataDef) => mask.filterType === MaskingService.COLUMN_MASK_NAME
    );
    const filteredRows = update.masks.filter(
      (mask: IMaskSubTableDataDef) => mask.filterType === MaskingService.ROW_MASK_NAME
    );

    const columns = filteredColumns.map((mask: IMaskSubTableDataDef) => {
      return this.getColumnMaskObject(mask, userId, date);
    });

    const rows = filteredRows.map((mask: IMaskSubTableDataDef) => {
      return this.getRowMaskObject(mask, userId, date);
    });

    return this.updateMaskingGQL
      .mutate(
        {
          patch: {
            filter: {
              xid: {
                eq: update.masking.id,
              },
            },
            set: {
              name: update.masking.name,
              description: update.masking.description,
              columns: columns,
              rows: rows,
              lastUpdatedBy: {
                xid: userId,
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
            { query: this.getMaskingByIdGQL.document, variables: { id: update.masking.id } },
            { query: this.getAllMaskingGQL.document, variables: { paginationOffset: 0, pageSize: 100 } },
          ],
        }
      )
      .pipe(
        map((response: any) => response.data),
        map((response: IUpdateMaskingGQLResponse) => {
          if (!Object.keys(response).includes('error')) {
            if (update.toDelete.columns) {
              const columnMaskIDToDelete = update.toDelete.columns.map((col) => col.id);
              this.deleteColumnOrRowMask(columnMaskIDToDelete, MaskingService.COLUMN_MASK_NAME);
            }
            if (update.toDelete.rows) {
              const rowMaskIDToDelete = update.toDelete.rows.map((row) => row.id);
              this.deleteColumnOrRowMask(rowMaskIDToDelete, MaskingService.ROW_MASK_NAME);
            }
          } else {
            console.log('No deletion on mask level', Object.keys(response));
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

    masking.id = uuidv4();
    masking.author = { id: user };
    masking.lastUpdated = date;
    masking.lastUpdatedBy = { id: user };
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
}
