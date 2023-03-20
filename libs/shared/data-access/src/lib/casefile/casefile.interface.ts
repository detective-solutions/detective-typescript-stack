import { IDisplayOccurrence } from '../display';
import { IEmbedding } from '../embedding';
import { ITableOccurrence } from '../table';
import { IUser } from '../user';
import { IUserQueryOccurrence } from '../user-query';

export interface ICasefile {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  tables: ITableOccurrence[];
  queries: IUserQueryOccurrence[];
  displays: IDisplayOccurrence[];
  embeddings: IEmbedding[];
  views: number;
  author: Partial<IUser>;
  editors: Partial<IUser>[];
  lastUpdatedBy: Partial<IUser>;
  lastUpdated: string;
  created: string;
}
