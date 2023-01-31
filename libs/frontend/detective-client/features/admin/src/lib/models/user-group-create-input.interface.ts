export interface IUserGroupCreateInput {
  id?: string;
  name: string;
  description: string;
  members: {
    id: string;
  }[];
  author?: { id: string };
  lastUpdated?: string;
  tenant?: { id: string };
  lastUpdatedBy?: { id: string };
  created?: string;
}
