import { CacheService, DatabaseService } from '../../services';

import { KafkaEventProducer } from '../../kafka';
import { WhiteboardWebSocketGateway } from '../../websocket';

export type TransactionServiceRefs = {
  whiteboardWebSocketGateway: WhiteboardWebSocketGateway;
  cacheService: CacheService;
  databaseService: DatabaseService;
  kafkaEventProducer: KafkaEventProducer;
};
