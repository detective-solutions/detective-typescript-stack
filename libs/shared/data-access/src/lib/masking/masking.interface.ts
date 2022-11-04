import { IUserWithXid } from '../user/user.interface';
export interface UserGroupColumn {
  name: string;
}
export interface Mask {
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
  description: string;
  table: {
    xid: string;
    name: string;
    dataSource: {
      xid: string;
      name: string;
    };
  };
  columns?: Mask[];
  rows?: Mask[];
  groups?: { xid: string; name: string }[];
  author?: IUserWithXid;
  editors?: [IUserWithXid];
  lastUpdatedBy?: IUserWithXid;
  lastUpdated?: string;
  created?: string;
}
