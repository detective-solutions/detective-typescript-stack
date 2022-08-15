import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { TransactionServiceRefs } from './factory';
import { WhiteboardTransaction } from './abstract';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class WhiteboardNodeAddedTransaction extends WhiteboardTransaction {
  readonly logger = new Logger(WhiteboardNodeAddedTransaction.name);

  // TODO: Add correct message payload type
  constructor(serviceRefs: TransactionServiceRefs, messagePayload: IMessage<any>) {
    super(serviceRefs, messagePayload);
  }

  async execute(): Promise<void> {
    this.transactionProducer.sendKafkaMessage(KafkaTopic.TransactionOutputBroadcast, this.messagePayload);
    this.logger.log(
      `${buildLogContext(this.messagePayload.context)} Forwarded node information to topic ${
        KafkaTopic.TransactionOutputUnicast
      }`
    );

    // TODO: Determine node type and corresponding database service method
    this.logger.verbose(`${buildLogContext(this.messagePayload.context)} Adding node to casefile data`);
    const response = await this.databaseService.addTableOccurrenceToCasefile(
      this.messagePayload.context.casefileId,
      this.messagePayload.body
    );
    if (!response) {
      throw new InternalServerErrorException(
        `Could not fetch data for casefile ${this.messagePayload.context.casefileId}`
      );
    }
    this.logger.log(`${buildLogContext(this.messagePayload.context)} Added node to casefile data`);
  }
}
