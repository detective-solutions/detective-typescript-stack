import { IMessage } from '@detective.solutions/shared/data-access';
import { WhiteboardTransaction } from './abstract';

export class LoadWhiteboardDataTransaction implements WhiteboardTransaction {
  constructor(messagePayload: IMessage<any>) {
    this.execute(messagePayload);
  }

  private execute(messagePayload: IMessage<any>) {
    // TODO: Remove me!
    console.log(messagePayload);
    console.log('IT WORKED!!!!!!!!');
    // const casefileData = await this.databaseService.getCasefileDataById(messagePayload.context.casefileId);
    // if (!casefileData) {
    //   // TODO: Handle error case
    // }
    // messagePayload.body = casefileData;
    // this.transactionProducer.sendKafkaMessage(KafkaTopic.TransactionOutputUnicast, messagePayload);return new userMap[k]();
  }
}
