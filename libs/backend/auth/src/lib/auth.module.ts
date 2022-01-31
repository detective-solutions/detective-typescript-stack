import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
