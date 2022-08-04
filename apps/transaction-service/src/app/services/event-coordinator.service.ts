import { IMessage, MessageEventType } from '@detective.solutions/shared/data-access';
import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from './database.service';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class EventCoordinatorService {
  readonly logger = new Logger(EventCoordinatorService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async handleTransactionByType(transactionType: MessageEventType, payload: IMessage<any>): Promise<void> {
    console.log(transactionType);
    console.log(payload);
    const casefileData = await this.databaseService.getCasefileDataById(payload.context.casefileId);
    this.logger.debug(casefileData);
  }
}
