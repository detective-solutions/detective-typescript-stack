import { AuthModule, AuthService } from '@detective.solutions/backend/auth';

import { AppController } from './app.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule],
  providers: [AuthService],
  controllers: [AppController],
})
export class AppModule {}
