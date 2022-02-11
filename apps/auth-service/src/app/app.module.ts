import { AuthModule, AuthService } from '@detective.solutions/backend/auth';

import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { defaultConfig } from './default.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: defaultConfig,
    }),
    AuthModule,
  ],
  providers: [AuthService],
  controllers: [AppController],
})
export class AppModule {}
