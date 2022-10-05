import { AnyWhiteboardNode, IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardNodeAddedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeAddedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<AnyWhiteboardNode>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    const casefileId = this.messageContext.casefileId;
    const addedWhiteboardNode = this.messageBody as AnyWhiteboardNode;

    try {
      await this.cacheService.addNode(casefileId, addedWhiteboardNode);
      this.logger.verbose(`Node "${addedWhiteboardNode.id}" was successfully added to casefile "${casefileId}"`);
      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.logger.error(error);
      this.handleError(casefileId, addedWhiteboardNode.id);
    }
  }

  private handleError(casefileId: string, nodeId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`There was an error adding node "${nodeId}" to casefile "${casefileId}"`);
  }
}
