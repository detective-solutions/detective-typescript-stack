import { IMessage, IWhiteboardNodeBlockUpdate, KafkaTopic } from '@detective.solutions/shared/data-access';
import { Logger } from '@nestjs/common';

import { Transaction } from './abstract';

export class WhiteboardUserLeftTransaction extends Transaction {
  readonly logger = new Logger(WhiteboardUserLeftTransaction.name);
  readonly targetTopic = KafkaTopic.TransactionOutputBroadcast;

  override message: IMessage<IWhiteboardNodeBlockUpdate>; // Define message body type

  async execute(): Promise<void> {
    this.logger.log('');
  }
}
