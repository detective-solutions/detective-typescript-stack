import { SourceConnectionDTO } from '@detective.solutions/frontend/shared/data-access';

export interface IGetAllConnectionsResponse {
  connections: SourceConnectionDTO[];
  totalElementsCount: number;
}
