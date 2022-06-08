import { DataSource } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllConnectionsResponse {
  dataSources: DataSource[];
  totalElementsCount: number;
}
