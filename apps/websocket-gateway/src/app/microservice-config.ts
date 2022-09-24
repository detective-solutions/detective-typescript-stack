import { Transport } from '@nestjs/microservices';
import { kafkaClientInjectionToken } from './utils';

export const microserviceConfig = {
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
      groupId:
        // Currently, each gateway needs to be in its own consumer group!
        // This way it can be ensured that each gateway consumes all incoming events and has the chance to forward
        // them to connected webclients within an applicable context
        process.env.KAFKA_CONSUMER_GROUP_ID ?? `websocket-gateway-consumer-group-${Math.floor(Math.random() * 12)}`,
    },
  },
};
