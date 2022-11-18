import { IUserWithXid } from '../user/user.interface';
export interface IUserGroupColumn {
  name: string;
}
export interface IMask {
  xid?: string;
  columnName?: string;
  valueName?: string;
  visible?: boolean;
  replaceType?: string;
  customReplaceValue?: string;
  author?: IUserWithXid;
  editors?: [IUserWithXid];
  lastUpdatedBy?: IUserWithXid;
  lastUpdated?: string;
  created?: string;
}

export interface IMasking {
  xid: string;
  name: string;
  tenant: {
    xid: string;
  };
  description: string;
  table: {
    xid: string;
    name: string;
    dataSource: {
      xid: string;
      name: string;
    };
  };
  groups?: { xid: string; name: string }[];
  columns?: IMask[];
  rows?: IMask[];
  author?: IUserWithXid;
  editors?: [IUserWithXid];
  lastUpdatedBy?: IUserWithXid;
  lastUpdated?: string;
  created?: string;
}
