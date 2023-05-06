import { IMessage, IWhiteboardNodePropertiesUpdate } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';
import { WhiteboardNodePropertyUpdateDTO } from '../models';
import { validateDto } from '@detective.solutions/backend/shared/utils';

export class WhiteboardNodePropertiesUpdatedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodePropertiesUpdatedTransaction.name);

  override message: IMessage<IWhiteboardNodePropertiesUpdate[]>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    try {
      for (const propertyUpdate of this.messageBody) {
        await validateDto(WhiteboardNodePropertyUpdateDTO, propertyUpdate, this.logger);
      }
      await this.cacheService.updateNodeProperties(this.casefileId, this.userId, this.messageBody);
    } catch (error) {
      this.logger.error(error);
      this.logger.log(`${this.logContext} Retrying node property cache update`);
      try {
        await this.cacheService.updateNodeProperties(this.casefileId, this.userId, this.messageBody);
      } catch (error) {
        this.handleError(error, `Could not update node properties in casefile "${this.casefileId}"`, true, false);
      }
    }
    this.broadcastMessage();
    this.logger.log(`${this.logContext} Transaction successful`);
  }
}
