import { IUser } from '../user';

export interface IEmbedding {
  id: string;
  title: string;
  href: string;
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
