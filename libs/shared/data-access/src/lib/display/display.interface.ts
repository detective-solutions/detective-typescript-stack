import { IUser } from '../user';

export interface IDisplay {
  id: string;
  fileName: string;
  sourceType: string;
  pageCount: number;
  author: IUser;
  editors: IUser[];
  lastUpdatedBy: IUser;
  lastUpdated: string;
  created: string;
}
