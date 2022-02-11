import { IUserGroup } from './user-group.interface';

export interface IUser {
  id?: string;
  email: string;
  password?: string;
  tenantId?: string;
  role?: UserRole;
  firstname?: string;
  lastname?: string;
  title?: string;
  avatarUrl?: string;
  userGroups?: IUserGroup[];
}

export enum UserRole {
  NONE = 'none',
  BASIC = 'basic',
  ADMIN = 'admin',
}
