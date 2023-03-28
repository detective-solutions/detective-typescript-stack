import { UserGroupMember } from './user-group-member.type';

export interface IUserGroup {
  id: string;
  name?: string;
  description?: string;
  memberCount?: { count: number };
  members?: UserGroupMember[];
  lastUpdated?: string;
}
