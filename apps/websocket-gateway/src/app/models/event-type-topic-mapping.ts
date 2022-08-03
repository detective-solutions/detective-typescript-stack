import { MessageEventType } from '@detective.solutions/shared/data-access';

export const EventTypeTopicMapping = {
  loadWhiteboardData: { eventType: MessageEventType.LoadWhiteboardData, targetTopic: 'transaction' },
  queryTable: { eventType: MessageEventType.QueryTable, targetTopic: 'masking' },
};
