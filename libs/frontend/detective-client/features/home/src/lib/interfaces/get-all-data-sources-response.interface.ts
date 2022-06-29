import { SourceConnection } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllDataSourcesResponse {
  dataSources: SourceConnection[];
  totalElementsCount: number;
}
