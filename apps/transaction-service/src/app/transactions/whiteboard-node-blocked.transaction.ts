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

    const casefileId = this.messageContext.casefileId;
    const nodeId = this.messageContext?.nodeId;

    try {
      const isBlockSuccessful = await this.cacheService.updateWhiteboardNodeBlock(
        casefileId,
        nodeId,
        this.messageBody?.temporary?.blockedBy ?? null
      );
      console.log('IS BLOCK SUCCESSFUL', isBlockSuccessful);
      if (isBlockSuccessful) {
        this.forwardMessageToOtherClients();
      }
      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.logger.error(error);
      this.handleError(nodeId, casefileId);
    }
  }

  private handleError(nodeId: string, casefileId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not block node ${nodeId} in casefile ${casefileId}`);
  }
}
