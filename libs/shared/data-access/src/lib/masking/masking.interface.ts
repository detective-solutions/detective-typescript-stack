export interface UserGroupColumn {
  name: string;
}

export interface IMasking {
  xid: string;
  name: string;
  groups: UserGroupColumn[];
  table: {
    name: string;
    dataSource: {
      name: string;
    };
  };
  lastUpdatedBy: {
    firstname: string;
    lastname: string;
  };
  lastUpdated: string;
}
