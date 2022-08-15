import { ITable } from './table.interface';
import { IUser } from '../user';

export interface ITableOccurrence {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  lastUpdatedBy: IUser;
  lastUpdated: string;
  created: string;
  entity: Partial<ITable>;
}
