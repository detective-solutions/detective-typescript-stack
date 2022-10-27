import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardSaveTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardSaveTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<void>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    const casefileId = this.messageContext.casefileId;

    try {
      const cachedCasefileId = await this.cacheService.getCasefileById(casefileId);
      if (cachedCasefileId) {
        await this.databaseService.saveCasefile(cachedCasefileId);
        this.logger.log(`${this.logContext} Transaction successful`);
      }
    } catch (error) {
      this.logger.error(error);
      this.handleError(casefileId);
    }
  }

  private handleError(casefileId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not update title of casefile ${casefileId}`);
  }
}
