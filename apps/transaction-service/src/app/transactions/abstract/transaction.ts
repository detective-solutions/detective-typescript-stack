import { IMessage, IMessageContext, KafkaTopic } from '@detective.solutions/shared/data-access';

import { DatabaseService } from '../../services';
import { Logger } from '@nestjs/common';
import { TransactionProducer } from '../../kafka';
import { TransactionServiceRefs } from '../factory';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Transaction {
  abstract readonly logger: Logger;
  abstract readonly targetTopic: KafkaTopic;

  readonly transactionProducer: TransactionProducer;
  readonly databaseService: DatabaseService;

  message: IMessage<any>;
  messageContext: IMessageContext;
  messageBody: any;
  logContext: string;

  protected readonly missingMessageBodyErrorText =
    'Transaction cannot be executed due to missing message body information';

  constructor(serviceRefs: TransactionServiceRefs, message: IMessage<any>) {
    this.transactionProducer = serviceRefs.transactionProducer;
    this.databaseService = serviceRefs.databaseService;
    this.message = message;
    this.messageContext = message.context;
    this.messageBody = message.body;
    this.logContext = buildLogContext(this.messageContext);
  }

  abstract execute(): Promise<void>;

  protected forwardMessageToOtherClients() {
    this.transactionProducer.sendKafkaMessage(this.targetTopic, this.message);
    this.logger.verbose(
      `${this.logContext} Forwarded transaction information to topic ${KafkaTopic.TransactionOutputUnicast}`
    );
  }
}
