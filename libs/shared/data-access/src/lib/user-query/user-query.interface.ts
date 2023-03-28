import { ITable } from '../table';

export interface IUserQuery {
  id: string;
  code: string;
  utterance: string;
  parent: ITable;
  author: string;
  editors: { id: string }[];
  lastUpdatedBy: string;
  lastUpdated: string;
  created: string;
}
