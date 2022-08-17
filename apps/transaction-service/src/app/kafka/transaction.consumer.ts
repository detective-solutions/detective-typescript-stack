import { Controller, Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { IKafkaMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { buildLogContext, validateDto } from '@detective.solutions/backend/shared/utils';

import { EventPattern } from '@nestjs/microservices';
import { MessageContextDTO } from '@detective.solutions/backend/shared/data-access';
import { TransactionCoordinationService } from '../services';
import { coordinationServiceInjectionToken } from '../utils';

@Controller()
export class TransactionConsumer {
  readonly logger = new Logger(TransactionConsumer.name);

  constructor(
    @Inject(coordinationServiceInjectionToken)
    private readonly coordinationService: TransactionCoordinationService
  ) {}

  @EventPattern(KafkaTopic.TransactionInput)
  async consumeTransactionInput(message: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(message.value?.context)} Consuming message ${message.offset} of type ${
        message.value.context?.eventType
      } (timestamp: ${message.timestamp})`
    );

    await this.validateConsumedMessage(message);
    this.coordinationService.createTransactionByEventType(message.value.context.eventType, message.value);
  }

  private async validateConsumedMessage(message: IKafkaMessage) {
    const context = message?.value?.context;
    if (!context) {
      throw new InternalServerErrorException('The consumed message is missing mandatory context information');
    }
    await validateDto(MessageContextDTO, context, this.logger);
  }
}
