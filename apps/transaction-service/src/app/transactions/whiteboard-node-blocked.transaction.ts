import { IMessage, IWhiteboardNodeBlockUpdate, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardNodeBlockedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeBlockedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<IWhiteboardNodeBlockUpdate>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }
    if (!this.messageContext.nodeId) {
      throw new InternalServerErrorException('Received message context is missing mandatory nodeId');
    }

    try {
      const isBlockSuccessful = await this.cacheService.updateNodeBlock(
        this.casefileId,
        this.messageBody?.temporary?.blockedBy ?? null,
        this.nodeId
      );
      if (isBlockSuccessful) {
        this.forwardMessageToOtherClients();
        this.logger.log(`${this.logContext} Transaction successful`);
      } else {
        this.logger.warn(`${this.logContext} Node blocking skipped because it is already blocked`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: Error) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    this.logger.error(error);
    throw new InternalServerErrorException(`Could not block node "${this.nodeId}" in casefile "${this.casefileId}"`);
  }
}
