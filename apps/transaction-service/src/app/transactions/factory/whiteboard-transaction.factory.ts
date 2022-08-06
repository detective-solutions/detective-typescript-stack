import { SingleTransactionKey, TransactionKeys, transactionMap } from './transaction-map';

import { DatabaseService } from '../../services';
import { IMessage } from '@detective.solutions/shared/data-access';
import { Injectable } from '@nestjs/common';
import { TransactionProducer } from '../../kafka';
import { TransactionServiceRefs } from './transaction-service-refs.type';
import { WhiteboardTransaction } from '../abstract';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WhiteboardTransactionFactory {
  serviceRefs: TransactionServiceRefs = {
    transactionProducer: this.transactionProducer,
    databaseService: this.databaseService,
  };

  constructor(
    private readonly transactionProducer: TransactionProducer,
    private readonly databaseService: DatabaseService
  ) {}

  // Dynamically instantiate transaction classes based on the incoming event type
  createTransaction<K extends TransactionKeys>(
    eventType: SingleTransactionKey<K>,
    messagePayload: IMessage<any>
  ): void {
    let transaction = new transactionMap[eventType](this.serviceRefs, messagePayload) as WhiteboardTransaction;
    // Make sure to remove transaction reference after execution to allow successful garbage collection
    transaction.execute().then(() => (transaction = null));
  }
}
