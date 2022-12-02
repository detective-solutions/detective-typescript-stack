import { IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';
import { WhiteboardNodePositionUpdateDTO } from '../models';
import { validateDto } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class WhiteboardNodeMovedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeMovedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<any[]>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody || !Array.isArray(this.messageBody)) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    const casefileId = this.messageContext.casefileId;
    const userId = this.messageContext.userId;

    try {
      for (const node of this.messageBody) {
        try {
          await validateDto(WhiteboardNodePositionUpdateDTO, node, this.logger);
        } catch {
          // Remove invalid position updates from message body
          this.messageBody = this.messageBody.filter((nodePositionUpdate: any) => nodePositionUpdate.id !== node.id);
        }
      }

      // Only return position updates for nodes that are not blocked by other users
      // Updating the message.body property instead of messageBody, because it is used for message forwarding
      this.message.body = await this.cacheService.updateNodePositions(casefileId, userId, this.messageBody);
      this.forwardMessageToOtherClients();
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
