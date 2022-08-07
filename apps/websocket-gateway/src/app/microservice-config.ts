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
      groupId: 'websocket-gateway-consumer',
    },
  },
};
