import { MessageEventType } from '@detective.solutions/shared/data-access';

export const EventTypeTopicMapping = {
  queryTable: { eventType: MessageEventType.QueryTable, targetTopic: 'masking' },
};
