export interface IMessageContext {
  eventType: string;
  tenantId: string;
  casefileId: string;
  userId: string;
  userRole: string;
  nodeId: string;
  timestamp: number;
}
