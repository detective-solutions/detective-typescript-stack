import { ITableOccurrence } from '../table';
import { SourceConnectionStatus } from './source-connection-status.enum';

export interface ISourceConnection {
  id: string;
  name: string;
  description?: string;
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  database?: string;
  databaseSchema?: string;
  connectorName: string;
  connectedTables?: ITableOccurrence[];
  lastUpdated: Date;
  status: SourceConnectionStatus;
  iconSrc?: string;
}
