import { KafkaTopic, MessageEventType } from '@detective.solutions/shared/data-access';

export const EventTypeTopicMapping = {
  loadWhiteboardData: { eventType: MessageEventType.LoadWhiteboardData, targetTopic: KafkaTopic.TransactionInput },
  whiteboardUserJoined: {
    targetTopic: KafkaTopic.TransactionInput,
  },
  whiteboardUserLeft: {
    targetTopic: KafkaTopic.TransactionInput,
  },
  whiteboardNodeAdded: { eventType: MessageEventType.WhiteboardNodeAdded, targetTopic: KafkaTopic.TransactionInput },
  whiteboardNodeDeleted: {
    eventType: MessageEventType.WhiteboardNodeDeleted,
    targetTopic: KafkaTopic.TransactionInput,
  },
  whiteboardNodeBlocked: {
    eventType: MessageEventType.WhiteboardNodeBlocked,
    targetTopic: KafkaTopic.TransactionInput,
  },
  whiteboardNodeMoved: { eventType: MessageEventType.WhiteboardNodeMoved, targetTopic: KafkaTopic.TransactionInput },
  whiteboardNodePropertiesUpdated: {
    eventType: MessageEventType.WhiteboardNodePropertiesUpdated,
    targetTopic: KafkaTopic.TransactionInput,
  },
  whiteboardTitleFocused: {
    eventType: MessageEventType.WhiteboardTitleFocused,
    targetTopic: KafkaTopic.TransactionInput,
  },
  whiteboardTitleUpdated: {
    eventType: MessageEventType.WhiteboardTitleUpdated,
    targetTopic: KafkaTopic.TransactionInput,
  },
  queryTable: { eventType: MessageEventType.QueryTable, targetTopic: KafkaTopic.QueryInput },
};
