import { BackendUsersService } from './backend-users.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [],
  providers: [BackendUsersService],
  exports: [BackendUsersService],
})
export class BackendUsersModule {}
