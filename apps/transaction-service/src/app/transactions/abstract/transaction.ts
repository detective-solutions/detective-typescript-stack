import { IMessage } from '@detective.solutions/shared/data-access';
import { Logger } from '@nestjs/common';

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Transaction {
  readonly logger: Logger;

  messagePayload: IMessage<any>;

  constructor(messagePayload: IMessage<any>) {
    this.messagePayload = messagePayload;
  }

  abstract execute(): Promise<void>;
}
