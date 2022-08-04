import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';
import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from './database.service';
import { TransactionProducer } from '../kafka';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class EventCoordinatorService {
  readonly logger = new Logger(EventCoordinatorService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly transactionProducer: TransactionProducer
  ) {}

  async handleTransactionByType(transactionType: MessageEventType, payload: IMessage<any>): Promise<void> {
    const casefileData = await this.databaseService.getCasefileDataById(payload.context.casefileId);
    if (!casefileData) {
      // TODO: Handle error case
    }
    this.logger.debug(casefileData);
    payload.body = casefileData;
    this.transactionProducer.sendKafkaMessage('transaction_output_unicast', payload);
  }
}
