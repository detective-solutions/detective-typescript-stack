import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';
import { Injectable, Logger } from '@nestjs/common';

import { WhiteboardTransactionFactory } from '../transactions';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class TransactionCoordinationService {
  readonly logger = new Logger(TransactionCoordinationService.name);

  constructor(private readonly whiteboardTransactionFactory: WhiteboardTransactionFactory) {}

  async createTransactionByEventType(eventType: MessageEventType, messagePayload: IMessage<any>): Promise<void> {
    this.whiteboardTransactionFactory.createTransaction(eventType, messagePayload);
  }
}
