import { IMessageContext } from '@detective.solutions/shared/data-access';

export function buildLogContext(context: IMessageContext): string {
  return `${context?.tenantId}:${context?.casefileId}:${context?.nodeId}:${context?.eventType}:${context?.userId} -`;
}
