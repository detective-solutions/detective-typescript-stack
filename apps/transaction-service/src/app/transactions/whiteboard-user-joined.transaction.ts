import {
  ICachedCasefileForWhiteboard,
  IMessage,
  IUserForWhiteboard,
  KafkaTopic,
  MessageEventType,
} from '@detective.solutions/shared/data-access';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardUserJoinedTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardUserJoinedTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<IUserForWhiteboard>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    const casefileId = this.messageContext.casefileId;
    const userId = this.messageContext?.userId;

    try {
      const cacheExists = await this.cacheService.isCasefileCached(casefileId);
      if (!cacheExists) {
        await this.setupMissingCache(casefileId);
      }

      // First add user to cache, then trigger LOAD_CASEFILE_DATA transaction for the new user
      const user = await this.cacheService.addActiveWhiteboardUser(userId, casefileId);
      const casefileData = await this.cacheService.getCasefileById(casefileId);
      if (!casefileData) {
        throw new Error(`Could not fetch data for casefile ${casefileId}`);
      }
      this.transactionEventProducer.sendKafkaMessage(this.targetTopic, {
        context: { ...this.messageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: casefileData,
      });

      // Forward user info to other clients
      this.message.body = user;
      this.forwardMessageToOtherClients();

      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.logger.error(error);
      this.handleError(userId, casefileId);
    }
  }

  private async setupMissingCache(casefileId: string): Promise<void> {
    const casefileData = (await this.databaseService.getCasefileById(casefileId)) as ICachedCasefileForWhiteboard;
    await this.cacheService.saveCasefile(casefileData);
    this.logger.log(`${this.logContext} Successfully created new cache for casefile ${casefileId}`);
  }

  private handleError(nodeId: string, casefileId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not add new user ${nodeId} to casefile ${casefileId}`);
  }
}
