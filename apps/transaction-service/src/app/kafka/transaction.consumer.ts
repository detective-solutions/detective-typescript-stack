import { Controller, Inject, Logger } from '@nestjs/common';

import { EventPattern } from '@nestjs/microservices';
import { IKafkaMessage } from '@detective.solutions/shared/data-access';
import { TransactionCoordinationService } from '../services';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';
import { coordinationServiceInjectionToken } from '../utils';

@Controller()
export class TransactionConsumer {
  private readonly logger = new Logger(TransactionConsumer.name);

  constructor(
    @Inject(coordinationServiceInjectionToken)
    private readonly coordinationService: TransactionCoordinationService
  ) {}

  @EventPattern('transaction_input')
  consumeTransactionInput(data: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(data.value.context)} Consuming message ${data.offset} from topic ${
        data.topic
      } with timestamp ${data.timestamp}`
    );
    console.log('INCOMING DATA:', data);
    this.coordinationService.handleTransactionByType(data.value.context.eventType, data.value);
  }
}
