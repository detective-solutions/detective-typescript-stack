import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';

import { TransactionServiceRefs } from './factory';
import { WhiteboardTransaction } from './abstract';

export class LoadWhiteboardDataTransaction extends WhiteboardTransaction {
  constructor(serviceRefs: TransactionServiceRefs, messagePayload: IMessage<any>) {
    super(serviceRefs, messagePayload);
  }

  async execute(): Promise<void> {
    console.log(this.messagePayload);
    console.log('IT WORKED!!!!!!!!');
    const casefileData = await this.databaseService.getCasefileDataById(this.messagePayload.context.casefileId);
    if (!casefileData) {
      // TODO: Handle error case
    }
    this.messagePayload.body = casefileData;
    this.transactionProducer.sendKafkaMessage(KafkaTopic.TransactionOutputUnicast, this.messagePayload);
    Promise.resolve();
  }
}
