import { UserRole } from '@detective.solutions/shared/data-access';

export interface IAuthStatus {
  isAuthenticated: boolean;
  userRole: UserRole;
  userId: string;
}

export const defaultAuthStatus: IAuthStatus = {
  isAuthenticated: false,
  userRole: UserRole.NONE,
  userId: '',
};
