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
  author: IUser;
  editors: IUser[];
  lastUpdatedBy: IUser;
  lastUpdated: string;
  created: string;
  entity: IUserQuery;
}
