import { Inject, Injectable, Logger } from '@nestjs/common';

import { ClientKafka } from '@nestjs/microservices';
import { IMessage } from '@detective.solutions/shared/data-access';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WhiteboardProducer {
  private readonly logger = new Logger(WhiteboardProducer.name);

  constructor(@Inject('CLIENT_KAFKA') private readonly client: ClientKafka) {}

  sendKafkaMessage(topicName: string, payload: IMessage<any>) {
    this.logger.debug(`${buildLogContext(payload.context)} Forwarding Kafka message to topic ${topicName}`);
    this.client.emit(topicName, payload);
  }
}
