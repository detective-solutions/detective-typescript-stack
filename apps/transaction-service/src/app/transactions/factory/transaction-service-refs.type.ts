import { CacheService, DatabaseService } from '../../services';

import { TransactionEventProducer } from '../../events';

export type TransactionServiceRefs = {
  transactionEventProducer: TransactionEventProducer;
  cacheService: CacheService;
  databaseService: DatabaseService;
};
