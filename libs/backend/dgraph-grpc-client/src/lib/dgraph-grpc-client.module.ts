import { DGRAPH_MODULE_OPTIONS, IDGraphGrpcClientOptions } from './models';
import { DynamicModule, Module } from '@nestjs/common';

import { DGraphGrpcClientService } from './dgraph-grpc-client.service';
import { ModuleRef } from '@nestjs/core';

@Module({})
export class DGraphGrpcClientModule {
  constructor(private readonly moduleRef: ModuleRef) {}

  static register(moduleOptions: IDGraphGrpcClientOptions): DynamicModule {
    return {
      module: DGraphGrpcClientModule,
      providers: [{ provide: DGRAPH_MODULE_OPTIONS, useValue: moduleOptions }, DGraphGrpcClientService],
      exports: [DGraphGrpcClientService],
    };
  }

  async onModuleDestroy() {
    const service = this.moduleRef.get<DGraphGrpcClientService>(DGraphGrpcClientService);
    service.close();
  }
}
