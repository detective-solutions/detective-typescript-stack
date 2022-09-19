import { CacheService, DatabaseService } from '../../services';

import { TransactionProducer } from '../../kafka';

export type TransactionServiceRefs = {
  transactionProducer: TransactionProducer;
  cacheService: CacheService;
  databaseService: DatabaseService;
};
