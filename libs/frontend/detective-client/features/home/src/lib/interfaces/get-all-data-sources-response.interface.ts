import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllDataSourcesResponse {
  dataSources: SourceConnectionDTO[];
  totalElementsCount: number;
}
