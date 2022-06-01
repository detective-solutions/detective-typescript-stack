import { Client, ClientKafka, Transport } from '@nestjs/microservices';

import { Injectable } from '@nestjs/common';
import { Message } from '../models';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WhiteboardProducer {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: [`${process.env.KAFKA_SERVICE_NAME}:${process.env.KAFKA_PORT}`] },
    },
  })
  client: ClientKafka;

  sendKafkaMessage(topicName: string, payload: Message<any>) {
    // TODO: Add logging according to standard layout (incl. context etc.)
    this.client.emit(topicName, payload);
  }
}
