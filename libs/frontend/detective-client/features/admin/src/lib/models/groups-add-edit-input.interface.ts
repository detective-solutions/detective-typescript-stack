export interface UserGroupCreateInput {
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

export interface UserGroupEditInput {
  id: string;
  name: string;
  description: string;
  members: {
    id: string;
  }[];
  toDeleteMembers: {
    id: string;
  }[];
  lastUpdated?: string;
  lastUpdatedBy?: {
    id: string;
  };
}
