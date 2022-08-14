import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';

import { Logger } from '@nestjs/common';
import { TransactionServiceRefs } from './factory';
import { WhiteboardTransaction } from './abstract';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

export class WhiteboardNodeAddedTransaction extends WhiteboardTransaction {
  readonly logger = new Logger(WhiteboardNodeAddedTransaction.name);

  constructor(serviceRefs: TransactionServiceRefs, messagePayload: IMessage<void>) {
    super(serviceRefs, messagePayload);
  }

  async execute(): Promise<void> {
    this.logger.verbose(`${buildLogContext(this.messagePayload.context)} Updating casefile data `);
    // const casefileData = await this.databaseService.getCasefileById(this.messagePayload.context.casefileId);
    // if (!casefileData) {
    //   throw new InternalServerErrorException(
    //     `Could not fetch data for casefile ${this.messagePayload.context.casefileId}`
    //   );
    // }
    // this.logger.log(`${buildLogContext(this.messagePayload.context)} Updated casefile data`);

    console.log('MESSAGE PAYLOAD', this.messagePayload);

    this.transactionProducer.sendKafkaMessage(KafkaTopic.TransactionOutputBroadcast, this.messagePayload);
    this.logger.log(
      `${buildLogContext(this.messagePayload.context)} Forwarded casefile data to topic ${
        KafkaTopic.TransactionOutputUnicast
      }`
    );
  }
}
