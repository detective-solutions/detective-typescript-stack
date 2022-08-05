import { BadRequestException, Controller, Inject, Logger } from '@nestjs/common';
import { IKafkaMessage, KafkaTopic } from '@detective.solutions/shared/data-access';

import { EventPattern } from '@nestjs/microservices';
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

  @EventPattern(KafkaTopic.TransactionInput)
  consumeTransactionInput(message: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(message.value?.context)} Consuming message ${message.offset} of type ${
        message.value.context?.eventType
      } (timestamp: ${message.timestamp})`
    );

    this.validateConsumedMessage(message);
    this.coordinationService.createTransactionByEventType(message.value.context.eventType, message.value);
  }

  private validateConsumedMessage(message: IKafkaMessage) {
    const context = message?.value?.context;
    if (!context) {
      throw new BadRequestException('The consumed message is missing mandatory context information');
    }
    if (!context.eventType) {
      throw new BadRequestException('The consumed message context is missing an event type and cannot be processed');
    }
  }
}
