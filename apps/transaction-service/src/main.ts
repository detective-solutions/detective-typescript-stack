import { KafkaOptions, MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { microserviceConfig } from './app/microservice-config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, microserviceConfig as KafkaOptions);
  await app.listen();

  const kafkaPort = app.get(ConfigService).get('KAFKA_PORT');
  Logger.log(`🚀 Application is running and listening to port ${kafkaPort} (Kafka)`);
}

bootstrap();
