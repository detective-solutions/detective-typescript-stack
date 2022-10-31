import { CacheService, DatabaseService } from '../../services';
import { IMessage, IMessageContext, KafkaTopic } from '@detective.solutions/shared/data-access';

import { Logger } from '@nestjs/common';
import { TransactionEventProducer } from '../../events';
import { TransactionServiceRefs } from '../factory';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Transaction {
  abstract readonly logger: Logger;
  abstract readonly targetTopic: KafkaTopic;

  readonly transactionEventProducer: TransactionEventProducer;
  readonly cacheService: CacheService;
  readonly databaseService: DatabaseService;

  message: IMessage<any>;
  messageContext: IMessageContext;
  messageBody: any;
  logContext: string;

  protected readonly missingMessageBodyErrorText =
    'Transaction cannot be executed due to missing message body information';

  constructor(serviceRefs: TransactionServiceRefs, message: IMessage<any>) {
    this.transactionEventProducer = serviceRefs.transactionEventProducer;
    this.cacheService = serviceRefs.cacheService;
    this.databaseService = serviceRefs.databaseService;
    this.message = message;
    this.messageContext = message.context;
    this.messageBody = message.body;
    this.logContext = buildLogContext(this.messageContext);
  }

  abstract execute(): Promise<void>;

  protected forwardMessageToOtherClients() {
    this.transactionEventProducer.sendKafkaMessage(this.targetTopic, this.message);
    this.logger.verbose(
      `${this.logContext} Forwarded transaction information to topic ${KafkaTopic.TransactionOutputUnicast}`
    );
  }
}
