import { Inject, Injectable, Logger } from '@nestjs/common';

import { ClientKafka } from '@nestjs/microservices';
import { IMessage } from '@detective.solutions/shared/data-access';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';
import { kafkaClientInjectionToken } from '../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WhiteboardEventProducer {
  private readonly logger = new Logger(WhiteboardEventProducer.name);

  constructor(@Inject(kafkaClientInjectionToken) private readonly client: ClientKafka) {}

  sendKafkaMessage(topicName: string, payload: IMessage<any>) {
    this.logger.verbose(`${buildLogContext(payload.context)} Forwarding Kafka message to topic ${topicName}`);
    this.client.emit(topicName, payload);
  }
}
