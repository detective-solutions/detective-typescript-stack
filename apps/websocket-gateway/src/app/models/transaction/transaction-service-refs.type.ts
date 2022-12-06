import { CacheService, DatabaseService } from '../../services';

import { KafkaEventProducer } from '../../kafka';
import { WhiteboardWebSocketGateway } from '../../websocket';

export type TransactionServiceRefs = {
  cacheService: CacheService;
  databaseService: DatabaseService;
  whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  kafkaEventProducer: KafkaEventProducer;
};
