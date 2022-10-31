import { IUser } from '../user';
import { IUserQuery } from './user-query.interface';

export interface IUserQueryOccurrence {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked: boolean;
  author: string;
  editors: IUser[];
  lastUpdatedBy: string;
  lastUpdated: string;
  created: string;
  entity: IUserQuery;
}
