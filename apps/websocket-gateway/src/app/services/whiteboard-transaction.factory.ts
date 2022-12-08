import { Inject, Injectable, InternalServerErrorException, Logger, forwardRef } from '@nestjs/common';
import { TransactionServiceRefs, transactionMap } from '../models';

import { CacheService } from './cache.service';
import { DatabaseService } from './database.service';
import { IMessage } from '@detective.solutions/shared/data-access';
import { KafkaEventProducer } from '../kafka';
import { Transaction } from '../transaction';
import { WhiteboardWebSocketGateway } from '../websocket';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WhiteboardTransactionFactory {
  readonly logger = new Logger(WhiteboardTransactionFactory.name);

  serviceRefs: TransactionServiceRefs = {
    whiteboardWebSocketGateway: this.whiteboardWebSocketGateway,
    cacheService: this.cacheService,
    databaseService: this.databaseService,
    kafkaEventProducer: this.kafkaEventProducer,
  };

  constructor(
    @Inject(forwardRef(() => WhiteboardWebSocketGateway))
    private readonly whiteboardWebSocketGateway: WhiteboardWebSocketGateway,
    private readonly cacheService: CacheService,
    private readonly databaseService: DatabaseService,
    private readonly kafkaEventProducer: KafkaEventProducer
  ) {}

  // Dynamically instantiate transaction classes based on the incoming event type
  createTransactionByType(messagePayload: IMessage<any>) {
    try {
      const transaction = new transactionMap[messagePayload.context.eventType](
        this.serviceRefs,
        messagePayload
      ) as Transaction;
      this.logger.log(`Created transaction for event type ${messagePayload.context.eventType as string}`);
      transaction.execute();
      return transaction; // Return transaction to allow testing this method
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        `Could not map event type ${messagePayload.context.eventType as string} to a corresponding transaction`
      );
    }
  }
}
