import { ICasefileForWhiteboard, IMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { Logger } from '@nestjs/common';
import { Transaction } from './abstract';

export class LoadWhiteboardDataTransaction extends Transaction {
  readonly logger = new Logger(LoadWhiteboardDataTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputUnicast;

  override message: IMessage<ICasefileForWhiteboard>; // Define message body type

  private readonly retryInterval = 1000;
  private readonly maxRetries = 3;
  private retryCount = 0;

  async execute(): Promise<void> {
    this.logger.log(`${this.logContext} Executing transaction`);

    try {
      const casefileId = this.messageContext.casefileId;
      const casefileData = await this.databaseService.getCasefileById(casefileId);
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
    if (this.retryCount <= this.maxRetries) {
      setTimeout(() => {
        this.retryCount++;
        this.execute();
      }, this.retryInterval);
    }
  }
}
