import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';

import { Injectable } from '@nestjs/common';
import { WhiteboardTransactionFactory } from '../transaction';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class TransactionCoordinationService {
  constructor(private readonly whiteboardTransactionFactory: WhiteboardTransactionFactory) {}

  async createTransactionByEventType(eventType: MessageEventType, payload: IMessage<any>): Promise<void> {
    this.whiteboardTransactionFactory.createTransaction(eventType, payload);
  }
}
