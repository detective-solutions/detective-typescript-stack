import { IMessage } from '@detective.solutions/shared/data-access';
import { Logger } from '@nestjs/common';
import { Transaction } from './abstract';

export class WhiteboardUserLeftTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardUserLeftTransaction.name);

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
      // Handle error without rollback because this task is not triggered by user action
      this.handleError(
        error,
        `Could not remove active user "${this.userId}" from casefile "${this.casefileId}"`,
        false
      );
    }
  }
}
