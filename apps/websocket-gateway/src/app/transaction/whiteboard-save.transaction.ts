import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardSaveTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardSaveTransaction.name);
  readonly kafkaTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<void>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    try {
      const cachedCasefileId = await this.cacheService.getCasefileById(this.casefileId);
      if (cachedCasefileId) {
        await this.databaseService.saveCasefile(cachedCasefileId);
        this.logger.log(`${this.logContext} Transaction successful`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    this.logger.error(error);
    throw new InternalServerErrorException(`Could not update title of casefile "${this.casefileId}"`);
  }
}
