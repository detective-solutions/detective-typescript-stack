import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { microserviceConfig } from './app/microservice-config';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, microserviceConfig);
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen();
  Logger.log('🚀 Application is running'); // TODO: App port info from env into log message
}

bootstrap();
