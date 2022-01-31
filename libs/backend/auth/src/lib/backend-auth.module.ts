import { BackendAuthService } from './backend-auth.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [],
  providers: [BackendAuthService],
  exports: [BackendAuthService],
})
export class BackendAuthModule {}
