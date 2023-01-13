import { IEmbedding } from '../embedding';
import { ITableOccurrence } from '../table';
import { IUser } from '../user';
import { IUserQueryOccurrence } from '../user-query';

export interface ICasefile {
  xid: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tables: ITableOccurrence[];
  queries: IUserQueryOccurrence[];
  embeddings: IEmbedding[];
  views: number;
  author: IUser;
  editors: IUser[];
  lastUpdatedBy: IUser;
  lastUpdated: string;
  created: string;
}
