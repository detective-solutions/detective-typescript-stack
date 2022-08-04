import { Controller, Logger } from '@nestjs/common';

import { EventCoordinatorService } from '../services';
import { EventPattern } from '@nestjs/microservices';
import { IKafkaMessage } from '@detective.solutions/shared/data-access';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

@Controller()
export class TransactionConsumer {
  private readonly logger = new Logger(TransactionConsumer.name);

  constructor(private readonly eventCoordinatorService: EventCoordinatorService) {}

  @EventPattern('transaction_input')
  consumeTransactionInput(data: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(data.value.context)} Consuming message ${data.offset} from topic ${
        data.topic
      } with timestamp ${data.timestamp}`
    );
    console.log('INCOMING DATA:', data);
    this.eventCoordinatorService.handleTransactionByType(data.value.context.eventType, data.value);
  }
}
