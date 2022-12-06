import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardTitleUpdatedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardTitleUpdatedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<string>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    try {
      await this.cacheService.updateCasefileTitle(this.casefileId, this.messageBody);
      this.forwardMessageToOtherClients();
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
