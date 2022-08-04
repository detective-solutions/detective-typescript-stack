import { MessageEventType } from './message-event-type.enum';

export interface IMessageContext {
  eventType: MessageEventType;
  tenantId: string;
  casefileId: string;
  userId: string;
  userRole: string;
  nodeId?: string;
  timestamp: number;
}
