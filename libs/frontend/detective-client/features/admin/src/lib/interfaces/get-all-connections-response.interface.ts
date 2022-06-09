import { DataSource } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllConnectionsResponse {
  connections: DataSource[];
  totalElementsCount: number;
}
