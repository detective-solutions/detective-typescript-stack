import { IMessageContext } from '@detective.solutions/shared/data-access';

export function buildLogContext(context: IMessageContext): string {
  return `(Tenant: ${context.tenantId} - Casefile: ${context.casefileId} - Node: ${context.nodeId} - User: ${context.userId})`;
}
