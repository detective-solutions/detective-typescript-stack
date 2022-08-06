import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';

import { InternalServerErrorException } from '@nestjs/common';
import { TransactionServiceRefs } from './factory';
import { WhiteboardTransaction } from './abstract';

export class LoadWhiteboardDataTransaction extends WhiteboardTransaction {
  constructor(serviceRefs: TransactionServiceRefs, messagePayload: IMessage<void>) {
    super(serviceRefs, messagePayload);
  }

  async execute(): Promise<void> {
    const casefileData = await this.databaseService.getCasefileDataById(this.messagePayload.context.casefileId);
    console.log(casefileData);
    if (!casefileData) {
      throw new InternalServerErrorException(
        `Could not fetch data for casefile ${this.messagePayload.context.casefileId}`
      );
    }

    this.messagePayload.body = casefileData; // Fill empty message payload body with casefile data
    this.transactionProducer.sendKafkaMessage(KafkaTopic.TransactionOutputUnicast, this.messagePayload);
    Promise.resolve();
  }
}
