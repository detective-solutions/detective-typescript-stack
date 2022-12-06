import { CacheService, DatabaseService, MessagePropagationService, TransactionCoordinationService } from './services';
import { ClientsModule, ClientsModuleOptions } from '@nestjs/microservices';
import { DGraphGrpcClientEnvironment, DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { RedisClientEnvironment, RedisClientModule } from '@detective.solutions/backend/redis-client';
import { WhiteboardEventConsumer, WhiteboardEventProducer } from './events';

import { AuthModule } from '@detective.solutions/backend/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhiteboardTransactionFactory } from './transaction';
import { WhiteboardWebSocketGateway } from './websocket';
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
    AuthModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [WhiteboardEventConsumer],
  providers: [
    WhiteboardEventProducer,
    WhiteboardWebSocketGateway,
    MessagePropagationService,
    { provide: coordinationServiceInjectionToken, useClass: TransactionCoordinationService },
    CacheService,
    DatabaseService,
    WhiteboardTransactionFactory,
  ],
})
export class AppModule {}
