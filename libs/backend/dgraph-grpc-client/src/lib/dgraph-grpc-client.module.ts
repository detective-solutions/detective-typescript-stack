import { DynamicModule, Module } from '@nestjs/common';

import { DGRAPH_MODULE_OPTIONS } from './dgraph-grpc-client.constants';
import { DGraphGrpcClientOptions } from './interfaces';
import { DGraphGrpcClientService } from './dgraph-grpc-client.service';
import { ModuleRef } from '@nestjs/core';

@Module({})
export class DGraphGrpcClientModule {
  constructor(private readonly moduleRef: ModuleRef) {}

  static register(options: DGraphGrpcClientOptions): DynamicModule {
    return {
      module: DGraphGrpcClientModule,
      providers: [{ provide: DGRAPH_MODULE_OPTIONS, useValue: options }, DGraphGrpcClientService],
      exports: [DGraphGrpcClientService],
    };
  }

  async onModuleDestroy() {
    const service = this.moduleRef.get<DGraphGrpcClientService>(DGraphGrpcClientService);
    service.close();
  }
}
