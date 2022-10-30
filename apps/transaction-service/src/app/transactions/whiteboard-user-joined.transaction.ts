import {
  ICachableCasefileForWhiteboard,
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
    const userId = this.messageContext.userId;

    try {
      // Get user info from database
      const newUserInfo = await this.databaseService.getWhiteboardUserById(userId);

      // Check if casefile is already cached
      let casefileData = await this.cacheService.getCasefileById(casefileId);
      if (casefileData) {
        casefileData = await this.enhanceCacheWithNewUser(casefileData, newUserInfo);
      } else {
        casefileData = await this.setupNewCasefileCache(casefileId, newUserInfo);
      }

      // Send LOAD_CASEFILE_DATA event to connected user
      this.transactionEventProducer.sendKafkaMessage(KafkaTopic.TransactionOutputUnicast, {
        context: { ...this.messageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: casefileData,
      });

      // Update message body with new user info & forward to other clients
      this.message.body = newUserInfo;
      this.forwardMessageToOtherClients();

      this.logger.log(`${this.logContext} Transaction successful`);
    } catch (error) {
      this.logger.error(error);
      this.handleError(userId, casefileId);
    }
  }

  private async enhanceCacheWithNewUser(
    casefileData: ICachableCasefileForWhiteboard,
    newUserInfo: IUserForWhiteboard
  ): Promise<ICachableCasefileForWhiteboard> {
    // TODO: Remove me!
    console.log('Casefile Data');
    console.log(casefileData);

    // Add new connected user to casefile temporary data
    casefileData.temporary.activeUsers.add(newUserInfo);
    await this.cacheService.insertActiveUsers(casefileData.id, casefileData.temporary.activeUsers);
    return casefileData;
  }

  private async setupNewCasefileCache(
    casefileId: string,
    newUserInfo: IUserForWhiteboard
  ): Promise<ICachableCasefileForWhiteboard> {
    const casefileData = await this.databaseService.getCachableCasefileById(casefileId);

    // TODO: Remove me!
    console.log('Casefile Data');
    console.log(casefileData);

    casefileData.temporary.activeUsers.add(newUserInfo);

    await this.cacheService.saveCasefile(casefileData);
    this.logger.log(`${this.logContext} Successfully created new cache for casefile ${casefileId}`);
    return casefileData;
  }

  private handleError(nodeId: string, casefileId: string) {
    // TODO: Improve error handling with caching of transaction data & re-running mutations
    throw new InternalServerErrorException(`Could not add new user ${nodeId} to casefile ${casefileId}`);
  }
}
