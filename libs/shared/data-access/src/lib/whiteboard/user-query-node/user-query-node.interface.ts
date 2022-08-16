import { IUserQueryOccurrence } from '../../user-query';

/* eslint-disable @typescript-eslint/no-empty-interface */

export interface IUserQueryNode extends IUserQueryOccurrence {
  title: string;
  temporary?: IUserQueryNodeTemporaryData;
}

export interface IUserQueryNodeTemporaryData {}
