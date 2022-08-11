import { IUser } from '../user';

export interface ITableOccurrence {
  id: string;
  name: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  lastUpdatedBy: IUser;
  lastUpdated: Date;
  created: Date;
}
