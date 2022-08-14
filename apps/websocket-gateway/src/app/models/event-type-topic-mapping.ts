import { KafkaTopic, MessageEventType } from '@detective.solutions/shared/data-access';

export const EventTypeTopicMapping = {
  loadWhiteboardData: { eventType: MessageEventType.LoadWhiteboardData, targetTopic: KafkaTopic.TransactionInput },
  whiteboardNodeAdded: { eventType: MessageEventType.WhiteboardNodeAdded, targetTopic: KafkaTopic.TransactionInput },
  queryTable: { eventType: MessageEventType.QueryTable, targetTopic: KafkaTopic.QueryInput },
};
