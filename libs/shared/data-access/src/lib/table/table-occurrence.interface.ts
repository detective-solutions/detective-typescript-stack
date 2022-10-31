import { ITable } from './table.interface';

export interface ITableOccurrence {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  lastUpdatedBy: string;
  lastUpdated: string;
  created: string;
  entity: Partial<ITable>;
}
