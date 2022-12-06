import { CacheService, DatabaseService } from '../../services';

import { WhiteboardEventProducer } from '../../events';

export type TransactionServiceRefs = {
  transactionEventProducer: WhiteboardEventProducer;
  cacheService: CacheService;
  databaseService: DatabaseService;
};
