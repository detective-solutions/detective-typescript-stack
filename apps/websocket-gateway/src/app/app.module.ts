import { ClientsModule, ClientsModuleOptions } from '@nestjs/microservices';
import { RedisClientEnvironment, RedisClientModule } from '@detective.solutions/backend/redis-client';
import { WhiteboardEventConsumer, WhiteboardEventProducer } from './events';

import { AuthModule } from '@detective.solutions/backend/auth';
import { ConfigModule } from '@nestjs/config';
import { MessagePropagationService } from './services';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhiteboardWebSocketGateway } from './websocket';
import { defaultEnvConfig } from './default-env.config';
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
    AuthModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [WhiteboardEventConsumer],
  providers: [WhiteboardEventProducer, WhiteboardWebSocketGateway, MessagePropagationService],
})
export class AppModule {}
