import { ITable } from '../table';
import { IUser } from '../user';

export interface IUserQuery {
  id: string;
  code: string;
  utterance: string;
  parent: ITable;
  author: IUser;
  editors: IUser[];
  lastUpdatedBy: IUser;
  lastUpdated: Date;
  created: Date;
}
