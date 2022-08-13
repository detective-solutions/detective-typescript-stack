import { IUser } from '../user';

export interface IUserQueryOccurrence {
  id: string;
  code: string;
  title: string;
  utterance: string;
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
}
