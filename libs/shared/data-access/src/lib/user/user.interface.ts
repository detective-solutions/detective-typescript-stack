import { IUserGroup } from './user-group.interface';

export interface IUser {
  email: string;
  password?: string;
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
}
