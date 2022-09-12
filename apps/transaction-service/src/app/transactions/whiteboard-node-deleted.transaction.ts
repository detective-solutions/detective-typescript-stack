import { AnyWhiteboardNode, IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
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
    const deletedWhiteboardNode = this.messageBody as AnyWhiteboardNode;
    const casefileId = this.messageContext.casefileId;

    this.forwardMessageToOtherClients();
    const response = this.databaseService.deleteNodeInCasefile(deletedWhiteboardNode.id, deletedWhiteboardNode.type);
    if (!response) {
      this.handleError(casefileId, deletedWhiteboardNode.type);
    }

    this.logger.log(`${this.logContext} Transaction successful`);
    this.logger.verbose(
      `${deletedWhiteboardNode.type} node (${deletedWhiteboardNode.id}) was successfully deleted from casefile ${casefileId}`
    );
  }

  private handleError(casefileId: string, nodeType: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not delete ${nodeType} node from casefile ${casefileId}`);
  }
}
