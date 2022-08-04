import { Logger, applyDecorators } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { microserviceConfig } from './app/microservice-config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, microserviceConfig);
  await app.listen();

  const kafkaPort = app.get(ConfigService).get('KAFKA_PORT');
  Logger.log(`🚀 Application is running and listening to port ${kafkaPort} (Kafka)`);
}

bootstrap();
