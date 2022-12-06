import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardUserLeftTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardUserLeftTransaction.name);
  readonly kafkaTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<void>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    try {
      const response = await this.cacheService.removeActiveUser(this.casefileId, this.userId);
      if (response === 'OK') {
        this.broadcastMessage();
        this.logger.log(`${this.logContext} Transaction successful`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    this.logger.error(error);
    throw new InternalServerErrorException(`Could not add new user "${this.userId}" to casefile "${this.casefileId}"`);
  }
}
