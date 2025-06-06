import { InternalServerErrorException, Logger } from '@nestjs/common';

import { IMessage } from '@detective.solutions/shared/data-access';
import { Transaction } from './abstract';

export class WhiteboardTitleUpdatedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardTitleUpdatedTransaction.name);

  override message: IMessage<string>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    try {
      await this.cacheService.updateCasefileTitle(this.casefileId, this.messageBody);
      this.broadcastMessage();
      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.handleError(error, `Could not update title of casefile "${this.casefileId}"`);
    }
  }
}
