import { IMessage, IWhiteboardNodeSizeUpdate, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';
import { WhiteboardNodeSizeUpdateDTO } from '../models';
import { validateDto } from '@detective.solutions/backend/shared/utils';

export class WhiteboardNodeResizedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeResizedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<IWhiteboardNodeSizeUpdate[]>; // Define message body type

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
    const userId = this.messageContext.userId;

    try {
      await validateDto(WhiteboardNodeSizeUpdateDTO, this.messageBody as IWhiteboardNodeSizeUpdate, this.logger);
      // Only return position updates for nodes that are not blocked by other users
      // Updating the message.body property instead of messageBody, because it is used for message forwarding
      const resizeAllowed = await this.cacheService.updateNodeSize(casefileId, nodeId, userId, this.messageBody);
      if (resizeAllowed) {
        this.forwardMessageToOtherClients();
      }
      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.logger.error(error);
      this.handleError(casefileId);
    }
  }

  private handleError(casefileId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not update node positions in casefile ${casefileId}`);
  }
}
