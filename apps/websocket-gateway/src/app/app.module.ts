import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { KafkaAdapterModule } from './kafka-adapter/kafka-adapter.module';
import { Module } from '@nestjs/common';
import { MouseMirrorModule } from './mouse-mirror/mouse-mirror.module';
import { defaultEnvConfig } from './default-env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: defaultEnvConfig,
    }),
    KafkaAdapterModule,
    MouseMirrorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
