import { AnyWhiteboardNode, IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Transaction } from './abstract';

export class WhiteboardNodeMovedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeMovedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<AnyWhiteboardNode>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException('Transaction cannot be executed due to missing message body information');
    }

    try {
      this.forwardMessageToOtherClients();
      this.databaseService.updateNodePositionInCasefile(this.messageContext.casefileId, this.messageBody);
      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    this.logger.error(error);
  }
}
