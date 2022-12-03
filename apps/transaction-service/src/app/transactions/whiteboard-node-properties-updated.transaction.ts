import { IMessage, IWhiteboardNodePropertiesUpdate, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';
import { WhiteboardNodePropertyUpdateDTO } from '../models';
import { validateDto } from '@detective.solutions/backend/shared/utils';

export class WhiteboardNodePropertiesUpdatedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodePropertiesUpdatedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<IWhiteboardNodePropertiesUpdate[]>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    for (const propertyUpdate of this.messageBody) {
      try {
        await validateDto(WhiteboardNodePropertyUpdateDTO, propertyUpdate, this.logger);
        await this.updateNodePropertiesInCache(propertyUpdate);
      } catch (error) {
        this.logger.error(error);
        this.logger.log(`${this.logContext} Retrying node property cache update`);
        try {
          await this.updateNodePropertiesInCache(propertyUpdate);
        } catch (error) {
          this.handleFinalError(error);
        }
      }
    }
    this.forwardMessageToOtherClients();

    this.logger.log(`${this.logContext} Transaction successful`);
  }

  private async updateNodePropertiesInCache(propertyUpdate: IWhiteboardNodePropertiesUpdate) {
    const { nodeId, ...propertyUpdateWithoutNodeId } = propertyUpdate;
    if (nodeId) {
      await this.cacheService.updateNodeProperties(
        this.casefileId,
        this.userId,
        nodeId,
        propertyUpdateWithoutNodeId as IWhiteboardNodePropertiesUpdate
      );
    }
  }

  private handleFinalError(error: Error) {
    // TODO: Add mechanism to publish failed transaction to error topic
    this.logger.error(error);
    throw new InternalServerErrorException(`Could not update node title property in casefile "${this.casefileId}"`);
  }
}
