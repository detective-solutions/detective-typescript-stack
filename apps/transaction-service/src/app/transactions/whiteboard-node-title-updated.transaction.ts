import { IMessage, IWhiteboardNodeTitleUpdate, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardNodeTitleUpdatedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeTitleUpdatedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<IWhiteboardNodeTitleUpdate>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }
    if (!this.messageContext.nodeId) {
      throw new InternalServerErrorException('Received message context is missing mandatory nodeId');
    }

    const casefileId = this.messageContext.casefileId;
    const nodeId = this.messageContext.nodeId;

    this.forwardMessageToOtherClients();
    try {
      await this.updateCache(casefileId, nodeId);
    } catch (error) {
      this.logger.error(error);
      this.logger.log(`${this.logContext} Retrying node title property cache update`);
      try {
        await this.updateCache(casefileId, nodeId);
      } catch (error) {
        this.handleFinalError(error);
      }
    }
    this.logger.log(`${this.logContext} Transaction successful`);
  }

  private async updateCache(casefileId: string, nodeId: string) {
    await this.cacheService.updateNodeProperty(casefileId, nodeId, 'title', this.messageBody?.title);
  }

  private handleFinalError(casefileId: string) {
    // TODO: Add mechanism to publish failed transaction to error topic
    throw new InternalServerErrorException(`Could not update node title property in casefile ${casefileId}`);
  }
}
