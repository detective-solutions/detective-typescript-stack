import { ITenant } from '../tenant';
import { IUser } from '../user';
import { IUserGroup } from '../user-group';

export interface IMask {
  id: string;
  columnName?: string;
  valueName?: string;
  visible?: boolean;
  replaceType?: string;
  customReplaceValue?: string;
  author?: Partial<IUser>;
  editors?: Partial<IUser>[];
  lastUpdatedBy?: Partial<IUser>;
  lastUpdated?: string;
  created?: string;
}

export interface IMasking {
  id: string;
  name: string;
  tenant: Pick<ITenant, 'id'>;
  description: string;
  table: {
    id: string;
    name: string;
    dataSource: {
      id: string;
      name: string;
    };
  };
  groups?: Partial<IUserGroup>[] | undefined;
  columns?: IMask[];
  rows?: IMask[];
  author?: Partial<IUser>;
  editors?: Partial<IUser>[];
  lastUpdatedBy?: Partial<IUser>;
  lastUpdated?: string;
  created?: string;
}
