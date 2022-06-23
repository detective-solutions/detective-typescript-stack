import { Client, ClientKafka, Transport } from '@nestjs/microservices';
import { Injectable, Logger } from '@nestjs/common';

import { IMessage } from '@detective.solutions/shared/data-access';
import { buildLogContext } from '../utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WhiteboardProducer {
  private readonly logger = new Logger(WhiteboardProducer.name);

  @Client({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: [`${process.env.KAFKA_SERVICE_NAME}:${process.env.KAFKA_PORT}`] },
    },
  })
  client: ClientKafka;

  sendKafkaMessage(topicName: string, payload: IMessage<any>) {
    this.logger.debug(`${buildLogContext(payload.context)} Forwarding Kafka message to topic ${topicName}`);
    this.client.emit(topicName, payload);
  }
}
