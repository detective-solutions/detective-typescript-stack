import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { TransactionServiceRefs } from './factory';
import { WhiteboardTransaction } from './abstract';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

export class LoadWhiteboardDataTransaction extends WhiteboardTransaction {
  readonly logger = new Logger(LoadWhiteboardDataTransaction.name);

  constructor(serviceRefs: TransactionServiceRefs, messagePayload: IMessage<void>) {
    super(serviceRefs, messagePayload);
  }

  async execute(): Promise<void> {
    this.logger.verbose(`${buildLogContext(this.messagePayload.context)} Requesting casefile data `);
    const casefileData = await this.databaseService.getCasefileById(this.messagePayload.context.casefileId);
    if (!casefileData) {
      throw new InternalServerErrorException(
        `Could not fetch data for casefile ${this.messagePayload.context.casefileId}`
      );
    }
    this.logger.log(`${buildLogContext(this.messagePayload.context)} received casefile data`);
    this.logger.debug(`[DEBUG] Received casefile data: ${casefileData}`);

    this.messagePayload.body = casefileData; // Fill empty message payload body with casefile data
    this.transactionProducer.sendKafkaMessage(KafkaTopic.TransactionOutputUnicast, this.messagePayload);
    this.logger.log(
      `${buildLogContext(this.messagePayload.context)} Forwarded casefile data to topic ${
        KafkaTopic.TransactionOutputUnicast
      }`
    );
    Promise.resolve();
  }
}
