import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseService, EventCoordinatorService } from './services';
import { TransactionConsumer, TransactionProducer } from './kafka';

import { ConfigModule } from '@nestjs/config';
import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { Module } from '@nestjs/common';
import { defaultEnvConfig } from './default-env.config';
import { environment } from '@detective.solutions/backend/shared/environments';
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
    DGraphGrpcClientModule.register({
      stubs: [{ address: `${process.env.DATABASE_GRPC_SERVICE_NAME}:${process.env.DATABASE_GRPC_PORT}` }],
      debug: !environment.production,
    }),
  ],
  controllers: [TransactionConsumer],
  providers: [TransactionProducer, EventCoordinatorService, DatabaseService],
})
export class AppModule {}
