import { DynamicModule, Global, Module } from '@nestjs/common';
import { IRedisOMClientOptions, REDIS_OM_CLIENT_MODULE_OPTIONS } from './models';

import { ModuleRef } from '@nestjs/core';
import { RedisOMClientService } from './redis-om-client.service';

@Global()
@Module({
  providers: [RedisOMClientService],
  exports: [RedisOMClientService],
})
export class RedisOMClientModule {
  constructor(private readonly moduleRef: ModuleRef) {}

  static register(moduleOptions: IRedisOMClientOptions): DynamicModule {
    return {
      module: RedisOMClientModule,
      providers: [{ provide: REDIS_OM_CLIENT_MODULE_OPTIONS, useValue: moduleOptions }, RedisOMClientService],
      exports: [RedisOMClientService],
    };
  }
}
