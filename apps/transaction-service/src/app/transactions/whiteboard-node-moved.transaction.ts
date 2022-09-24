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
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }
    const casefileId = this.messageContext.casefileId;

    try {
      for (const node of this.messageBody) {
        await validateDto(WhiteboardNodePositionUpdateDTO, node as IWhiteboardNodePositionUpdate, this.logger);
      }

      // TODO: REMOVE ME
      const test = await this.cacheService.getActiveWhiteboardUsersByCasefile(casefileId);
      this.logger.debug('TEST ACTIVE USERS', test);

      this.forwardMessageToOtherClients();
      const response = await this.databaseService.updateNodePositionsInCasefile(casefileId, this.messageBody);
      if (!response) {
        this.handleError(casefileId);
      }

      this.logger.log(`${this.logContext} Transaction successful`);
      this.logger.verbose(`Node positions were successfully updated in casefile ${casefileId}`);
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
