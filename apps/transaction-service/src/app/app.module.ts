import { CacheService, DatabaseService, TransactionCoordinationService } from './services';
import { ClientsModule, ClientsModuleOptions } from '@nestjs/microservices';
import { DGraphGrpcClientEnvironment, DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { RedisClientEnvironment, RedisClientModule } from '@detective.solutions/backend/redis-client';
import { TransactionEventConsumer, TransactionEventProducer } from './events';

import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { WhiteboardTransactionFactory } from './transactions';
import { coordinationServiceInjectionToken } from './utils';
import { defaultEnvConfig } from './default-env.config';
import { environment } from '@detective.solutions/backend/shared/environments';
import { kafkaConfig } from './kafka-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: defaultEnvConfig,
    }),
    ClientsModule.register([kafkaConfig] as ClientsModuleOptions),
    RedisClientModule.register({
      address: `${process.env[RedisClientEnvironment.REDIS_SERVICE_NAME]}:${
        process.env[RedisClientEnvironment.REDIS_PORT]
      }`,
    }),
    DGraphGrpcClientModule.register({
      stubs: [
        {
          address: `${process.env[DGraphGrpcClientEnvironment.DATABASE_SERVICE_NAME]}:${
            process.env[DGraphGrpcClientEnvironment.DATABASE_PORT]
          }`,
        },
      ],
      debug: !environment.production,
    }),
  ],
  controllers: [TransactionEventConsumer],
  providers: [
    TransactionEventProducer,
    { provide: coordinationServiceInjectionToken, useClass: TransactionCoordinationService },
    CacheService,
    DatabaseService,
    WhiteboardTransactionFactory,
  ],
})
export class AppModule {}
