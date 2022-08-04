import { MessageEventType } from '@detective.solutions/shared/data-access';

export const EventTypeTopicMapping = {
  loadWhiteboardData: { eventType: MessageEventType.LoadWhiteboardData, targetTopic: 'transaction_input' },
  queryTable: { eventType: MessageEventType.QueryTable, targetTopic: 'masking' },
};
