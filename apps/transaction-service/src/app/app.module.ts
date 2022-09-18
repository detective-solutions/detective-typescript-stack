import { ClientsModule, ClientsModuleOptions } from '@nestjs/microservices';
import { DGraphGrpcClientEnvironment, DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { DatabaseService, TransactionCoordinationService } from './services';
import { RedisOMClientEnvironment, RedisOMClientModule } from '@detective.solutions/backend/redis-om-client';
import { TransactionConsumer, TransactionProducer } from './kafka';

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
    RedisOMClientModule.register({
      address: `${process.env[RedisOMClientEnvironment.REDIS_SERVICE_NAME]}:${
        process.env[RedisOMClientEnvironment.REDIS_PORT]
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
  controllers: [TransactionConsumer],
  providers: [
    TransactionProducer,
    { provide: coordinationServiceInjectionToken, useClass: TransactionCoordinationService },
    DatabaseService,
    WhiteboardTransactionFactory,
  ],
})
export class AppModule {}
