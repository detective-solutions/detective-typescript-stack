import { DataSource } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllDataSourcesResponse {
  dataSources: DataSource[];
  totalElementsCount: number;
}
