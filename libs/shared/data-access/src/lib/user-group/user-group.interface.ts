// eslint-disable-next-line @typescript-eslint/no-empty-interface

export interface IMember {
  xid: string;
  firstname: string;
  lastname: string;
}

export interface IUserGroup {
  xid?: string;
  name?: string;
  description?: string;
  members?: IMember[];
  memberCount?: {
    count: number;
  };
  lastUpdated?: string;
  tenant?: {
    xid: string;
  };
}
