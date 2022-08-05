import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';
import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from './database.service';
import { TransactionProducer } from '../kafka';
import { WhiteboardTransactionFactory } from '../transactions';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class TransactionCoordinationService {
  readonly logger = new Logger(TransactionCoordinationService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly transactionProducer: TransactionProducer
  ) {}

  async createTransactionByEventType(eventType: MessageEventType, messagePayload: IMessage<any>): Promise<void> {
    WhiteboardTransactionFactory.createTransaction(eventType, messagePayload);
  }

  // private async loadWhiteboardData(messagePayload: IMessage<any>) {
  //   const casefileData = await this.databaseService.getCasefileDataById(messagePayload.context.casefileId);
  //   if (!casefileData) {
  //     // TODO: Handle error case
  //   }
  //   messagePayload.body = casefileData;
  //   this.transactionProducer.sendKafkaMessage(KafkaTopic.TransactionOutputUnicast, messagePayload);
  // }
}
