import { SourceConnection } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllConnectionsResponse {
  connections: SourceConnection[];
  totalElementsCount: number;
}
