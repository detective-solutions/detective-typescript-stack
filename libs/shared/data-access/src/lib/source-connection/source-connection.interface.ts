import { ITable } from '../table';
import { SourceConnectionStatus } from './source-connection-status.enum';

export interface ISourceConnection {
  xid: string;
  name: string;
  description?: string;
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  database?: string;
  databaseSchema?: string;
  connectorName: string;
  connectedTables?: ITable[];
  lastUpdated: string;
  status: SourceConnectionStatus;
  iconSrc?: string;
}
