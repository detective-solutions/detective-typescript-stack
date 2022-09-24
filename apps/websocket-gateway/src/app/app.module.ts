import { ClientsModule, ClientsModuleOptions } from '@nestjs/microservices';
import { WhiteboardEventConsumer, WhiteboardEventProducer } from './events';

import { AuthModule } from '@detective.solutions/backend/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { WhiteboardWebSocketGateway } from './websocket';
import { defaultEnvConfig } from './default-env.config';
import { microserviceConfig } from './microservice-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: defaultEnvConfig,
    }),
    ClientsModule.register([microserviceConfig] as ClientsModuleOptions),
    AuthModule,
  ],
  controllers: [WhiteboardEventConsumer],
  providers: [WhiteboardEventProducer, WhiteboardWebSocketGateway],
})
export class AppModule {}
