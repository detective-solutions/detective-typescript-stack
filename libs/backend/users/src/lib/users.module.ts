import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { environment } from '@detective.solutions/backend/shared/environments';

@Module({
  imports: [
    DGraphGrpcClientModule.register({
      stubs: [{ address: `${process.env.DATABASE_GRPC_SERVICE_NAME}:${process.env.DATABASE_GRPC_PORT}` }],
      debug: !environment.production,
    }),
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
