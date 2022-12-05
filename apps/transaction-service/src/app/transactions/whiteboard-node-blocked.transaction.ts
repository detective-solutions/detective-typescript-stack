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
      await this.cacheService.updateNodeBlock(this.casefileId, this.userId ?? null, this.nodeId);
    } catch (error) {
      this.logger.error(error);
      this.logger.log(`${this.logContext} Retrying node block`);
      try {
        await this.cacheService.updateNodeBlock(this.casefileId, this.userId ?? null, this.nodeId);
      } catch (error) {
        this.handleFinalError(error);
      }
    }
    this.forwardMessageToOtherClients();
    this.logger.log(`${this.logContext} Transaction successful`);
  }

  private handleFinalError(error: Error) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    this.logger.error(error);
    throw new InternalServerErrorException(`Could not block node "${this.nodeId}" in casefile "${this.casefileId}"`);
  }
}
