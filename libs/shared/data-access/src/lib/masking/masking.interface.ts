export interface UserGroupColumn {
  name: string;
}

export interface IMasking {
  xid: string;
  name: string;
  description: string;
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
