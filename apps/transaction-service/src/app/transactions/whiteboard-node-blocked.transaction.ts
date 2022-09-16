import { IMessage, IWhiteboardNodeBlockUpdate, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';
import { WhiteboardNodeBlockUpdateDTO } from '../models';
import { validateDto } from '@detective.solutions/backend/shared/utils';

export class WhiteboardNodeBlockedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeBlockedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<IWhiteboardNodeBlockUpdate>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }
    const nodeId = this.messageContext?.nodeId;
    const casefileId = this.messageContext.casefileId;

    try {
      await validateDto(WhiteboardNodeBlockUpdateDTO, this.messageBody as IWhiteboardNodeBlockUpdate, this.logger);
      this.forwardMessageToOtherClients();
      // TODO: Add temporary data to cache
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
