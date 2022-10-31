import { AnyWhiteboardNode, IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardNodeDeletedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeDeletedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<AnyWhiteboardNode>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageContext.nodeId) {
      throw new InternalServerErrorException('Received message context is missing mandatory nodeId');
    }

    const casefileId = this.messageContext.casefileId;
    const nodeId = this.messageContext.nodeId;

    try {
      this.forwardMessageToOtherClients();
      await this.cacheService.deleteNode(casefileId, nodeId);
      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.logger.error(error);
      this.handleError(casefileId, nodeId);
    }
  }

  private handleError(casefileId: string, nodeId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not delete node ${nodeId} from casefile ${casefileId}`);
  }
}
