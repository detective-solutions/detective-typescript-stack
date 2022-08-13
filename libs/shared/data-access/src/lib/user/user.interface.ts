import { ITenant } from '../tenant';
import { IUserGroup } from '../user-group';
import { UserRole } from './user-role.enum';

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
  lastUpdatedBy?: IUser;
  lastUpdated?: string;
  created?: string;
}
