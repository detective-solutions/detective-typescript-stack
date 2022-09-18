import { Transport } from '@nestjs/microservices';
import { kafkaClientInjectionToken } from './utils';

export const kafkaConfig = {
  name: kafkaClientInjectionToken,
  transport: Transport.KAFKA,
  options: {
    client: {
      clientId: 'transaction-service',
      brokers: [`${process.env.KAFKA_SERVICE_NAME}:${process.env.KAFKA_PORT}`],
      retry: {
        retries: +process.env.KAFKA_CONNECTION_RETRIES,
      },
    },
    consumer: {
      groupId: 'transaction-service-consumer',
    },
  },
};
