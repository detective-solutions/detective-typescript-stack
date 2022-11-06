// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserGroup {
  xid?: string;
  name?: string;
  description?: string;
  members?: {
    count: number;
  };
  lastUpdated?: string;
  tenant?: {
    xid: string;
  };
}
