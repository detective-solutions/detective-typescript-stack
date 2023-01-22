export interface IMember {
  id: string;
  firstname: string;
  lastname: string;
}

export interface IUserGroup {
  id: string;
  name?: string;
  description?: string;
  members?: IMember[];
  memberCount?: {
    count: number;
  };
  lastUpdated?: string;
  tenant?: {
    id: string;
  };
}
