import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardUserLeftTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardUserLeftTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<void>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    const casefileId = this.messageContext.casefileId;
    const userId = this.messageContext.userId;

    try {
      const response = await this.cacheService.removeActiveUser(casefileId, userId);
      if (response === 'OK') {
        this.forwardMessageToOtherClients();
        this.logger.log(`${this.logContext} Transaction successful`);
      }
    } catch (error) {
      this.logger.error(error);
      this.handleError(userId, casefileId);
    }
  }

  private handleError(nodeId: string, casefileId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not add new user ${nodeId} to casefile ${casefileId}`);
  }
}
