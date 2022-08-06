import { IMessage } from '@detective.solutions/shared/data-access';

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Transaction {
  messagePayload: IMessage<any>;

  constructor(messagePayload: IMessage<any>) {
    this.messagePayload = messagePayload;
  }

  abstract execute(): Promise<void>;
}
