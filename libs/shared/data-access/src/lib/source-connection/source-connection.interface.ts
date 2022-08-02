import { SourceConnectionStatus } from './source-connection-status.enum';

export interface ISourceConnection {
  xid: string;
  name: string;
  connectorName: string;
  description?: string;
  iconSrc?: string;
  lastUpdated?: Date | null | string;
  status: SourceConnectionStatus;
}
