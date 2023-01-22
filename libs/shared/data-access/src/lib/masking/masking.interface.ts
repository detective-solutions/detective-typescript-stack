import { IUser } from '../user';

export interface IUserGroupColumn {
  name: string;
}
export interface IMask {
  id: string;
  columnName?: string;
  valueName?: string;
  visible?: boolean;
  replaceType?: string;
  customReplaceValue?: string;
  author?: string;
  editors?: IUser[];
  lastUpdatedBy: string;
  lastUpdated: string;
  created: string;
}

export interface IMasking {
  id: string;
  name: string;
  tenant: {
    id: string;
  };
  description: string;
  table: {
    id: string;
    name: string;
    dataSource: {
      id: string;
      name: string;
    };
  };
  groups?: { id: string; name: string }[];
  columns?: IMask[];
  rows?: IMask[];
  author?: string;
  editors?: IUser[];
  lastUpdatedBy?: string;
  lastUpdated?: string;
  created?: string;
}
