import {
  AnyWhiteboardNode,
  IMessage,
  IWhiteboardNodeDeletedUpdate,
  KafkaTopic,
} from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardNodeDeletedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeDeletedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<AnyWhiteboardNode>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException('Transaction cannot be executed due to missing message body information');
    }
    const deletedNode = this.messageBody as IWhiteboardNodeDeletedUpdate;
    const casefileId = this.messageContext.casefileId;

    this.forwardMessageToOtherClients();
    const response = this.databaseService.deleteNodeInCasefile(deletedNode.id, deletedNode.type);
    if (!response) {
      this.handleError(casefileId, deletedNode.type);
    }

    this.logger.log(`${this.logContext} Transaction successful`);
    this.logger.verbose(
      `${deletedNode.type} node (${deletedNode.id}) was successfully deleted from casefile ${casefileId}`
    );
  }

  private handleError(casefileId: string, nodeType: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not delete ${nodeType} node from casefile ${casefileId}`);
  }
}
