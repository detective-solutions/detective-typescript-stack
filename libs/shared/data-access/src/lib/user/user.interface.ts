import { ITenant } from './tenant.interface';
import { IUserGroup } from './user-group.interface';

export interface IUser {
  id: string;
  email: string;
  tenantIds?: ITenant[];
  role?: UserRole;
  firstname?: string;
  lastname?: string;
  title?: string;
  avatarUrl?: string;
  userGroups?: IUserGroup[];
  refreshTokenId?: string;
}

export enum UserRole {
  NONE = 'none',
  BASIC = 'basic',
  ADMIN = 'admin',
}
