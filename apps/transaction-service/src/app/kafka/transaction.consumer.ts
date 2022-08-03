import { Controller, Logger } from '@nestjs/common';

import { EventPattern } from '@nestjs/microservices';
import { IKafkaMessage } from '@detective.solutions/shared/data-access';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

@Controller()
export class TransactionConsumer {
  private readonly logger = new Logger(TransactionConsumer.name);

  @EventPattern('transaction')
  forwardQueryExecution(data: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(data.value.context)} Consuming message ${data.offset} from topic ${
        data.topic
      } with timestamp ${data.timestamp}`
    );
  }
}
