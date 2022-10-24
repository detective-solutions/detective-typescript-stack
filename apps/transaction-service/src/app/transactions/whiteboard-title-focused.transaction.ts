import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardTitleFocusedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardTitleFocusedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<boolean>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    const casefileId = this.messageContext.casefileId;

    try {
      this.forwardMessageToOtherClients();
      await this.cacheService.updateCasefileTitleFocus(casefileId, this.messageBody);
      this.logger.log(`${this.logContext} Transaction successful`);
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
