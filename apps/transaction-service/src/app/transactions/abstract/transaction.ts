import { IMessage } from '@detective.solutions/shared/data-access';

export abstract class Transaction {
  messagePayload: IMessage<any>;

  constructor(messagePayload: IMessage<any>) {
    this.messagePayload = messagePayload;
  }

  abstract execute(): Promise<void>;
}
