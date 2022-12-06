import { IMessage } from '@detective.solutions/shared/data-access';
import { Injectable } from '@nestjs/common';
import { WhiteboardTransactionFactory } from './whiteboard-transaction.factory';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class TransactionCoordinationService {
  constructor(private readonly whiteboardTransactionFactory: WhiteboardTransactionFactory) {}

  async createTransactionByType(payload: IMessage<any>): Promise<void> {
    this.whiteboardTransactionFactory.createTransactionByType(payload);
  }
}
