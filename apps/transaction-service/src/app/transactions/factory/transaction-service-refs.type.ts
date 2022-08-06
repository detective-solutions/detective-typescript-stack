import { DatabaseService } from '../../services';
import { TransactionProducer } from '../../kafka';

export type TransactionServiceRefs = {
  transactionProducer: TransactionProducer;
  databaseService: DatabaseService;
};
