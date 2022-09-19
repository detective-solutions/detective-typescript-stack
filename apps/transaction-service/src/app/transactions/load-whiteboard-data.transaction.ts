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
      let casefileData = await this.cacheService.loadCasefile(casefileId);

      this.logger.verbose('CACHED DATA:');
      this.logger.verbose(casefileData);

      if (!casefileData) {
        casefileData = await this.databaseService.getCasefileById(casefileId);
        this.cacheService.saveCasefile(casefileData);
      }
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

  private handleError(error) {
    this.logger.error(error);
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.execute();
    }
  }
}
