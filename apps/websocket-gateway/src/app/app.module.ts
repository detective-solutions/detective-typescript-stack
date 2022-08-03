import { ClientsModule, Transport } from '@nestjs/microservices';
import { WhiteboardConsumer, WhiteboardProducer } from './kafka';

import { AuthModule } from '@detective.solutions/backend/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { WhiteboardWebSocketGateway } from './websocket';
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
            brokers: [`${process.env.KAFKA_SERVICE_NAME}:${process.env.KAFKA_PORT}`],
            retry: {
              retries: 30,
            },
          },
          consumer: {
            groupId: 'websocket-gateway',
          },
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [WhiteboardConsumer],
  providers: [WhiteboardProducer, WhiteboardWebSocketGateway],
})
export class AppModule {}
