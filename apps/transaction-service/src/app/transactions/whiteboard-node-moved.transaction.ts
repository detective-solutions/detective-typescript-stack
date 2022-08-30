import { IMessage, IWhiteboardNodePositionUpdate, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';
import { WhiteboardNodePositionUpdateDTO } from '../models';
import { validateDto } from '@detective.solutions/backend/shared/utils';

export class WhiteboardNodeMovedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeMovedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<IWhiteboardNodePositionUpdate[]>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody || !Array.isArray(this.messageBody)) {
      throw new InternalServerErrorException('Transaction cannot be executed due to missing message body information');
    }

    try {
      for (const node of this.messageBody) {
        await validateDto(WhiteboardNodePositionUpdateDTO, node as IWhiteboardNodePositionUpdate, this.logger);
      }
      this.forwardMessageToOtherClients();
      this.databaseService.updateNodePositionsInCasefile(this.messageContext.casefileId, this.messageBody);
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
