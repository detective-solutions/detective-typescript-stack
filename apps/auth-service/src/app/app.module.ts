import { AppController } from './app.controller';
import { AuthModule } from '@detective.solutions/backend/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
})
export class AppModule {}
