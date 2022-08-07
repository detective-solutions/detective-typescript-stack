import { ClientsModule, ClientsModuleOptions } from '@nestjs/microservices';
import { DatabaseService, TransactionCoordinationService } from './services';
import { TransactionConsumer, TransactionProducer } from './kafka';

import { ConfigModule } from '@nestjs/config';
import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { Module } from '@nestjs/common';
import { WhiteboardTransactionFactory } from './transactions';
import { coordinationServiceInjectionToken } from './utils';
import { defaultEnvConfig } from './default-env.config';
import { environment } from '@detective.solutions/backend/shared/environments';
import { microserviceConfig } from './microservice-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: defaultEnvConfig,
    }),
    ClientsModule.register([microserviceConfig] as ClientsModuleOptions),
    DGraphGrpcClientModule.register({
      stubs: [{ address: `${process.env.DATABASE_GRPC_SERVICE_NAME}:${process.env.DATABASE_GRPC_PORT}` }],
      debug: !environment.production,
    }),
  ],
  controllers: [TransactionConsumer],
  providers: [
    TransactionProducer,
    { provide: coordinationServiceInjectionToken, useClass: TransactionCoordinationService },
    DatabaseService,
    WhiteboardTransactionFactory,
  ],
})
export class AppModule {}
