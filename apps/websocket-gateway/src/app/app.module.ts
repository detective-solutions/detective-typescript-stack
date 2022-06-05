import { AuthModule } from '@detective.solutions/backend/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { WhiteboardConsumer } from './kafka/whiteboard.consumer';
import { WhiteboardProducer } from './kafka/whiteboard.producer';
import { WhiteboardWebSocketGateway } from './websocket/whiteboard-websocket.gateway';
import { defaultEnvConfig } from './default-env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: defaultEnvConfig,
    }),
    AuthModule,
  ],
  controllers: [WhiteboardConsumer],
  providers: [WhiteboardProducer, WhiteboardWebSocketGateway],
})
export class AppModule {}
