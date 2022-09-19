import { ICasefileForWhiteboard, IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { Logger } from '@nestjs/common';
import { Transaction } from './abstract';

export class LoadWhiteboardDataTransaction extends Transaction {
  readonly logger = new Logger(LoadWhiteboardDataTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputUnicast;
  readonly maxRetries = 1;

  override message: IMessage<ICasefileForWhiteboard>; // Define message body type

  private retryCount = 0;

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    try {
      // No message body check, because it is empty on purpose and will be filled by this transaction
      const casefileId = this.messageContext.casefileId;
      const cacheExists = (await this.cacheService.isCasefileCached(casefileId)) as number;
      const casefileData = cacheExists
        ? await this.cacheService.getCasefileById(casefileId)
        : await this.handleMissingCache(casefileId);
      if (!casefileData) {
        throw new Error(`Could not fetch data for casefile ${casefileId}`);
      }

      this.message.body = casefileData; // Fill empty message payload body with casefile data
      this.forwardMessageToOtherClients();
    } catch (error) {
      this.handleError(error);
    }

    this.logger.log(`${this.logContext} Transaction successful`);
  }

  private async handleMissingCache(casefileId: string): Promise<ICasefileForWhiteboard> {
    const casefileData = await this.databaseService.getCasefileById(casefileId);
    await this.cacheService.saveCasefile(casefileData);
    return casefileData;
  }

  private handleError(error) {
    this.logger.error(error);
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.execute();
    }
  }
}
