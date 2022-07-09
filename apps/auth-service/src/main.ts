import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

import { AppModule } from './app/app.module';
import { NestFactory } from '@nestjs/core';
import { environment } from '@detective.solutions/backend/shared/environments';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }), {
    cors: environment.production ? false : true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      disableErrorMessages: environment.production,
    })
  );

  const port = 7777;
  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Application is running on port ${port}`);
}

bootstrap();
