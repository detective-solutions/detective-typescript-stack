export type Message<T> = {
  context: MessageContext;
  body: T;
};

type MessageContext = {
  tenantId: string;
  casefileId: string;
  userId: string;
  userRole: string;
  nodeId: string;
  timestamp: string;
};

export type QueryMessage = {
  query: string;
  queryType: string;
  followEvent: QueryMessage;
};
