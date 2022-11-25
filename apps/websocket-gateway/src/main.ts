import { KafkaOptions, MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { kafkaConfig } from './app/kafka-config';

async function bootstrap() {
  console.log(); // TODO: REMOVE ME
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, kafkaConfig as KafkaOptions);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen();
  Logger.log(
    `🚀 Application is running on port 7777 (WebSockets) and listening to port ${app
      .get(ConfigService)
      .get('KAFKA_PORT')} (Kafka)`
  );
}

bootstrap();
