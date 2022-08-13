import { KafkaOptions, MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { microserviceConfig } from './app/microservice-config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, microserviceConfig as KafkaOptions);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen();
  Logger.log(
    `🚀 Application is running on port 7777 (WebSockets) and listening to port ${app
      .get(ConfigService)
      .get('KAFKA_PORT')} (Kafka)`
  );
}

bootstrap();
