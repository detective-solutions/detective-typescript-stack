import { DatabaseService } from '../../services';
import { IMessage } from '@detective.solutions/shared/data-access';
import { Transaction } from './transaction';
import { TransactionProducer } from '../../kafka';
import { TransactionServiceRefs } from '../factory';

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class WhiteboardTransaction extends Transaction {
  transactionProducer: TransactionProducer;
  databaseService: DatabaseService;

  constructor(services: TransactionServiceRefs, messagePayload: IMessage<any>) {
    super(messagePayload);
    this.transactionProducer = services.transactionProducer;
    this.databaseService = services.databaseService;
  }
}
