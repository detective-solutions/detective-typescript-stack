import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { environment } from '@detective.solutions/backend/shared/environments';

@Module({
  imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'localhost:9080' }], debug: environment.production })],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
