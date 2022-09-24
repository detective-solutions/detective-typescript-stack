import { ICachedCasefileForWhiteboard, IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardUserJoinedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardUserJoinedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<null>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    const casefileId = this.messageContext.casefileId;
    const userId = this.messageContext?.userId;

    try {
      const cacheExists = (await this.cacheService.isCasefileCached(casefileId)) as number;
      if (!cacheExists) {
        await this.handleMissingCache(casefileId);
      }
      this.forwardMessageToOtherClients();
      await this.cacheService.addActiveWhiteboardUser(userId, casefileId);
      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.logger.error(error);
      this.handleError(userId, casefileId);
    }
  }

  private async handleMissingCache(casefileId: string): Promise<void> {
    const casefileData = (await this.databaseService.getCasefileById(casefileId)) as ICachedCasefileForWhiteboard;
    await this.cacheService.saveCasefile(casefileData);
    this.logger.log(`${this.logContext} Successfully created new casefile cache`);
  }

  private handleError(nodeId: string, casefileId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not block node ${nodeId} in casefile ${casefileId}`);
  }
}
