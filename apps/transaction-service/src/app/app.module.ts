import { ClientsModule, Transport } from '@nestjs/microservices';
import { TransactionConsumer, TransactionProducer } from './kafka';

import { AppService } from './services';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { defaultEnvConfig } from './default-env.config';
import { kafkaClientInjectionToken } from './utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: defaultEnvConfig,
    }),
    ClientsModule.register([
      {
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
      },
    ]),
  ],
  controllers: [TransactionConsumer],
  providers: [TransactionProducer, AppService],
})
export class AppModule {}
