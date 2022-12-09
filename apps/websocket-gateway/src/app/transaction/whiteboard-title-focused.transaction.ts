import { InternalServerErrorException, Logger } from '@nestjs/common';

import { IMessage } from '@detective.solutions/shared/data-access';
import { Transaction } from './abstract';

export class WhiteboardTitleFocusedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardTitleFocusedTransaction.name);

  override message: IMessage<string | null>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    // Explicitly check for undefined because messageBody can be null
    if (this.messageBody === undefined) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    try {
      await this.cacheService.updateCasefileTitleFocus(this.casefileId, this.messageBody);
      this.broadcastMessage();
      this.logger.log(`${this.logContext} Transaction successful`);
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
