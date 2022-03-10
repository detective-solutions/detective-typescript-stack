import { UserRole } from '@detective.solutions/shared/data-access';

export interface IAuthStatus {
  isAuthenticated: boolean;
  userId: string;
  tenantId: string;
  userRole: UserRole;
}

export const defaultAuthStatus: IAuthStatus = {
  isAuthenticated: false,
  userId: '',
  tenantId: '',
  userRole: UserRole.NONE,
};
