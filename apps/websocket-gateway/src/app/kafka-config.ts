import { Transport } from '@nestjs/microservices';
import { kafkaClientInjectionToken } from './utils';

export const kafkaConfig = {
  name: kafkaClientInjectionToken,
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'websocket-gateway',
      brokers: [`${process.env.KAFKA_SERVICE_NAME}:${process.env.KAFKA_PORT}`],
      retry: {
        retries: +process.env.KAFKA_CONNECTION_RETRIES,
      },
    },
    consumer: {
      groupId: process.env.KAFKA_CONSUMER_GROUP_ID ?? 'websocket-gateway-consumer-group',
    },
  },
};
