import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SingleTransactionKey, TransactionKeys, transactionMap } from './transaction-map';

import { DatabaseService } from '../../services';
import { IMessage } from '@detective.solutions/shared/data-access';
import { TransactionProducer } from '../../kafka';
import { TransactionServiceRefs } from './transaction-service-refs.type';
import { WhiteboardTransaction } from '../abstract';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WhiteboardTransactionFactory {
  readonly logger = new Logger(WhiteboardTransactionFactory.name);

  serviceRefs: TransactionServiceRefs = {
    transactionProducer: this.transactionProducer,
    databaseService: this.databaseService,
  };

  constructor(
    private readonly transactionProducer: TransactionProducer,
    private readonly databaseService: DatabaseService
  ) {}

  // Dynamically instantiate transaction classes based on the incoming event type
  createTransaction<K extends TransactionKeys>(eventType: SingleTransactionKey<K>, messagePayload: IMessage<any>) {
    try {
      const transaction = new transactionMap[eventType](this.serviceRefs, messagePayload) as WhiteboardTransaction;
      this.logger.log(`Created transaction for event type ${eventType as string}`);
      transaction.execute();
      return transaction; // Return transaction to allow testing this method
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        `Could not map event type ${eventType as string} to a corresponding transaction`
      );
    }
  }
}
