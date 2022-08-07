import { MessageEventType } from './message-event-type.enum';
import { UserRole } from '../user';

export interface IMessageContext {
  eventType: MessageEventType;
  tenantId: string;
  casefileId: string;
  userId: string;
  userRole: UserRole;
  nodeId?: string;
  timestamp: number;
}
