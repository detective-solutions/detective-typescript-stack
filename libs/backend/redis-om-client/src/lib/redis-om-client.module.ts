import { DynamicModule, Global, Module } from '@nestjs/common';
import { IRedisClientOptions, REDIS_CLIENT_MODULE_OPTIONS } from './models';

import { ModuleRef } from '@nestjs/core';
import { RedisOMClientService } from './redis-om-client.service';

@Global()
@Module({
  providers: [RedisOMClientService],
  exports: [RedisOMClientService],
})
export class RedisOMClientModule {
  constructor(private readonly moduleRef: ModuleRef) {}

  static register(options: IRedisClientOptions): DynamicModule {
    return {
      module: RedisOMClientModule,
      providers: [{ provide: REDIS_CLIENT_MODULE_OPTIONS, useValue: options }, RedisOMClientService],
      exports: [RedisOMClientService],
    };
  }
}
