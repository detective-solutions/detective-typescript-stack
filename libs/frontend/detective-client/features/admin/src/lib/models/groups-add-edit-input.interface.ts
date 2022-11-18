export interface UserGroupCreateInput {
  name: string;
  description: string;
  members: {
    xid: string;
  }[];
  xid?: string;
  author?: { xid: string };
  lastUpdated?: string;
  tenant?: { xid: string };
  lastUpdatedBy?: { xid: string };
  created?: string;
}

export interface UserGroupEditInput {
  xid: string;
  name: string;
  description: string;
  members: {
    xid: string;
  }[];
  toDeleteMembers: {
    xid: string;
  }[];
  lastUpdated?: string;
  lastUpdatedBy?: {
    xid: string;
  };
}
