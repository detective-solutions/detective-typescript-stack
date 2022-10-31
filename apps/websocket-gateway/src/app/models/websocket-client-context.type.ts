import { UserRole } from '@detective.solutions/shared/data-access';

export type WebSocketClientContext = {
  tenantId: string;
  casefileId: string;
  userId: string;
  userRole: UserRole;
};
