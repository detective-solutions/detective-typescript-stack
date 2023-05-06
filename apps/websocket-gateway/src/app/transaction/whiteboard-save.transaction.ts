import { IMessage } from '@detective.solutions/shared/data-access';
import { Logger } from '@nestjs/common';
import { Transaction } from './abstract';

export class WhiteboardSaveTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardSaveTransaction.name);

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
      // Handle error without rollback because this task is not triggered by user action
      this.handleError(error, `Could not update title of casefile "${this.casefileId}"`, false);
    }
  }
}
