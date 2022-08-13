import { IUser } from '../user';

export interface ITable {
  id: string;
  name: string;
  description?: string;
  lastUpdatedBy: IUser;
  lastUpdated: string;
  created: string;
}
