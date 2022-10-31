import { DynamicModule, Global, Module } from '@nestjs/common';
import { IRedisClientOptions, REDIS_CLIENT_MODULE_OPTIONS } from './models';

import { RedisClientService } from './redis-client.service';

@Global()
@Module({
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {
  static register(moduleOptions: IRedisClientOptions): DynamicModule {
    return {
      module: RedisClientModule,
      providers: [{ provide: REDIS_CLIENT_MODULE_OPTIONS, useValue: moduleOptions }, RedisClientService],
      exports: [RedisClientService],
    };
  }
}
