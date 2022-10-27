import { KafkaOptions, MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { kafkaConfig } from './app/kafka-config';

async function bootstrap() {
  console.log(); // TODO: Remove me!
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, kafkaConfig as KafkaOptions);
  await app.listen();
  Logger.log(`🚀 Application is running and listening to port ${app.get(ConfigService).get('KAFKA_PORT')} (Kafka)`);
}

bootstrap();
