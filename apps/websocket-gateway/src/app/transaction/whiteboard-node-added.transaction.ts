import { AnyWhiteboardNode, IMessage } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardNodeAddedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardNodeAddedTransaction.name);

  override message: IMessage<AnyWhiteboardNode>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    if (!this.messageBody) {
      throw new InternalServerErrorException(this.missingMessageBodyErrorText);
    }

    try {
      await this.cacheService.addNode(this.casefileId, this.messageBody);
      this.broadcastMessage();
      this.logger.verbose(`Node "${this.nodeId}" was successfully added to casefile "${this.casefileId}"`);
      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.handleError(error, `There was an error adding node "${this.nodeId}" to casefile "${this.casefileId}"`);
    }
  }
}
