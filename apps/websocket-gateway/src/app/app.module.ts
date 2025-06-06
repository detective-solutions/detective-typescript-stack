import { CacheService, DatabaseService, MessagePropagationService, WhiteboardTransactionFactory } from './services';
import { ClientsModule, ClientsModuleOptions } from '@nestjs/microservices';
import { DGraphGrpcClientEnvironment, DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { KafkaEventConsumer, KafkaEventProducer } from './kafka';
import { RedisClientEnvironment, RedisClientModule } from '@detective.solutions/backend/redis-client';

import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhiteboardWebSocketGateway } from './websocket';
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
    ClientsModule.register([kafkaConfig] as ClientsModuleOptions),
    JwtModule.register({}),
    ScheduleModule.forRoot(),
  ],
  controllers: [KafkaEventConsumer],
  providers: [
    KafkaEventProducer,
    WhiteboardWebSocketGateway,
    MessagePropagationService,
    CacheService,
    DatabaseService,
    WhiteboardTransactionFactory,
  ],
})
export class AppModule {}
