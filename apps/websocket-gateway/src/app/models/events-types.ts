import { MessageEventType } from '@detective.solutions/shared/data-access';

export const EventTypes = {
  queryTable: { type: MessageEventType.QueryTable, targetTopic: 'masking' },
};
