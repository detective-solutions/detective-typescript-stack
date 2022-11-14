import { IColumn } from '@detective.solutions/shared/data-access';

export interface IGetAllColumnsResponse {
  queryColumnDefinition: IColumn[];
}
